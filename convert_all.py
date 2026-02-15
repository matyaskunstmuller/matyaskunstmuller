import os
import subprocess
import sys

def convert_webm_to_mov(root_dir):
    print(f"--- KONVERZE WEBM -> MOV (HEVC + ALPHA) v: {root_dir} ---")
    
    # Detekce kodeku podle OS
    if sys.platform == 'darwin':
        # macOS (Apple Silicon / Intel) - HW akcelerace
        codec = 'hevc_videotoolbox'
        extra_args = ['-allow_sw', '1', '-alpha_quality', '0.75', '-vtag', 'hvc1']
    else:
        # Windows/Linux fallback (CPU encoding)
        codec = 'libx265'
        # Pro libx265 alpha kanál
        extra_args = ['-x265-params', 'alpha=1', '-tag:v', 'hvc1']

    count = 0
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.lower().endswith(".webm"):
                webm_path = os.path.join(dirpath, filename)
                mov_path = os.path.splitext(webm_path)[0] + ".mov"
                
                if not os.path.exists(mov_path):
                    print(f"[KONVERZE] {filename} -> .mov")
                    try:
                        cmd = [
                            'ffmpeg', '-y',
                            '-i', webm_path,
                            '-c:v', codec
                        ] + extra_args + [
                            mov_path
                        ]
                        
                        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        count += 1
                        print(f"   -> Hotovo: {os.path.basename(mov_path)}")
                    except Exception as e:
                        print(f"   -> CHYBA: {e}")
                else:
                    pass # .mov již existuje
                    
    print(f"--- Hotovo. Konvertováno {count} souborů. ---")

if __name__ == "__main__":
    current_folder = os.getcwd()
    convert_webm_to_mov(current_folder)