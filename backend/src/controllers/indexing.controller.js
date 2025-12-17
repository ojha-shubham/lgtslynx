const IndexingJob = require("../models/IndexingJob");
const { indexingQueue } = require("../queues/indexing.queue");
const { logger } = require("../utils/logger");


const submitIndexingJob = async (req, res, next) => {
  try {
    const { url, pingGSC, updateSitemap } = req.body;

    if (!url) {
      const err = new Error("URL is required");
      err.statusCode = 400;
      throw err;
    }

    const job = await IndexingJob.create({
      url,
      options: { pingGSC, updateSitemap },
    });

    await indexingQueue.add("index-url", {
      jobId: job._id,
    });

    logger.info(`Indexing job queued: ${job._id}`);

    res.status(201).json({
      success: true,
      jobId: job._id,
      status: "queued",
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

module.exports = {
  submitIndexingJob,
  getIndexingLogs,
};
