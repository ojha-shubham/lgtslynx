const express = require("express");
const {
  submitIndexingJob,
  getIndexingLogs,
  getRecentIndexingJobs,
  getDashboardStats,
} = require("../controllers/indexing.controller");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

router.post("/submit", upload.single("file"), submitIndexingJob);
router.get("/logs/:jobId", getIndexingLogs);
router.get("/recent", getRecentIndexingJobs);
router.get("/dashboard", getDashboardStats);

module.exports = router;
