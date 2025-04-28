// --------------------------
// routes/processRoutes.js
// --------------------------
const express = require("express");
const router = express.Router();
const {  downloadVideo } = require("../controller/processController");

router.get('/:uploadId/:fileName', downloadVideo);

module.exports = router;
