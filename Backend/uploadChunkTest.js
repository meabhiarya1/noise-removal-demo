const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const CHUNK_SIZE = 1024 * 1024 * 10; // 10MB
const FOLDER_PATH = path.join(__dirname, "Sample_videos");
const API_URL = "http://172.26.220.40:5000/upload/upload-chunk";
const CONCURRENT_USERS = 5;
const FILES_PER_USER = 2;

const chunkProgress = {}; // Global tracker

// Upload a single chunk
const uploadChunk = async (
  filePath,
  chunkIndex,
  totalChunks,
  uploadId,
  retries = 3
) => {
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
      timeout: 15000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (response.data.success) {
      chunkProgress[filePath][chunkIndex] = true;
      console.log(
        `✅ [${path.basename(filePath)}] Chunk ${chunkIndex + 1}/${totalChunks}`
      );
    } else {
      throw new Error("Server responded with failure");
    }
  } catch (err) {
    console.error(
      `❌ [${path.basename(filePath)}] Chunk ${chunkIndex + 1} failed: ${
        err.message
      }`
    );
    if (retries > 0) {
      console.log(
        `🔁 Retrying chunk ${chunkIndex + 1} (${retries} retries left)...`
      );
      await uploadChunk(
        filePath,
        chunkIndex,
        totalChunks,
        uploadId,
        retries - 1
      );
    } else {
      throw err;
    }
  }
};

// Upload a full file in sequential chunks
const uploadFileInChunks = async (filePath) => {
  const uploadId = uuidv4();
  const stats = fs.statSync(filePath);
  const totalChunks = Math.ceil(stats.size / CHUNK_SIZE);
  chunkProgress[filePath] = Array(totalChunks).fill(false);

  console.log(
    `🚀 Uploading ${path.basename(filePath)} in ${totalChunks} chunks...`
  );

  for (let i = 0; i < totalChunks; i++) {
    await uploadChunk(filePath, i, totalChunks, uploadId);
  }

  const uploaded = chunkProgress[filePath].filter(Boolean).length;
  if (uploaded === totalChunks) {
    console.log(`✅ [${path.basename(filePath)}] All chunks uploaded.`);
    await notifyUploadComplete(uploadId);  
  } else {
    console.error(
      `❌ [${path.basename(
        filePath
      )}] Upload incomplete (${uploaded}/${totalChunks})`
    );
  }
};

const notifyUploadComplete = async (uploadId) => {
  try {
    const res = await axios.post(`http://172.26.220.40:5000/upload/complete`, {
      uploadId,
    });
    if (res.data.success) {
      console.log(`✅ Upload ID ${uploadId} successfully finalized.`);
    } else {
      throw new Error("Server responded with failure");
    }
  } catch (err) {
    console.error(
      `❌ Failed to notify upload complete for ${uploadId} ${err.message}`
    );
  }
};

// Retry upload for entire file (optional)
const retryUploadFile = async (filePath, attempts = 2) => {
  while (attempts--) {
    try {
      await uploadFileInChunks(filePath);
      return;
    } catch (e) {
      console.log(`🔁 Retrying file: ${path.basename(filePath)}...`);
    }
  }
  console.error(`❌ Final failure for ${path.basename(filePath)}`);
};

// Simulate multiple users uploading files concurrently
const simulateUsers = async () => {
  const files = fs
    .readdirSync(FOLDER_PATH)
    .filter((file) => file.endsWith(".mp4"));

  const filePaths = files.map((file) => path.join(FOLDER_PATH, file));
  const groups = [];

  for (let i = 0; i < filePaths.length; i += FILES_PER_USER) {
    groups.push(filePaths.slice(i, i + FILES_PER_USER));
  }

  const limitedGroups = groups.slice(0, CONCURRENT_USERS);

  await Promise.all(
    limitedGroups.map(async (group, userIndex) => {
      console.log(`👤 Starting uploads for User ${userIndex + 1}`);
      for (const file of group) {
        await retryUploadFile(file);
      }
      console.log(`✅ User ${userIndex + 1} finished uploading`);
    })
  );
};

simulateUsers();
