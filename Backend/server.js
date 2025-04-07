// --------------------------
// server.js (with clustering)
// --------------------------
const cluster = require("cluster");
const os = require("os");
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const processRoutes = require("./routes/processRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const jobQueue = require("./queue/jobQueue");

const { createBullBoard } = require("@bull-board/api");
const { ExpressAdapter } = require("@bull-board/express");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");

const PORT = 5000;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`👑 Master ${process.pid} is running`);
  console.log(`⚙️ Setting up ${numCPUs} workers...`);

  // Fork workers based on the number of CPU cores
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    console.log(`✅ Worker ${worker.process.pid} started`);
  }

  // Restart worker if one exits unexpectedly
  cluster.on("exit", (worker, code, signal) => {
    console.warn(
      `⚠️ Worker ${worker.process.pid} exited (code: ${code}). Restarting...`
    );
    cluster.fork();
  });

  console.log("🚀 Server cluster setup complete!");
} else {
  const app = express();

  app.use(cors());

  // Ensure folders exist
  ["uploads", "outputs"].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log(`📁 Created folder: ${dir}/`);
    }
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Bull Board Setup
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/admin/queues");

  createBullBoard({
    queues: [new BullMQAdapter(jobQueue)],
    serverAdapter,
  });

  app.use("/admin/queues", serverAdapter.getRouter());

  // Routes
  app.use("/process", processRoutes);
  app.use("/upload", uploadRoutes);

  // Start server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ Worker ${process.pid} running at http://0.0.0.0:${PORT}`);
    if (cluster.worker.id === 1) {
      console.log(
        `📊 Bull Board available at http://localhost:${PORT}/admin/queues`
      );
    }
  });
}
