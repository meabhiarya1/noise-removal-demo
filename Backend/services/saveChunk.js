const fsExSync = require("fs").promises;
const path = require("path");

const saveChunk = async (chunkDir, chunkIndex, buffer) => {
  try {
    if (!chunkDir || typeof chunkDir !== "string")
      throw new Error("Invalid chunk directory path.");
    if (typeof chunkIndex !== "number" || chunkIndex < 0)
      throw new Error("Invalid chunk index.");
    if (!buffer || !Buffer.isBuffer(buffer))
      throw new Error("Invalid buffer received for chunk.");

    const chunkFileName = `${chunkIndex}.chunk`;
    const chunkFilePath = path.join(chunkDir, chunkFileName);

    await fsExSync.mkdir(chunkDir, { recursive: true });

    console.log("💾 Writing chunk:", {
      chunkFilePath,
      chunkIndex,
      chunkSize: buffer.length,
    });

    await fsExSync.writeFile(chunkFilePath, buffer);

    try {
      await fsExSync.access(chunkFilePath);
      const stats = await fsExSync.stat(chunkFilePath);
      console.log(
        `✅ Chunk saved: ${chunkFileName}, Size: ${stats.size} bytes`
      );
    } catch (accessErr) {
      console.error("❌ Chunk file not accessible after write:", chunkFilePath);
      throw new Error("Chunk file write failed.");
    }
  } catch (err) {
    console.error("🔥 Error in saveChunk:", err.message);
    throw err;
  }
};

module.exports = { saveChunk };
