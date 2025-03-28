import sys
import os
import subprocess
import glob

# Default values
volume = sys.argv[1] if len(sys.argv) > 1 else "2.0"
noise_duration = sys.argv[2] if len(sys.argv) > 2 else "5"
input_file = sys.argv[3] if len(sys.argv) > 3 else "input_video.mp4"
output_file = sys.argv[4] if len(sys.argv) > 4 else "output_video.mp4"

INPUT_VIDEO = os.path.join("uploads", input_file)
TEMP_AUDIO = os.path.join("uploads", "temp_audio.wav")
CLEANED_AUDIO = os.path.join("uploads", "cleaned_audio.wav")
FINAL_OUTPUT = os.path.join("outputs", output_file)


try:
    print("Extracting audio from video...")
    subprocess.run([
        "ffmpeg", "-y", "-i", INPUT_VIDEO,
        "-vn", "-acodec", "pcm_s16le", "-ar", "48000", TEMP_AUDIO
    ], check=True)

    print("Enhancing audio using DeepFilterNet...")
    subprocess.run([
        "/home/abhia/DeepFilterNet/venv/bin/deepFilter",
        TEMP_AUDIO,
        "--output-dir", "uploads"
    ], check=True)

    # Find DeepFilterNet output
    pattern = TEMP_AUDIO.replace(".wav", "") + "_*.wav"
    matches = glob.glob(os.path.join("uploads", os.path.basename(pattern)))
    if not matches:
        raise FileNotFoundError("DeepFilterNet output not found.")
    
    os.rename(matches[0], CLEANED_AUDIO)

    print("Merging cleaned audio back with video...")
    subprocess.run([
        "ffmpeg", "-y",
        "-i", INPUT_VIDEO,
        "-i", CLEANED_AUDIO,
        "-filter:a", f"volume={volume}",
        "-c:v", "copy",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        FINAL_OUTPUT
    ], check=True)

    print("✅ Processing complete! Output saved to:", FINAL_OUTPUT)

except Exception as e:
    print("❌ Error:", e)
    sys.exit(1)

finally:
    for file in [TEMP_AUDIO, CLEANED_AUDIO]:
        if os.path.exists(file):
            os.remove(file)
