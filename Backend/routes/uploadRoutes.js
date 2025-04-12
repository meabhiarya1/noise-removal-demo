// --------------------------
// routes/uploadRoutes.js
// --------------------------
const express = require("express");
const router = express.Router();
const {
  uploadChunkMiddleware,
} = require("../middleware/uploadChunkMiddleware");
const { handleProcess } = require("../controller/processController");

router.post("/upload-chunk", uploadChunkMiddleware, handleProcess);

module.exports = router;
