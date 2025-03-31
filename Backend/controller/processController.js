const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const jobQueue = require("../queue/jobQueue"); // your BullMQ job queue

exports.handleProcess = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No video file uploaded.");
  }

  const volume = req.body.volume || "5.0";
  const noiseDuration = req.body.noise || "5";
  const jobId = uuidv4();

  const originalName = req.file.originalname;
  const inputFileName = `${jobId}_${originalName}`;
  const cleanedOutputName = `${jobId}_${
    path.parse(originalName).name
  }_cleaned.mp4`;

  const uploadedPath = path.join(__dirname, "../uploads", inputFileName);

  // Rename the uploaded file to ensure uniqueness
  fs.renameSync(req.file.path, uploadedPath);

  console.log(`▶️ Queuing job: ${jobId}`);

  // Add job to BullMQ queue
  await jobQueue.add("video-processing", {
    inputFileName,
    cleanedOutputName,
    volume,
    noiseDuration,
  });

  res.status(202).json({
    message: "Processing started.",
    jobId,
    outputFileName: cleanedOutputName,
  });
};
