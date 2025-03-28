// --------------------------
// server.js
// --------------------------
const express = require("express");
const path = require("path");
const fs = require("fs");
const processRoutes = require("./routes/processRoutes");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = 5000;

// Ensure folders exist
["uploads", "outputs"].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`📁 Created folder: ${dir}/`);
  }
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/process", processRoutes);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});

