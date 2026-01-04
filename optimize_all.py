import os
import subprocess
import shutil

# ================= NASTAVENÍ =================

# Tvé složky
TARGET_DIRS = [
    './projects/book/assets',
    './projects/book/media',
   
]

# --- Nastavení pro VIDEA ---
VID_MAX_WIDTH = 1920
VID_CRF = 40    # Kvalita (30-50).

# =============================================

def optimize_video(file_path):
    if shutil.which("ffmpeg") is None:
        print("!!! CHYBA: Nemám FFmpeg. Video přeskočeno.")
        return

    temp_path = file_path + "_temp.webm"
    original_size = os.path.getsize(file_path)

    # Příkaz s podporou PRŮHLEDNOSTI
    cmd = [
        'ffmpeg', '-y',
        '-i', file_path,
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuva420p',  # <--- Zachování průhlednosti
        '-auto-alt-ref', '0',    # <--- Nutné pro průhlednost
        '-b:v', '0',
        '-crf', str(VID_CRF),
        '-vf', f"scale='min({VID_MAX_WIDTH},iw)':-2", 
        '-an',                # Bez zvuku
        '-deadline', 'good',
        '-cpu-used', '3',
        temp_path
    ]

    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        new_size = os.path.getsize(temp_path)
        
        # Nahradíme originál
        os.replace(temp_path, file_path)
        
        diff = original_size - new_size
        if diff > 0:
            percent = 100 - (new_size / original_size * 100)
            print(f"[VIDEO ALPHA] {os.path.basename(file_path)}: {original_size/1024/1024:.2f}MB -> {new_size/1024/1024:.2f}MB (-{percent:.0f}%)")
        else:
            print(f"[VIDEO ALPHA] {os.path.basename(file_path)}: Hotovo (velikost podobná)")
            
    except Exception as e:
        print(f"[CHYBA VIDEO] {os.path.basename(file_path)}: {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)

def main():
    print("--- START KOMPRESE (POUZE VIDEA S PRŮHLEDNOSTÍ) ---")
    
    for folder in TARGET_DIRS:
        if not os.path.exists(folder):
            print(f"Varování: Složka '{folder}' neexistuje, přeskakuji.")
            continue
            
        print(f"\n>>> Zpracovávám složku: {folder}")
        
        for root, dirs, files in os.walk(folder):
            for file in files:
                file_path = os.path.join(root, file)
                ext = file.lower()
                
                # Zpracujeme POUZE .webm
                if ext.endswith('.webm'):
                    optimize_video(file_path)

    print("\n--- HOTOVO VŠE ---")

if __name__ == "__main__":
    main()