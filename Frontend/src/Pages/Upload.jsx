import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";
import style from "./Upload.module.css";

const Upload = () => {
  const [file, setFile] = useState();
  const fileInputRef = useRef();

  const videoURL = file ? URL.createObjectURL(file) : null;

  const handleChangeVideo = () => {
    fileInputRef.current.click(); // Trigger hidden input
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  console.log(file);

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
          <button
            onClick={handleChangeVideo}
            className="flex items-center justify-center cursor-pointer bg-gradient-to-r from-[#ffc75d] to-[#ffc708] shadow-[0_0_24px_#ffb20861] border-2 border-[#ffe825] rounded-full transition-all duration-300 px-5 py-2.5 text-[#09090b] font-bold text-shadow-custom hover:bg-[#ffc75d] hover:shadow-[0_0_34px_#ffb20861] hover:text-shadow-glow hover:border-[#ffe825]"
          >
            <svg
              id="UploadToCloud"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              height="16px"
              width="16px"
              className="mr-2 filter drop-shadow-md"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path
                fill="#000000"
                d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 
               2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 
               5-5 0-2.64-2.05-4.78-4.65-4.96zM14 
               13v4h-4v-4H7l4.65-4.65c.2-.2.51-.2.71 0L17 13h-3z"
              />
            </svg>
            Change Video
          </button>
        </>
      )}

      {/* File name */}
      <p className="text-white max-w-[200px] truncate">
        {file?.name || "Upload a video"}
      </p>
    </div>
  );
};

export default Upload;
