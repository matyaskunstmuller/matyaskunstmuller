import os
import subprocess

def convert_webm_to_hevc_mov(root_dir):
    print(f"--- Hledám .webm soubory v: {root_dir} ---")
    
    # Projdeme všechny složky a podsložky
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.lower().endswith(".webm"):
                webm_path = os.path.join(dirpath, filename)
                mov_filename = os.path.splitext(filename)[0] + ".mov"
                mov_path = os.path.join(dirpath, mov_filename)

                # Pokud .mov už existuje a má velikost > 0, přeskočíme ho
                if os.path.exists(mov_path) and os.path.getsize(mov_path) > 0:
                    print(f"[SKIP] Soubor existuje: {mov_filename}")
                    continue

                print(f"[CONVERT] Zpracovávám: {filename}")

                # Příkaz pro FFmpeg
                # PŘIDÁNA OPRAVA: "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2"
                # Toto zajistí, že rozměry budou vždy dělitelné 2 (vyžadováno pro HEVC)
                cmd = [
                    "ffmpeg",
                    "-i", webm_path,
                    "-c:v", "libx265",          # Kodek HEVC
                    "-x265-params", "alpha=1",  # Zapnutí průhlednosti
                    "-tag:v", "hvc1",           # Tag pro Apple
                    "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", # <--- ZDE JE OPRAVA ROZMĚRŮ
                    "-an",                      # Bez zvuku
                    "-y",                       # Přepsat
                    mov_path
                ]

                try:
                    # Spustíme konverzi
                    # Nyní vypisujeme stderr, pokud dojde k chybě, abychom viděli proč
                    result = subprocess.run(cmd, capture_output=True, text=True)
                    
                    if result.returncode == 0:
                        print(f"   ---> Hotovo: {mov_filename}")
                    else:
                        print(f"   !!! CHYBA při konverzi: {filename}")
                        # Vypíšeme poslední řádek chyby pro diagnostiku
                        print(f"       Detail: {result.stderr.splitlines()[-1] if result.stderr else 'Neznámá chyba'}")

                except FileNotFoundError:
                    print("   !!! CHYBA: FFmpeg není nainstalován nebo není v PATH.")
                    return

if __name__ == "__main__":
    current_folder = os.getcwd()
    convert_webm_to_hevc_mov(current_folder)
    print("--- Vše hotovo ---")