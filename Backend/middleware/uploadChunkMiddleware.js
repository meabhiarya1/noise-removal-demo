// const fs = require("fs");
// const path = require("path");

// // Directory where chunks will be temporarily stored
// const CHUNKS_DIR = path.join(__dirname, "chunks");

// if (!fs.existsSync(CHUNKS_DIR)) {
//   fs.mkdirSync(CHUNKS_DIR); // Create chunks directory if it doesn't exist
// }

// // Middleware to handle file chunk uploads
// const uploadChunkMiddleware = (req, res, next) => {
//   try {
//     const { video, chunkIndex, totalChunks } = req.body;

//     if (!video || !chunkIndex || !totalChunks) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing required fields" });
//     }

//     const chunkIndex = parseInt(chunkIndex);
//     const totalChunks = parseInt(totalChunks);

//     const chunkFolder = path.join(CHUNKS_DIR, `video_${Date.now()}`);
//     if (!fs.existsSync(chunkFolder)) {
//       fs.mkdirSync(chunkFolder); // Create directory for this specific video upload
//     }

//     const chunkPath = path.join(chunkFolder, `chunk_${chunkIndex}`);

//     // Store the chunk file temporarily
//     const chunkStream = fs.createWriteStream(chunkPath);
//     video.pipe(chunkStream);

//     chunkStream.on("finish", () => {
//       console.log(`Chunk ${chunkIndex + 1} received and saved.`);

//       // Check if all chunks have been uploaded
//       const uploadedChunks = fs.readdirSync(chunkFolder).length;
//       if (uploadedChunks === totalChunks) {
//         // Combine the chunks into a final video file
//         const finalVideoPath = path.join(
//           __dirname,
//           `final_video_${Date.now()}.mp4`
//         );
//         const finalStream = fs.createWriteStream(finalVideoPath);

//         const chunkFiles = fs
//           .readdirSync(chunkFolder)
//           .sort(
//             (a, b) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1])
//           );
//         chunkFiles.forEach((file) => {
//           const filePath = path.join(chunkFolder, file);
//           fs.createReadStream(filePath).pipe(finalStream, { end: false });
//         });

//         finalStream.on("finish", () => {
//           console.log("Final video created successfully.");
//           // Clean up the temporary chunks
//           fs.rmdirSync(chunkFolder, { recursive: true });
//           return res
//             .status(200)
//             .json({
//               success: true,
//               message: "File uploaded and combined successfully.",
//             });
//         });
//       } else {
//         return res
//           .status(200)
//           .json({
//             success: true,
//             message: `Chunk ${
//               chunkIndex + 1
//             } uploaded. Waiting for more chunks...`,
//           });
//       }
//     });
//   } catch (error) {
//     console.error("Error in uploadChunkMiddleware:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// module.exports = uploadChunkMiddleware;
