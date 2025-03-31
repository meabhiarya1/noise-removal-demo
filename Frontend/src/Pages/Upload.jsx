import React from "react";
import style from "./Upload.module.css";

const Upload = () => {
  return (
    <div>
      <div className={style.container}>
        <div className={style.folder}>
          <div className={style.frontSide}>
            <div className={style.tip}></div>
            <div className={style.cover}></div>
          </div>
          <div className={`${style.backSide} ${style.cover}`}></div>
        </div>
        <label className={style.customFileUpload}>
          <input className={style.title} type="file" />
          Choose a file
        </label>
      </div>
    </div>
  );
};

export default Upload;
