const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const upload = (filePath, volume = "5.0", noise = "5") => {
  const form = new FormData();
  form.append("video", fs.createReadStream(filePath));
  form.append("volume", volume);
  form.append("noise", noise);

  return axios.post("http://localhost:5000/process", form, {
    headers: form.getHeaders(),
    responseType: 'stream',
  });
};

const runTest = async () => {
  const file1 = path.join(__dirname, "sample1.mp4"); // Put test video files here
  const file2 = path.join(__dirname, "sample2.mp4");

  console.log("🚀 Starting simultaneous uploads...");

  try {
    const [res1, res2] = await Promise.all([
      upload(file1),
      upload(file2)
    ]);

    const output1 = fs.createWriteStream("output1.mp4");
    const output2 = fs.createWriteStream("output2.mp4");

    res1.data.pipe(output1);
    res2.data.pipe(output2);

    console.log("✅ Both uploads finished and responses saved.");
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
  }
};

runTest();
