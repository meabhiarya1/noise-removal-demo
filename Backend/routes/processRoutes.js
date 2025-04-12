// --------------------------
// routes/processRoutes.js
// --------------------------
const express = require("express");
const router = express.Router();
// const uploadMiddleware = require("../middleware/uploadMiddleware");
const { handleProcess } = require("../controller/processController");

// router.post("/", uploadMiddleware.single("video"), handleProcess);

module.exports = router;
