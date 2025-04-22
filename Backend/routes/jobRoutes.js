// routes/jobRoutes.js
const express = require("express");
const { getJobProgress } = require("../controller/jobController");

const router = express.Router();

router.get("/:id/progress", getJobProgress);

module.exports = router;
