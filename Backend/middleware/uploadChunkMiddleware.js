const fsExSync = require("fs").promises;
const fs = require("fs");
const path = require("path");
const { saveChunk } = require("../sevices/saveChunk");

const CHUNKS_DIR = path.join(__dirname, "..", "video_chunks");
if (!fs.existsSync(CHUNKS_DIR)) {
  fs.mkdirSync(CHUNKS_DIR);
}

const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");

async function mergeChunks(chunksDir, outputFilePath, totalChunks) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(outputFilePath);
    let currentChunk = 0;

    function appendNext() {
      if (currentChunk >= totalChunks) {
        writeStream.end();
        return resolve(outputFilePath);
      }

      const chunkPath = path.join(chunksDir, `${currentChunk}.chunk`);
      const readStream = fs.createReadStream(chunkPath);

      readStream.pipe(writeStream, { end: false });

      readStream.on("end", async () => {
        try {
          await fsExSync.unlink(chunkPath); // 🔥 Delete chunk after merging
          console.log(`🗑️ Deleted chunk ${currentChunk}`);
        } catch (err) {
          console.error(
            `⚠️ Failed to delete chunk ${currentChunk}:`,
            err.message
          );
        }

        currentChunk++;
        appendNext();
      });

      readStream.on("error", (err) => {
        console.error("❌ Error reading chunk:", err.message);
        reject(err);
      });
    }

    appendNext();
  });
}

const uploadChunkMiddleware = async (req, res, next) => {
  try {
    const { chunkIndex, totalChunks, uploadId } = req.body;
    const folderName = uploadId;
    const videoFolder = path.join(CHUNKS_DIR, folderName);

    if (!req.file) {
      console.error("No video file received.");
      return res
        .status(402)
        .json({ success: false, message: "Missing video chunk" });
    }

    if (!chunkIndex || !totalChunks) {
      console.error("Missing chunkIndex or totalChunks.");
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const parsedChunkIndex = parseInt(chunkIndex);
    const parsedTotalChunks = parseInt(totalChunks);

    await fsExSync.mkdir(videoFolder, { recursive: true });
    await saveChunk(videoFolder, parsedChunkIndex, req.file.buffer);

    const uploadedChunks = fs.readdirSync(videoFolder).length;

    if (uploadedChunks === parsedTotalChunks) {
      const finalVideoPath = path.join(
        __dirname,
        "..",
        "video_chunks",
        folderName,
        `${req.file.originalname.split(".")[0]}_${timestamp}.${
          req.file.originalname.split(".")[1]
        }`
      );
      await mergeChunks(videoFolder, finalVideoPath, parsedTotalChunks);

      return res.status(200).json({
        success: true,
        message: "All chunks uploaded and merged.",
        videoPath: finalVideoPath,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `Chunk ${parsedChunkIndex + 1} uploaded.`,
        uploadId,
      });
    }
  } catch (error) {
    console.error("Error in uploadChunkMiddleware:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { uploadChunkMiddleware };
