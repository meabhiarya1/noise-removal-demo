// --------------------------
// server.js
// --------------------------
const express = require("express");
const path = require("path");
const fs = require("fs");
const processRoutes = require("./routes/processRoutes");

const app = express();
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
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});