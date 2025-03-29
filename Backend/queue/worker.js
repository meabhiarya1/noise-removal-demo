const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "video-processing",
  async (job) => {
    const { inputFileName, cleanedOutputName, volume, noiseDuration } =
      job.data;

    const inputPath = path.join(__dirname, "../uploads", inputFileName);
    const outputPath = path.join(__dirname, "../outputs", cleanedOutputName);

    console.log(`▶️ Worker processing job: ${job.id}`);
    console.log(`📂 Input: ${inputFileName}`);
    console.log(`📤 Output: ${cleanedOutputName}`);

    return new Promise((resolve, reject) => {
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
        fs.unlink(inputPath, () => {}); // Clean up uploaded input after processing

        if (code === 0) {
          console.log(`✅ Job ${job.id} done`);
          resolve();
        } else {
          reject(new Error(`Python process failed with code ${code}`));
        }
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