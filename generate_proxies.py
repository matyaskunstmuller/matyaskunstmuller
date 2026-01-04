import os
import subprocess
from PIL import Image
import sys

# --- NASTAVENÍ ---
SOURCE_DIR = "."
TARGET_DIR = "thumbnails"
MAX_WIDTH = 400

# Přípony
IMG_EXTS = {'.jpg', '.jpeg', '.png', '.webp'}
VID_EXTS = {'.webm', '.mp4', '.mov'}

def get_ffmpeg_path():
    # 1. Zkusíme najít ffmpeg.exe přímo v aktuální složce
    local_ffmpeg = os.path.join(os.getcwd(), "ffmpeg.exe")
    if os.path.exists(local_ffmpeg):
        return local_ffmpeg
    
    # 2. Pokud není, zkusíme systémový příkaz 'ffmpeg'
    return "ffmpeg"

def generate_proxies():
    ffmpeg_exe = get_ffmpeg_path()
    print(f"--- POUŽÍVÁM FFMPEG: {ffmpeg_exe} ---")
    print(f"--- GENERUJI NÁHLEDY DO: '{TARGET_DIR}' ---")
    
    count_img = 0
    count_vid = 0

    for root, dirs, files in os.walk(SOURCE_DIR):
        if TARGET_DIR in root or ".git" in root:
            continue

        for file in files:
            ext = os.path.splitext(file)[1].lower()
            src_path = os.path.join(root, file)
            rel_path = os.path.relpath(src_path, SOURCE_DIR)
            dest_path = os.path.join(TARGET_DIR, rel_path)
            
            if os.path.exists(dest_path):
                continue

            os.makedirs(os.path.dirname(dest_path), exist_ok=True)

            # --- OBRÁZKY ---
            if ext in IMG_EXTS:
                try:
                    with Image.open(src_path) as img:
                        if img.width > MAX_WIDTH:
                            ratio = MAX_WIDTH / float(img.width)
                            new_height = int((float(img.height) * float(ratio)))
                            img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
                            img.save(dest_path, quality=85, optimize=True)
                            print(f"[IMG] {rel_path}")
                            count_img += 1
                        else:
                            img.save(dest_path)
                except Exception as e:
                    print(f"Chyba IMG: {e}")

            # --- VIDEA ---
            elif ext in VID_EXTS:
                try:
                    print(f"[VID] {rel_path} ...")
                    cmd = [
                        ffmpeg_exe, '-y', 
                        '-i', src_path,
                        '-vf', f'scale={MAX_WIDTH}:-2',
                        '-an',                  
                        '-c:v', 'libvpx-vp9' if ext == '.webm' else 'libx264',
                        '-crf', '35',           
                        '-b:v', '0',            
                        '-deadline', 'realtime', 
                        '-cpu-used', '4',       
                        '-loglevel', 'error',   
                        dest_path               
                    ]
                    subprocess.run(cmd, check=True)
                    count_vid += 1
                except FileNotFoundError:
                    print("!!! CHYBA: FFmpeg nebyl nalezen. Ujistěte se, že 'ffmpeg.exe' je ve složce.")
                    return
                except Exception as e:
                    print(f"!!! Chyba VID: {e}")

    print(f"--- HOTOVO ---")
    print(f"Vygenerováno: {count_img} obrázků, {count_vid} videí.")

if __name__ == "__main__":
    generate_proxies()