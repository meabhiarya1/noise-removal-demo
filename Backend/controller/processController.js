const path = require("path");
const jobQueue = require("../queue/jobQueue");
const fs = require("fs");

exports.handleProcess = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No video file uploaded.");
  }

  const { finalVideoPath, originalFileName, uploadId } = req;

  ///maintain all the file names and paths in the same format as the original file name
  const volume = req.body.volume || "5.0";
  const noiseDuration = req.body.noise || "5";

  // const originalName = req.file.originalname;
  const inputFileName = path.basename(finalVideoPath);

  // Add job to BullMQ queue
  const job = await jobQueue.add("video-processing", {
    inputFileName,
    originalFileName,
    finalVideoPath,
    volume,
    noiseDuration,
    uploadId,
  });

  res.status(202).json({
    message: "Processing started.",
    jobId: job.id,
    outputFileName: originalFileName,
    uploadId: uploadId,
    success: true,
  });
};

exports.downloadVideo = async (req, res) => {
  try {
    const { uploadId, fileName } = req.params;

    if (!uploadId || !fileName) {
      return res
        .status(400)
        .json({ message: "Missing uploadId or fileName in request." });
    }

    const filePath = path.join(__dirname, "..", "outputs", uploadId, fileName);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found." });
    }

    // Stream the file for download
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("❌ Error downloading file:", err);
        return res
          .status(500)
          .json({ message: "Error occurred while downloading." });
      } else {
        console.log(`✅ File ${fileName} downloaded successfully.`);
      }
    });
  } catch (error) {
    console.error("❌ Unexpected error in downloadVideo:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};
