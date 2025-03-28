const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Uploads folder setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname); // keep original name
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Only video files are allowed!"));
    }
    cb(null, true);
  },
});

// Endpoint to handle video upload and processing
app.post("/process", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No video file uploaded.");
  }

  const volume = req.body.volume || "5.0";
  const noiseDuration = req.body.noise || "5";

  const inputFileName = req.file.originalname;
  const baseName = path.parse(inputFileName).name;
  const cleanedOutputName = `${baseName}_cleaned.mp4`;
  const outputPath = path.join(__dirname, "outputs", cleanedOutputName);

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
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
