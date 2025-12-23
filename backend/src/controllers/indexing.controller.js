const fs = require("fs");
const csv = require("csv-parser");
const IndexingJob = require("../models/IndexingJob");
const { indexingQueue } = require("../queues/indexing.queue");
const { logger } = require("../utils/logger");
const User = require("../models/User")

const normalizeUrl = (url) => {
  if (!url) return null;
  let cleanUrl = url.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    return `https://${cleanUrl}`;
  }
  return cleanUrl;
};

const processBulkUpload = (filePath, req, res, next) => {
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      const url = data.url || Object.values(data)[0];
      if (url) results.push(normalizeUrl(url));
    })
    .on("end", async () => {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        if (results.length === 0) {
          return res.status(400).json({ success: false, message: "CSV is empty or invalid" });
        }

        const userId = req.user ? req.user._id : null;
        const { pingGSC, updateSitemap } = req.body;

        const jobDocuments = results.map((url) => ({
          user: userId,
          url: url,
          options: {
            pingGSC: pingGSC === 'true' || pingGSC === true,
            updateSitemap: updateSitemap === 'true' || updateSitemap === true
          },
          status: "queued"
        }));

        const savedJobs = await IndexingJob.insertMany(jobDocuments);

        logger.info(`Adding ${savedJobs.length} jobs to queue...`);

        for (const job of savedJobs) {
          await indexingQueue.add("index-url", {
            jobId: String(job._id)
          });
        }

        logger.info(`Bulk Indexing: ${savedJobs.length} jobs created by user ${userId}`);

        return res.status(201).json({
          success: true,
          message: `Successfully queued ${savedJobs.length} URLs`,
          count: savedJobs.length,
          jobId: savedJobs[0]._id,
          mode: "bulk"
        });

      } catch (err) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        next(err);
      }
    })
    .on("error", (err) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      next(err);
    });
};

const submitIndexingJob = async (req, res, next) => {
  try {
    if (req.file) {
      return processBulkUpload(req.file.path, req, res, next);
    }

    let { url, pingGSC, updateSitemap } = req.body;

    if (!url) {
      const err = new Error("URL is required");
      err.statusCode = 400;
      throw err;
    }

    url = normalizeUrl(url);

    const job = await IndexingJob.create({
      user: req.user ? req.user._id : null,
      url,
      options: { pingGSC, updateSitemap },
    });

    await indexingQueue.add("index-url", {
      jobId: String(job._id),
    });

    logger.info(`Indexing job queued: ${job._id} | ${url}`);

    res.status(201).json({
      success: true,
      jobId: job._id,
      status: "queued",
      url,
      mode: "single"
    });
  } catch (err) {
    next(err);
  }
};
const normalizeLogs = (logs = []) => {
  return logs.map((log) => {
    let message = "";

    if (log.message) {
      message = log.message;
    } else if (typeof log.data === "string") {
      message = log.data;
    } else if (typeof log.data === "object" && log.data !== null) {
      message = JSON.stringify(log.data);
    } else {
      message = "Log message unavailable";
    }

    return {
      type: log.type || "info",
      message,
      time: log.time || new Date().toLocaleTimeString(),
    };
  });
};

const getIndexingLogs = async (req, res, next) => {
  try {
    const job = await IndexingJob.findById(req.params.jobId).lean();

    if (!job) {
      const err = new Error("Job not found");
      err.statusCode = 404;
      throw err;
    }

    res.json({
      success: true,
      jobId: job._id,
      status: job.status,
      summary: {
        mode: job.options?.pingGSC ? "direct" : "suggestion",
        ownerRequired: job.options?.pingGSC === true,
        finalDecision: "Google",
      },
      logs: normalizeLogs(job.logs),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

const getRecentIndexingJobs = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const jobs = await IndexingJob.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
    res.json({
      success: true,
      jobs: jobs.map((job) => ({
        jobId: job._id,
        url: job.url,
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User session not found" });
    }

    const [statsAgg, recentActivity, userData] = await Promise.all([
      IndexingJob.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      IndexingJob.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("url status createdAt")
        .lean(),
      User.findById(userId).select("credits").lean()
    ]);

    let stats = { totalIndexed: 0, pending: 0, failed: 0 };

    statsAgg.forEach((s) => {
      if (["submitted", "signals_sent", "done"].includes(s._id)) {
        stats.totalIndexed += s.count;
      } else if (["queued", "processing"].includes(s._id)) {
        stats.pending += s.count;
      } else if (s._id === "failed") {
        stats.failed += s.count;
      }
    });

    res.json({
      success: true,
      stats: {
        ...stats,
        credits: userData?.credits || 0,
      },
      recentActivity: recentActivity || []
    });

  } catch (err) {
    console.error("DASHBOARD_CONTROLLER_ERROR:", err);
    next(err);
  }
};

module.exports = {
  submitIndexingJob,
  getIndexingLogs,
  getRecentIndexingJobs,
  getDashboardStats,
};
