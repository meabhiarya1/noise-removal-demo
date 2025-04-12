// const axios = require("axios");
// const FormData = require("form-data");
// const fs = require("fs");
// const path = require("path");
// const { v4: uuidv4 } = require("uuid");
// const uploadId = uuidv4(); // Generate once per file

// // Function to upload each chunk of the video
// const uploadChunk = async (filePath, chunkIndex, totalChunks) => {
//   const form = new FormData();

//   // Set the chunk size to 10MB (1024 * 1024 * 10)
//   const chunkSize = 1024 * 1024 * 10; // 10MB
//   const start = chunkIndex * chunkSize;
//   const end = Math.min(
//     (chunkIndex + 1) * chunkSize - 1,
//     fs.statSync(filePath).size - 1
//   ); // Ensure last chunk doesn't go beyond file size

//   // Read the video file as a stream for this chunk
//   const stream = fs.createReadStream(filePath, { start, end });

//   // Append the chunk and other metadata
//   form.append("video", stream);
//   form.append("chunkIndex", chunkIndex);
//   form.append("totalChunks", totalChunks);
//   form.append("uploadId", uploadId); // e.g., uuidv4()

//   try {
//     const response = await axios.post(
//       "http://localhost:5000/upload/upload-chunk",
//       form,
//       {
//         headers: form.getHeaders(),
//         responseType: "stream",
//       }
//     );

//     // console.log(response);

//     // Check the response
//     if (response.data.success) {
//       console.log(`✅ Chunk ${chunkIndex + 1} uploaded successfully.`);
//     } else {
//       console.error(`❌ Chunk ${chunkIndex + 1} upload failed.`);
//     }
//   } catch (err) {
//     console.log("object");
//     console.error(`❌ Chunk ${chunkIndex + 1} upload failed:`, err.message);
//   }
// };

// // Function to run the chunked upload test
// const runChunkedUploadTest = async () => {
//   const videoPath = path.join(__dirname, "Sample_videos/sample1.mp4");
//   const stats = fs.statSync(videoPath);
//   const totalChunks = Math.ceil(stats.size / (1024 * 1024 * 10)); // 10MB chunks

//   console.log(`🚀 Starting chunked upload for ${videoPath}...`);

//   try {
//     // Upload all chunks one by one
//     for (let i = 0; i < totalChunks; i++) {
//       await uploadChunk(videoPath, i, totalChunks);
//     }
//     console.log("✅ All chunks uploaded successfully.");
//   } catch (err) {
//     console.error("❌ Chunk upload failed:", err.message);
//   }
// };

// // Run the chunked upload test
// runChunkedUploadTest();

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
