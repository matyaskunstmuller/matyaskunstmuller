import os
import subprocess
import shutil
from PIL import Image

# ================= NASTAVENÍ =================

# Tvé složky
TARGET_DIRS = [
    './projects/fotky/assets/buco',
    './projects/fotky/assets/krusky',
    './projects/fotky/assets/operace bahňáci',
    './projects/fotky/assets/semi centrifuga',
    './projects/fotky/assets/Silvestr balls',
    './projects/fotky/assets/Tábor',
]

# --- Nastavení pro OBRÁZKY ---
IMG_MAX_SIZE = 1920      # Max šířka/výška v px
IMG_QUALITY = 80         # Kvalita WebP (0-100), 80 je ideál
IMG_METHOD = 6           # 6 = Nejlepší komprese (nejpomalejší, ale nejmenší soubor)

# --- Nastavení pro VIDEA ---
VID_MAX_WIDTH = 1920
VID_CRF = 40    # Kvalita (30-50).

# =============================================

def optimize_image(file_path):
    try:
        # Zjištění, zda jde o konverzi nebo jen optimalizaci
        is_conversion = not file_path.lower().endswith('.webp')
        
        with Image.open(file_path) as img:
            original_size = os.path.getsize(file_path)
            w, h = img.size
            
            # 1. Resize (Změna velikosti)
            resize_needed = False
            if w > IMG_MAX_SIZE or h > IMG_MAX_SIZE:
                img.thumbnail((IMG_MAX_SIZE, IMG_MAX_SIZE), Image.Resampling.LANCZOS)
                resize_needed = True
            
            # 2. Uložení jako WebP
            if is_conversion:
                # Vytvoříme novou cestu s koncovkou .webp
                new_path = os.path.splitext(file_path)[0] + ".webp"
                img.save(new_path, 'WEBP', quality=IMG_QUALITY, method=IMG_METHOD)
                
                # Smažeme starý soubor (jpg/png)
                os.remove(file_path)
                
                new_size = os.path.getsize(new_path)
                print(f"[KONVERZE] {os.path.basename(file_path)} -> WEBP ({new_size/1024:.0f}kB)")
            else:
                # Je to už webp, jen ho přeuložíme optimalizovaně
                img.save(file_path, 'WEBP', quality=IMG_QUALITY, method=IMG_METHOD)
                new_size = os.path.getsize(file_path)
                
                if original_size - new_size > 1024:
                    percent = 100 - (new_size / original_size * 100)
                    action = "RESIZE" if resize_needed else "OPTIM"
                    print(f"[{action}] {os.path.basename(file_path)}: {original_size/1024:.0f}kB -> {new_size/1024:.0f}kB (-{percent:.0f}%)")

    except Exception as e:
        print(f"[CHYBA IMG] {os.path.basename(file_path)}: {e}")


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
    print("--- START KOMPRESE (FOTKY NA WEBP + VIDEA) ---")
    
    for folder in TARGET_DIRS:
        if not os.path.exists(folder):
            print(f"Varování: Složka '{folder}' neexistuje, přeskakuji.")
            continue
            
        print(f"\n>>> Zpracovávám složku: {folder}")
        
        for root, dirs, files in os.walk(folder):
            for file in files:
                file_path = os.path.join(root, file)
                ext = file.lower()
                
                # 1. Obrázky (JPG, PNG, WEBP)
                if ext.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    optimize_image(file_path)
                
                # 2. Videa (WEBM)
                elif ext.endswith('.webm'):
                    optimize_video(file_path)

    print("\n--- HOTOVO VŠE ---")

if __name__ == "__main__":
    main()