const multer = require("multer");
const { saveChunk } = require("../services/saveChunk");
const { mergeChunks } = require("../services/mergeChunks");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const CHUNKS_DIR = path.join(__dirname, "..", "video_chunks");
if (!fs.existsSync(CHUNKS_DIR)) {
  fs.mkdirSync(CHUNKS_DIR);
  console.log("📁 Created CHUNKS_DIR:", CHUNKS_DIR);
}

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("video"); // MUST be 'video'

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
          .json({ success: false, message: "Missing video file buffer." });
      }

      if (
        !chunkIndex ||
        !totalChunks ||
        !uploadId ||
        isNaN(chunkIndex) ||
        isNaN(totalChunks)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing or invalid fields. Required: chunkIndex, totalChunks, uploadId.",
        });
      }

      const parsedChunkIndex = parseInt(chunkIndex, 10);
      const parsedTotalChunks = parseInt(totalChunks, 10);
      const originalFileName = fileName || `video_${uploadId}.mp4`;
      const videoFolder = path.join(CHUNKS_DIR, uploadId);

      if (!fs.existsSync(videoFolder)) {
        fs.mkdirSync(videoFolder);
        console.log("📁 Created video chunk folder:", videoFolder);
      }

      console.log(
        `📦 Uploading chunk ${
          parsedChunkIndex + 1
        }/${parsedTotalChunks} for uploadId: ${uploadId}`
      );

      await saveChunk(videoFolder, parsedChunkIndex, req.file.buffer);

      const uploadedChunks = fs.readdirSync(videoFolder).length;
      console.log(`📊 Uploaded chunks: ${uploadedChunks}/${parsedTotalChunks}`);

      if (uploadedChunks === parsedTotalChunks) {
        const uniqueFileName = `${uploadId}_${originalFileName}`;
        const finalVideoPath = path.join(videoFolder, uniqueFileName);

        console.log("🧩 All chunks uploaded. Merging now...");
        await mergeChunks(videoFolder, finalVideoPath, parsedTotalChunks);
        console.log("🎬 Merge complete:", finalVideoPath);

        req.finalVideoPath = finalVideoPath;
        req.originalFileName = uniqueFileName;
        req.uploadId = uploadId;

        return next(); // ✅ Proceed to process the merged video
      } else {
        return res.status(200).json({
          success: true,
          message: `Chunk ${parsedChunkIndex + 1} uploaded.`,
          uploadId,
        });
      }
    } catch (error) {
      console.error("🔥 Error in uploadChunkMiddleware:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during chunk upload.",
      });
    }
  });
};

module.exports = { uploadChunkMiddleware };
