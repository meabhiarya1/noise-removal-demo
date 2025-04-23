// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  googleAuth,
  getUser,
  logoutUser,
} = require("../controller/authController");

router.post("/google/token", googleAuth);
router.get("/user", getUser);
router.get("/logout", logoutUser);

module.exports = router;
