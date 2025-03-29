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

    // responses.forEach((res, index) => {
    //   const outputStream = fs.createWriteStream(
    //     path.join(__dirname, "Sample_output_videos", `output_${index + 1}.mp4`)
    //   );
    //   res.data.pipe(outputStream);
    // });

    console.log("✅ All uploads completed and responses saved.");
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
  }
};

runTest();
