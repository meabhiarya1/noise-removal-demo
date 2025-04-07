const multer = require("multer");
const fsExSync = require("fs").promises;
const fs = require("fs");
const path = require("path");

// Directory where chunks will be temporarily stored
const CHUNKS_DIR = path.join(__dirname, "chunks");

if (!fs.existsSync(CHUNKS_DIR)) {
  fs.mkdirSync(CHUNKS_DIR); // Create chunks directory if it doesn't exist
}

// Multer setup for handling video chunks
const storage = multer.memoryStorage(); // Store files in memory temporarily
const upload = multer({ storage: storage }).single("video");

/**
 * Function to save the uploaded chunk to a specified directory
 */

async function saveChunk(chunkDir, chunkIndex, buffer) {
  try {
    if (!chunkDir || typeof chunkDir !== "string") {
      throw new Error("Invalid chunk directory path.");
    }

    if (typeof chunkIndex !== "number" || chunkIndex < 0) {
      throw new Error("Invalid chunk index.");
    }

    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error("Invalid buffer received for chunk.");
    }

    const chunkFileName = `${chunkIndex}.chunk`;
    const chunkFilePath = path.join(chunkDir, chunkFileName);

    // Ensure the chunk directory exists
    await fsExSync.mkdir(chunkDir, { recursive: true });

    console.log("📁 Saving chunk file to:", chunkFilePath);
    await fsExSync.writeFile(chunkFilePath, buffer); // Use fsExSync for promises-based write

    // Confirm file written
    try {
      await fsExSync.access(chunkFilePath);
    } catch (accessErr) {
      console.error("❌ Chunk file not accessible after write:", chunkFilePath);
      throw new Error("Chunk file write failed.");
    }

    console.log("✅ Chunk saved successfully:", chunkFileName);
  } catch (err) {
    console.error("🔥 Error in saveChunk:", err.message);
    throw err;
  }
}

/**
 * Middleware to handle video chunk uploads
 */
const uploadChunkMiddleware = async (req, res, next) => {
  try {
    console.log("Received request body:", req.body); // Log the body to check chunkIndex and totalChunks
    console.log("Received files:", req.file); // Log the files to check if the file is properly uploaded

    const { chunkIndex, totalChunks, uploadId } = req.body;
    const folderName = uploadId; 
    const videoFolder = path.join(CHUNKS_DIR, folderName);

    if (!req.file) {
      // Check if file is being uploaded correctly
      console.error(
        "No video file received or multer is not processing the file correctly."
      );
      return res.status(402).json({
        success: false,
        message: "Missing required video chunk",
      });
    }

    if (!chunkIndex || !totalChunks) {
      console.error("Missing chunkIndex or totalChunks in the request.");
      return res.status(400).json({
        success: false,
        message: "Missing required fields (chunkIndex, totalChunks)",
      });
    }

    // Process chunk
    const parsedChunkIndex = parseInt(chunkIndex);
    const parsedTotalChunks = parseInt(totalChunks);

    await fsExSync.mkdir(videoFolder, { recursive: true }); // Ensure directory exists

    const chunkPath = path.join(videoFolder, `${chunkIndex}.chunk`); // Save as 0.chunk, 1.chunk, etc.

    await saveChunk(videoFolder, parsedChunkIndex, req.file.buffer);

    console.log(`Chunk ${parsedChunkIndex + 1} received and saved.`);

    // Check if all chunks have been uploaded
    // const uploadedChunks = fs.readdirSync(chunkFolder).length;
    // console.log(`Uploaded Chunks: ${uploadedChunks} of ${parsedTotalChunks}`);

    if (uploadedChunks === parsedTotalChunks) {
      // Merge chunks into a final video file
      const finalVideoPath = path.join(
        __dirname,
        `final_video_${Date.now()}.mp4`
      );
      // const finalFilePath = await mergeChunks(
      //   chunkFolder,
      //   finalVideoPath,
      //   parsedTotalChunks
      // );

      return res.status(200).json({
        success: true,
        message: "File uploaded and combined successfully.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `Chunk ${
          parsedChunkIndex + 1
        } uploaded. Waiting for more chunks...`,
      });
    }
  } catch (error) {
    console.error("Error in uploadChunkMiddleware:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Handle the chunk upload process
 */
const handleChunkUpload = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(405).json({ success: false, message: err.message });
    }
    uploadChunkMiddleware(req, res);
  });
};

module.exports = { handleChunkUpload };
