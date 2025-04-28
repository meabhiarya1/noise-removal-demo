import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";
import style from "./Upload.module.css";
import { FiUploadCloud } from "react-icons/fi";
import { MdEdit } from "react-icons/md";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import FormData from "form-data";
import ProgressBar from "../ProgressBar/Progress";

const Upload = () => {
  const [file, setFile] = useState();
  const [uploadProgress, setUploadProgress] = useState(0); // for overall upload progress
  const [processingProgress, setProcessingProgress] = useState(0); // for processing progress
  const [isUploading, setIsUploading] = useState(false); // Track whether uploading is in progress
  const [isProcessing, setIsProcessing] = useState(false); // Track whether processing is in progress

  const fileInputRef = useRef();
  const videoURL = file ? URL.createObjectURL(file) : null;
  const CHUNK_SIZE = 1024 * 1024 * 10; // 10MB

  const pollJobProgress = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/job/${jobId}/progress`
        );
        const progress = res.data.progress;
        console.log("📊 Job progress:", progress);

        setProcessingProgress(progress);

        if (progress === 100 || res.data.status === "completed") {
          clearInterval(interval);
          console.log("✅ Job completed!");
          setIsProcessing(false); // End processing phase
        }

        if (res.data.status === "failed") {
          clearInterval(interval);
          console.error("❌ Job failed.");
          setIsProcessing(false); // End processing phase
        }
      } catch (err) {
        console.error("❌ Error fetching job progress:", err.message);
        clearInterval(interval);
        setIsProcessing(false); // End processing phase
      }
    }, 2000); // poll every 2s
  };

  const uploadFileInChunks = async (file) => {
    const uploadId = uuidv4();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let jobId = null;

    setIsUploading(true); // Start upload phase

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("video", chunk);
      formData.append("chunkIndex", chunkIndex);
      formData.append("totalChunks", totalChunks);
      formData.append("uploadId", uploadId);
      formData.append("fileName", file.name);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload/upload-chunk`,
          formData,
          {
            onUploadProgress: (event) => {
              const percentPerChunk = 100 / totalChunks;
              const currentChunkProgress =
                (event.loaded / event.total) * percentPerChunk;
              const totalUploaded =
                chunkIndex * percentPerChunk + currentChunkProgress;
              setUploadProgress(Math.min(totalUploaded, 100));
            },
          }
        );

        if (response.data?.jobId && !jobId) {
          jobId = response.data.jobId;
          console.log("📦 Job ID received:", jobId);
        }

        const isSuccess =
          response.data?.success === true ||
          response.data?.message?.toLowerCase().includes("processing started");

        if (!isSuccess) {
          console.error(
            `❌ Unexpected response for chunk ${chunkIndex + 1}`,
            response.data
          );
          break;
        }

        if (response.data?.jobId && !jobId) {
          jobId = response.data.jobId;
          console.log("📦 Job ID received:", jobId);
        }

        console.log(
          `✅ Chunk ${
            chunkIndex + 1
          }/${totalChunks} uploaded or processing started`
        );
      } catch (err) {
        if (err.response) {
          console.error(
            `❌ Error uploading chunk ${chunkIndex + 1}: ${err.message}`,
            {
              status: err.response.status,
              data: err.response.data,
            }
          );
        } else {
          console.error(
            `❌ Network or unknown error uploading chunk ${chunkIndex + 1}:`,
            err.message
          );
        }
        break;
      }
    }

    if (jobId) {
      console.log("📦 All chunks uploaded. Tracking job progress...");
      setIsUploading(false); // End upload phase
      setIsProcessing(true); // Start processing phase
      pollJobProgress(jobId); // Start polling job progress
    } else {
      console.warn("⚠️ No jobId returned. Progress tracking skipped.");
      setIsUploading(false); // End upload phase
    }

    console.log("🎉 Upload completed for:", file.name);
  };

  const handleChangeVideo = () => {
    fileInputRef.current.click(); 
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const hanFileUpload = () => {
    if (!file) return;
    uploadFileInChunks(file);
  };

  const handleFileDownload = async () => {
    try {
      const response = await axios.get(
        `http://172.26.220.40:5000/download/${uploadId}/1dbbdec8-bdc5-495b-89a3-f1049c721b0e_sample1.mp4`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "1dbbdec8-bdc5-495b-89a3-f1049c721b0e_sample1.mp4"); // Specify the file name for download
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Error downloading file:", err.message);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] mx-4 gap-6">
      {/* React Player */}
      {videoURL && (
        <div className="w-full max-w-[720px] flex justify-center items-center md:mt-20 mt-0">
          <div className="rounded-2xl overflow-hidden bg-gray-600">
            <ReactPlayer
              url={videoURL}
              controls
              className="rounded-2xl"
              style={{ maxHeight: "95vh", maxWidth: "100%" }}
            />
          </div>
        </div>
      )}
      {/* Upload folder animation and input */}
      {!file ? (
        <div className={style.container}>
          <div className={style.folder}>
            <div className={style.frontSide}>
              <div className={style.tip}></div>
              <div className={style.cover}></div>
            </div>
            <div className={`${style.backSide} ${style.cover}`}></div>
          </div>
          <label className={style.customFileUpload}>
            <input
              className={style.title}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
            />
            Choose a file
          </label>
        </div>
      ) : (
        <>
          <input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex gap-4 items-center justify-center">
            {" "}
            <button
              onClick={handleChangeVideo}
              className="flex items-center justify-center cursor-pointer bg-gradient-to-r from-[#ffc75d] to-[#ffc708] shadow-[0_0_24px_#ffb20861] border-2 border-[#ffe825] rounded-full transition-all duration-300 px-5 py-2.5 text-[#09090b] font-bold text-shadow-custom hover:bg-[#ffc75d] hover:shadow-[0_0_34px_#ffb20861] hover:text-shadow-glow hover:border-[#ffe825]"
            >
              <MdEdit size={20} className="drop-shadow-md" />
            </button>
            <button
              onClick={hanFileUpload}
              className="flex items-center justify-center cursor-pointer bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] shadow-[0_0_24px_rgba(59,130,246,0.5)] border-2 border-[#93c5fd] rounded-full transition-all duration-300 px-5 py-2.5 text-white font-bold hover:shadow-[0_0_34px_rgba(59,130,246,0.6)] hover:border-[#bfdbfe]"
            >
              <FiUploadCloud size={20} className="drop-shadow-md" />
            </button>
            <button
              onClick={handleFileDownload}
              className="flex items-center justify-center cursor-pointer bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] shadow-[0_0_24px_rgba(59,130,246,0.5)] border-2 border-[#93c5fd] rounded-full transition-all duration-300 px-5 py-2.5 text-white font-bold hover:shadow-[0_0_34px_rgba(59,130,246,0.6)] hover:border-[#bfdbfe]"
            >
              <FiUploadCloud size={20} className="drop-shadow-md" />
            </button>
          </div>
        </>
      )}
      {/* File name */}
      {file?.name && (
        <p className="max-w-[200px] truncate font-semibold text-dark-500">
          {file?.name}
        </p>
      )}

      {/* Progress bar */}
      {(isUploading || isProcessing) && (
        <ProgressBar
          progress={isUploading ? uploadProgress : processingProgress}
        />
      )}
    </div>
  );
};

export default Upload;
