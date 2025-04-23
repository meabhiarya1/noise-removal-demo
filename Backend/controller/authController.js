// controllers/authController.js
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /auth/google/token
const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };

    req.session.user = user;

    return res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("❌ Error verifying token:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// GET /auth/user
const getUser = (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ user: req.session.user });
  }
  return res.status(401).json({ error: "Not authenticated" });
};

// GET /auth/logout
const logoutUser = (req, res) => {
  req.session = null;
  return res.status(200).json({ message: "Logged out" });
};

module.exports = {
  googleAuth,
  getUser,
  logoutUser,
};
