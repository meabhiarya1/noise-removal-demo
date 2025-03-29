// jobQueue.js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null, // 👈 important!
});

const jobQueue = new Queue("video-processing", { connection });

module.exports = jobQueue;
