const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const upload = (filePath, volume = "5.0", noise = "5") => {
  const form = new FormData();
  form.append("video", fs.createReadStream(filePath));
  form.append("volume", volume);
  form.append("noise", noise);

  return axios.post("http://localhost:5000/process", form, {
    headers: form.getHeaders(),
    responseType: "stream",
  });
};

const runTest = async () => {
  const videosDir = path.join(__dirname, "Sample_videos");
  const files = fs
    .readdirSync(videosDir)
    .filter((file) => file.endsWith(".mp4"))
    .map((file) => path.join(videosDir, file));

  console.log("🚀 Starting simultaneous uploads...");

  try {
    const responses = await Promise.all(files.map((file) => upload(file)));

    responses.forEach((_, index) => {
      const fileName = path.basename(files[index]);
      console.log(`✅ Processing completed for: ${fileName}`);
    });

    console.log("✅ All uploads completed successfully.");

  } catch (err) {
    console.error("❌ Upload failed:", err.message);
  }
};

runTest();
