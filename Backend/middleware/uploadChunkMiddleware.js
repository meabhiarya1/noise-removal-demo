// --------------------------
// middleware/uploadChunkMiddleware.js
// --------------------------

const multer = require("multer");
const { saveChunk } = require("../services/saveChunk");
const { mergeChunks } = require("../services/mergeChunks");
const fs = require("fs");
const path = require("path");

const CHUNKS_DIR = path.join(__dirname, "..", "video_chunks");
if (!fs.existsSync(CHUNKS_DIR)) {
  fs.mkdirSync(CHUNKS_DIR);
}

const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("video"); // MUST be 'video'

const uploadChunkMiddleware = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("❌ Multer error:", err);
      return res.status(405).json({ success: false, message: err.message });
    }

    try {
      const { chunkIndex, totalChunks, uploadId, fileName } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Missing file" });
      }

      if (!chunkIndex || !totalChunks || !uploadId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing fields" });
      }

      const parsedChunkIndex = parseInt(chunkIndex);
      const parsedTotalChunks = parseInt(totalChunks);
      const originalFileName = fileName || `video_${uploadId}.mp4`;
      const videoFolder = path.join(CHUNKS_DIR, uploadId);

      await saveChunk(videoFolder, parsedChunkIndex, req.file.buffer);
      const uploadedChunks = fs.readdirSync(videoFolder).length;

      if (uploadedChunks === parsedTotalChunks) {
        const finalVideoPath = path.join(
          videoFolder,
          `${timestamp}_${originalFileName}`
        );
        await mergeChunks(videoFolder, finalVideoPath, parsedTotalChunks);

        // ✅ Attach merged file path to req
        req.finalVideoPath = finalVideoPath;
        req.uploadId = uploadId;
        req.originalFileName = originalFileName;

        console.log(finalVideoPath, uploadId, originalFileName)

        return next(); // ✅ Go to handleProcess controller
      } else {
        return res.status(200).json({
          success: true,
          message: `Chunk ${parsedChunkIndex + 1} uploaded.`,
          uploadId,
        });
      }
    } catch (error) {
      console.error("🔥 Middleware Error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
};

module.exports = { uploadChunkMiddleware };
