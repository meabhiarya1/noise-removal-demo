const { Worker } = require("bullmq");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const connection = require("../redisConnection/redisConnection");

const worker = new Worker(
  "video-processing",
  async (job) => {
    const {
      inputFileName,
      originalFileName,
      finalVideoPath,
      volume,
      noiseDuration,
      uploadId,
    } = job.data;

    console.log(`▶️ Worker processing job: ${job.id}`);
    console.log(`📂 Input: ${inputFileName}`);
    console.log(`📤 Output: ${originalFileName}`);
    console.log(`📁 Full Path: ${finalVideoPath}`);

    return new Promise((resolve, reject) => {
      const py = spawn("venv/bin/python", [
        "noise_cleaner.py",
        uploadId,
        volume,
        noiseDuration,
        finalVideoPath,
        originalFileName,
      ]);

      py.stdout.on("data", async (data) => {
        const lines = data.toString().split("\n");
        for (let line of lines) {
          line = line.trim();
          // Basic check if the line looks like a JSON object
          if (line.startsWith("{") && line.endsWith("}")) {
            try {
              const json = JSON.parse(line);
              if (json.progress !== undefined) {
                console.log("Progress:", json.progress);
                // Update progress in BullMQ for polling
                await job.updateProgress(json.progress);
              }
            } catch (err) {
              console.error("❌ JSON parsing failed:", err);
            }
          } else {
            console.log("📄 Non-JSON log:", line);
          }
        }
      });

      py.stderr.on("data", (data) => {
        console.error("⚠️ Python Error:", data.toString());
      });

      py.on("close", (code) => {
        const absoluteFinalVideoPath = path.resolve(
          __dirname,
          "..",
          finalVideoPath
        );
        const folderPath = path.dirname(absoluteFinalVideoPath);

        console.log("🧭 Absolute path to folder:", folderPath);

        if (!fs.existsSync(folderPath)) {
          console.warn("⚠️ Folder not found for deletion:", folderPath);
        }

        setTimeout(() => {
          fs.rm(folderPath, { recursive: true, force: true }, (err) => {
            if (err) {
              console.error("❌ Failed to delete folder:", folderPath, err);
            } else {
              console.log(`🧹 Cleaned up folder: ${folderPath}`);
            }

            if (code === 0) {
              console.log(`✅ Job ${job.id} done`);
              resolve();
            } else {
              reject(new Error(`Python process failed with code ${code}`));
            }
          });
        }, 500);
      });
    });
  },
  { connection }
);

console.log("👷 Worker started and listening for jobs...");

worker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job.id} with error ${err.message}`);
});

worker.on("error", (err) => {
  console.error(`❌ Worker error: ${err.message}`);
});

worker.on("stalled", (job) => {
  console.warn(`⚠️ Job stalled: ${job.id}`);
});
