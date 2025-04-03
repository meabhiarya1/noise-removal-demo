const path = require("path");
const fs = require("fs");

exports.handleChunkUpload = async (req, res) => {
  const { chunkIndex, totalChunks, fileName, uploadId } = req.body;

  // Validate required fields
  if (
    !req.file ||
    chunkIndex === undefined ||
    totalChunks === undefined ||
    !fileName ||
    !uploadId
  ) {
    return res.status(400).send("Missing required chunk metadata.");
  }

  const uploadDir = path.join(__dirname, "../uploads", uploadId);

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Save chunk as file named by its index
  const chunkPath = path.join(uploadDir, `${chunkIndex}`);
  fs.writeFileSync(chunkPath, req.file.buffer);

  console.log(
    `🧩 Saved chunk ${chunkIndex}/${
      totalChunks - 1
    } for ${uploadId}_${fileName}`
  );

  // Check if all chunks are uploaded
  const uploadedChunks = fs.readdirSync(uploadDir).length;

  if (uploadedChunks == parseInt(totalChunks)) {
    const finalPath = path.join(
      __dirname,
      "../uploads",
      `${uploadId}_${fileName}`
    );
    const writeStream = fs.createWriteStream(finalPath);

    for (let i = 0; i < totalChunks; i++) {
      const chunk = fs.readFileSync(path.join(uploadDir, `${i}`));
      writeStream.write(chunk);
    }
    writeStream.end();

    // Clean up temporary chunks
    fs.rmSync(uploadDir, { recursive: true, force: true });

    console.log(`✅ Successfully assembled file: ${uploadId}_${fileName}`);
  }

  res.status(200).send("Chunk uploaded");
};
