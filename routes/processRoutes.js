// --------------------------
// routes/processRoutes.js
// --------------------------
const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middleware/uploadMiddleware");
const processController = require("../controller/processController");

router.post("/", uploadMiddleware.single("video"), processController.handleProcess);

module.exports = router;