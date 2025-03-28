// ---------------- server.js ----------------
const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Middleware to parse form fields
app.use(express.urlencoded({ extended: true }));

// Uploads setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, "input_video.mp4"); // overwrite for testing
  },
});
const upload = multer({ storage });

app.post("/process", upload.single("video"), (req, res) => {
  const volume = req.body.volume || "5.0"; // default volume multiplier
  const noiseDuration = req.body.noise || "5"; // default noise sample duration

  console.log(
    `▶️ Starting process with volume=${volume}, noiseDuration=${noiseDuration}`
  );

  const py = spawn("venv/bin/python", [
    "noise_cleaner.py",
    volume,
    noiseDuration,
  ]);

  py.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  py.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  py.on("close", (code) => {
    if (code === 0) {
      const outputPath = path.join(__dirname, "outputs", "output_video.mp4");
      res.download(outputPath);
    } else {
      res.status(500).send("Processing failed.");
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
