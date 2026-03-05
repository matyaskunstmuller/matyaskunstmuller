import os
import argparse
import subprocess
import sys
from PIL import Image

def get_ffmpeg_path():
    local_ffmpeg = os.path.join(os.getcwd(), "ffmpeg.exe")
    if os.path.exists(local_ffmpeg):
         return local_ffmpeg
    return "ffmpeg"

def optimize_image(file_path, max_size, quality, method):
    try:
        is_conversion = not file_path.lower().endswith('.webp')
        with Image.open(file_path) as img:
            original_size = os.path.getsize(file_path)
            w, h = img.size
            resize_needed = False
            if w > max_size or h > max_size:
                ratio = max_size / float(max(w, h))
                new_size = (int(w * ratio), int(h * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
                resize_needed = True
            
            if is_conversion:
                new_path = os.path.splitext(file_path)[0] + ".webp"
                img.save(new_path, 'WEBP', quality=quality, method=method)
                os.remove(file_path)
                print(f"[CONVERT] {os.path.basename(file_path)} -> WEBP")
            else:
                img.save(file_path, 'WEBP', quality=quality, method=method)
                new_size = os.path.getsize(file_path)
                if original_size - new_size > 1024:
                    print(f"[{'RESIZE' if resize_needed else 'OPTIM'}] {os.path.basename(file_path)}")
    except Exception as e:
        print(f"[ERR IMG] {os.path.basename(file_path)}: {e}")

def optimize_video(file_path, max_width, crf):
    ffmpeg_exe = get_ffmpeg_path()
    temp_path = file_path + "_temp.webm"
    cmd = [
        ffmpeg_exe, '-y', '-i', file_path,
        '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-auto-alt-ref', '0',
        '-b:v', '0', '-crf', str(crf), '-vf', f"scale='min({max_width},iw)':-2",
        '-an', '-deadline', 'good', '-cpu-used', '3', temp_path
    ]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        os.replace(temp_path, file_path)
        print(f"[OPTIM VID] {os.path.basename(file_path)}")
    except Exception as e:
        print(f"[ERR VID] {os.path.basename(file_path)}: {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)

def convert_webm_to_mov(file_path):
    ffmpeg_exe = get_ffmpeg_path()
    mov_path = os.path.splitext(file_path)[0] + ".mov"
    if os.path.exists(mov_path):
        return
    codec = 'hevc_videotoolbox' if sys.platform == 'darwin' else 'libx265'
    extra_args = ['-allow_sw', '1', '-alpha_quality', '0.75', '-vtag', 'hvc1'] if sys.platform == 'darwin' else ['-x265-params', 'alpha=1', '-tag:v', 'hvc1']
    cmd = [ffmpeg_exe, '-y', '-i', file_path, '-c:v', codec] + extra_args + [mov_path]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"[MOV] {os.path.basename(file_path)} -> .mov")
    except Exception as e:
         print(f"[ERR MOV] {os.path.basename(file_path)}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Unified Media Optimizer")
    parser.add_argument("folder", nargs='?', default=".", help="Target folder to optimize")
    parser.add_argument("--img-size", type=int, default=1920, help="Max image width/height")
    parser.add_argument("--img-quality", type=int, default=80, help="WebP quality (0-100)")
    parser.add_argument("--vid-width", type=int, default=1920, help="Max video width")
    parser.add_argument("--vid-crf", type=int, default=40, help="Video CRF (30-50)")
    parser.add_argument("--mov", action="store_true", help="Also convert webm to mov (alpha)")
    args = parser.parse_args()

    print(f"--- OPTIMIZING: {args.folder} ---")
    for root, dirs, files in os.walk(args.folder):
        if ".git" in root or "thumbnails" in root:
            continue
        for file in files:
            file_path = os.path.join(root, file)
            ext = file.lower()
            if ext.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                optimize_image(file_path, args.img_size, args.img_quality, 6)
            elif ext.endswith('.webm'):
                optimize_video(file_path, args.vid_width, args.vid_crf)
                if args.mov:
                    convert_webm_to_mov(file_path)
    print("--- DONE ---")

if __name__ == "__main__":
    main()
