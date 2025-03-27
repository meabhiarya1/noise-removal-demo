const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Uploads setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, "input_video.mp4"); // always overwrite for now
  },
});
const upload = multer({ storage });

// Endpoint to upload and process video
app.post("/process", upload.single("video"), (req, res) => {
  const volume = req.body.volume || "2.0"; // default 200%
  const py = spawn("python", ["noise_cleaner.py", volume]);

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
