// --------------------------
// controllers/processController.js
// --------------------------
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

exports.handleProcess = (req, res) => {
  if (!req.file) {
    return res.status(400).send("No video file uploaded.");
  }

  const volume = req.body.volume || "5.0";
  const noiseDuration = req.body.noise || "5";
  const inputFileName = req.file.originalname;
  const baseName = path.parse(inputFileName).name;
  const cleanedOutputName = `${baseName}_cleaned.mp4`;
  const outputPath = path.join(__dirname, "../outputs", cleanedOutputName);
  const uploadedPath = path.join(__dirname, "../uploads", inputFileName);

  console.log(`▶️ Starting processing for "${inputFileName}"`);
  console.log(`🔊 Volume: ${volume} | 🕒 Noise Duration: ${noiseDuration}`);
  console.log(`📤 Output: ${cleanedOutputName}`);

  const py = spawn("venv/bin/python", [
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
      console.log("✅ Python script finished successfully. Sending file...");
      res.download(outputPath, cleanedOutputName, (err) => {
        if (err) {
          console.error("❌ Error sending file:", err.message);
          res.status(500).send("Error sending the cleaned video.");
        }
      });
    } else {
      console.error("❌ Python script failed with code:", code);
      res.status(500).send("Audio cleaning process failed.");
    }
  });
};
