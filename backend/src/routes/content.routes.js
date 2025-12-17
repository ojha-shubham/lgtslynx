const express = require("express");
const {
  generateContentStrategy,
} = require("../controllers/content.controller");

const router = express.Router();
router.post("/strategy", generateContentStrategy);

module.exports = router;
