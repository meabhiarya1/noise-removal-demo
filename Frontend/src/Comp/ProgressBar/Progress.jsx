import React from "react";

const Progress = ({ progress }) => {
  // Ensure that progress is clamped between 0 and 100
  const videoProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="relative w-[60%] max-w-[500px] h-[25px] bg-gradient-to-r from-[#1b2735] to-[#090a0f] rounded-[30px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.5)] border-[1px] border-[#313131]">
      <div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00f260] to-[#0575e6] rounded-[30px] shadow-[0_0_15px_#00f260,0_0_30px_#0575e6]"
        style={{
          width: `${videoProgress}%`,
          transition: "width 0.4s ease-in-out", // Smooth transition for width change
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-radial from-white/15 to-transparent opacity-50 animate-ripple"></div>
      </div>
      <div className="text-xs font-bold tracking-[1px] text-white z-10 transform -translate-x-1/2 -translate-y-1/2 text-center mt-0.5">
        {Math.floor(videoProgress)}%
      </div>
    </div>
  );
};

export default Progress;
