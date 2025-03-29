// --------------------------
// server.js
// --------------------------
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const processRoutes = require("./routes/processRoutes");
const jobQueue = require("./queue/jobQueue");

const { createBullBoard } = require("@bull-board/api");
const { ExpressAdapter } = require("@bull-board/express");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");

const app = express();
const PORT = 5000;

app.use(cors());

// --------------------------
// Ensure folders exist
["uploads", "outputs"].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`📁 Created folder: ${dir}/`);
  }
});

// --------------------------
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --------------------------
// Bull Board Setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(jobQueue)],
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

// --------------------------
// Routes
app.use("/process", processRoutes);

// --------------------------
// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
  console.log(`📊 Bull Board available at http://localhost:${PORT}/admin/queues`);
});
