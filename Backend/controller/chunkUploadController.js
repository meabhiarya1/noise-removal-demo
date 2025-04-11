const multer = require("multer");
const {
  uploadChunkMiddleware,
} = require("../middleware/uploadChunkMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("video");

exports.handleChunkUpload = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(405).json({ success: false, message: err.message });
    }
    uploadChunkMiddleware(req, res);
  });
};
