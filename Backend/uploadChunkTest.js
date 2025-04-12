const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const CHUNK_SIZE = 1024 * 1024 * 10; // 10MB
const FOLDER_PATH = path.join(__dirname, "Sample_videos");
const API_URL = "http://localhost:5000/upload/upload-chunk";

// Upload a single chunk
const uploadChunk = async (filePath, chunkIndex, totalChunks, uploadId) => {
  const form = new FormData();

  const start = chunkIndex * CHUNK_SIZE;
  const end = Math.min(
    (chunkIndex + 1) * CHUNK_SIZE - 1,
    fs.statSync(filePath).size - 1
  );
  const stream = fs.createReadStream(filePath, { start, end });

  form.append("video", stream);
  form.append("chunkIndex", chunkIndex);
  form.append("totalChunks", totalChunks);
  form.append("uploadId", uploadId);

  try {
    const response = await axios.post(API_URL, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (response.data.success) {
      console.log(
        `✅ [${path.basename(filePath)}] Chunk ${
          chunkIndex + 1
        }/${totalChunks} uploaded.`
      );
    } else {
      console.error(
        `❌ [${path.basename(filePath)}] Failed chunk ${chunkIndex + 1}`
      );
    }
  } catch (err) {
    console.error(
      `❌ [${path.basename(filePath)}] Chunk ${chunkIndex + 1} error: ${
        err.message
      }`
    );
  }
};

// Upload a full file in chunks
const uploadFileInChunks = async (filePath) => {
  const uploadId = uuidv4();
  const stats = fs.statSync(filePath);
  const totalChunks = Math.ceil(stats.size / CHUNK_SIZE);

  console.log(
    `🚀 Uploading ${path.basename(filePath)} in ${totalChunks} chunks...`
  );

  for (let i = 0; i < totalChunks; i++) {
    await uploadChunk(filePath, i, totalChunks, uploadId);
  }

  console.log(`✅ [${path.basename(filePath)}] Upload completed.`);
};

// Start parallel uploads for all videos
const startParallelUploads = async () => {
  const files = fs
    .readdirSync(FOLDER_PATH)
    .filter((file) => file.endsWith(".mp4"));
  const filePaths = files.map((file) => path.join(FOLDER_PATH, file));

  await Promise.all(filePaths.map(uploadFileInChunks));
};

startParallelUploads();
