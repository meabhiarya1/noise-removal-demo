import soundfile as sf
import noisereduce as nr
import numpy as np
import subprocess
import os
import sys

INPUT_VIDEO = "uploads/input_video.mp4"
TEMP_AUDIO = "uploads/temp_audio.wav"
CLEAN_AUDIO = "uploads/cleaned_audio.wav"
FINAL_VIDEO = "outputs/output_video.mp4"

# Get volume multiplier from CLI
volume = float(sys.argv[1]) if len(sys.argv) > 1 else 2.0

try:
    subprocess.run(["ffmpeg", "-y", "-i", INPUT_VIDEO, "-vn", "-acodec", "pcm_s16le", TEMP_AUDIO], check=True)

    data, rate = sf.read(TEMP_AUDIO)
    if data.ndim > 1:
        data = np.mean(data, axis=1)
    noise_clip = data[0:int(rate * 0.2)]
    cleaned_audio = nr.reduce_noise(y=data, sr=rate, y_noise=noise_clip, prop_decrease=1.0, stationary=False)
    sf.write(CLEAN_AUDIO, cleaned_audio, rate)

    subprocess.run([
        "ffmpeg", "-y",
        "-i", INPUT_VIDEO,
        "-i", CLEAN_AUDIO,
        "-filter:a", f"volume={volume}",
        "-c:v", "copy",
        "-map", "0:v:0",
        "-map", "1:a:0",
        FINAL_VIDEO
    ], check=True)

    print("Done!")

finally:
    for f in [TEMP_AUDIO, CLEAN_AUDIO]:
        if os.path.exists(f):
            os.remove(f)
