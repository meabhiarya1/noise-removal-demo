const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const jobQueue = require("../queue/jobQueue"); // your BullMQ job queue

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
    success: true,
  });
};
