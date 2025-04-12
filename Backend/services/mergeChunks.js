const fsExSync = require("fs").promises;
const fs = require("fs");
const path = require("path");

const mergeChunks = async function mergeChunks(
  chunksDir,
  outputFilePath,
  totalChunks
) {
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
};


module.exports = { mergeChunks };