import sys
import os
import subprocess
import glob
import traceback
import uuid

# 🧾 Arguments
upload_id = sys.argv[1] if len(sys.argv) > 1 else "default_upload"
volume = sys.argv[2] if len(sys.argv) > 2 else "2.0"
noise_duration = sys.argv[3] if len(sys.argv) > 3 else "5"
input_file = sys.argv[4] if len(sys.argv) > 4 else "input_video.mp4"
output_file = sys.argv[5] if len(sys.argv) > 5 else "output_video.mp4"

job_id = str(uuid.uuid4())

# 📂 Paths
INPUT_VIDEO = input_file  # already full path from Node.js
TEMP_AUDIO = os.path.join("uploads", f"temp_audio_{job_id}.wav")
CLEANED_AUDIO = os.path.join("uploads", f"cleaned_audio_{job_id}.wav")

# ✅ Create output folder: outputs/<uploadId>
OUTPUT_FOLDER = os.path.join("outputs", upload_id)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

FINAL_OUTPUT = os.path.join(OUTPUT_FOLDER, output_file)

try:
    print("🔍 Extracting audio from video...")
    subprocess.run([
        "ffmpeg", "-y", "-i", INPUT_VIDEO,
        "-vn", "-acodec", "pcm_s16le", "-ar", "48000", TEMP_AUDIO
    ], check=True)

    print("🌀 Enhancing audio using DeepFilterNet...")
    subprocess.run([
        "/home/abhia/DeepFilterNet/venv/bin/deepFilter",
        TEMP_AUDIO,
        "--output-dir", "uploads"
    ], check=True)

    print("🔎 Finding DeepFilterNet enhanced output...")
    pattern = TEMP_AUDIO.replace(".wav", "") + "_*.wav"
    matches = glob.glob(os.path.join("uploads", os.path.basename(pattern)))
    if not matches:
        raise FileNotFoundError("DeepFilterNet output not found.")

    os.rename(matches[0], CLEANED_AUDIO)

    print("🎬 Merging cleaned audio back with video...")
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

except subprocess.CalledProcessError as cpe:
    print("❌ Subprocess failed!")
    print("Command:", cpe.cmd)
    print("Return Code:", cpe.returncode)
    print("Output:", cpe.output if hasattr(cpe, 'output') else "No output")
    sys.exit(1)

except Exception as e:
    print("❌ Unexpected error:", e)
    traceback.print_exc()
    sys.exit(1)

finally:
    for file in [TEMP_AUDIO, CLEANED_AUDIO]:
        if os.path.exists(file):
            os.remove(file)
