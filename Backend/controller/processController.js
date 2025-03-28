const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { v4: uuidv4 } = require("uuid");

exports.handleProcess = (req, res) => {
  if (!req.file) {
    return res.status(400).send("No video file uploaded.");
  }

  const volume = req.body.volume || "5.0";
  const noiseDuration = req.body.noise || "5";
  const jobId = uuidv4();

  const originalName = req.file.originalname;
  const inputFileName = `${jobId}_${originalName}`;
  const cleanedOutputName = `${jobId}_${path.parse(originalName).name}_cleaned.mp4`;

  const uploadedPath = path.join(__dirname, "../uploads", inputFileName);
  const outputPath = path.join(__dirname, "../outputs", cleanedOutputName);

  // Rename the uploaded file to ensure uniqueness
  fs.renameSync(path.join(__dirname, "../uploads", originalName), uploadedPath);

  console.log(`▶️ Processing job: ${jobId}`);
  console.log(`📂 Input File: ${inputFileName}`);
  console.log(`🔊 Volume: ${volume} | 🕒 Noise Duration: ${noiseDuration}`);
  console.log(`📤 Output: ${cleanedOutputName}`);

  const py = spawn("python", [
    "noise_cleaner.py",
    volume,
    noiseDuration,
    inputFileName,
    cleanedOutputName,
  ]);

  py.stdout.on("data", (data) => {
    process.stdout.write(`📦 Python: ${data}`);
  });

  py.stderr.on("data", (data) => {
    process.stderr.write(`⚠️ Python Error: ${data}`);
  });

  py.on("close", (code) => {
    fs.unlink(uploadedPath, (err) => {
      if (err) {
        console.warn(`⚠️ Could not delete uploaded file: ${uploadedPath}`);
      } else {
        console.log(`🧹 Deleted uploaded file: ${uploadedPath}`);
      }
    });

    if (code === 0) {
      console.log("✅ Python script finished. Sending response...");
      res.download(outputPath, cleanedOutputName, (err) => {
        if (err) {
          console.error("❌ Error sending file:", err.message);
          res.status(500).send("Error sending cleaned video.");
        }
      });
    } else {
      console.error("❌ Python script failed with code:", code);
      res.status(500).send("Audio cleaning failed.");
    }
  });
};
