// --------------------------
// routes/uploadRoutes.js
// --------------------------
const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadChunkMiddleware");
const {
  handleChunkUpload,
} = require("../controller/chunkUploadController");

router.post("/upload-chunk", handleChunkUpload);

module.exports = router;
