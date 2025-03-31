// jobQueue.js
const { Queue } = require("bullmq");
const connection = require("../redisConnection/redisConnection"); 

const jobQueue = new Queue("video-processing", { connection });

module.exports = jobQueue;
