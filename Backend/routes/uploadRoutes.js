// --------------------------
// routes/uploadRoutes.js
// --------------------------
const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const {
  handleChunkUpload,
} = require("../controller/chunkUploadController");

router.post("/upload-chunk", upload.single("chunk"), handleChunkUpload);

module.exports = router;
