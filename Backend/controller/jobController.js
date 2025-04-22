const { Job } = require("bullmq");
const jobQueue = require("../queue/jobQueue");

const getJobProgress = async (req, res) => {
  try {
    // Fetch the job by its ID
    const job = await Job.fromId(jobQueue, req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Get the job's progress and state
    const progress = job.progress || 0;
    const status = await job.getState();

    // Send the job's progress and status to the frontend
    return res.json({
      jobId: job.id,
      progress,
      status,
    });
  } catch (err) {
    console.error("❌ Error fetching job progress:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getJobProgress,
};
