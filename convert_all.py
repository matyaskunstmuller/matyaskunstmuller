import os
import shutil

def delete_all_mov_files(root_dir):
    print(f"--- MAZÁNÍ .mov SOUBORŮ (CLEANUP) v: {root_dir} ---")
    count = 0
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.lower().endswith(".mov"):
                file_path = os.path.join(dirpath, filename)
                try:
                    os.remove(file_path)
                    print(f"[SMAZÁNO] {filename}")
                    count += 1
                except Exception as e:
                    print(f"[CHYBA] Nelze smazat {filename}: {e}")
    print(f"--- Hotovo. Smazáno celkem {count} souborů. ---")

def delete_thumbnails(root_dir):
    thumbnails_dir = os.path.join(root_dir, "thumbnails")
    if os.path.exists(thumbnails_dir):
        print(f"--- MAZÁNÍ SLOŽKY THUMBNAILS: {thumbnails_dir} ---")
        try:
            shutil.rmtree(thumbnails_dir)
            print("[SMAZÁNO] Složka thumbnails byla kompletně odstraněna.")
        except Exception as e:
            print(f"[CHYBA] Nelze smazat složku thumbnails: {e}")

if __name__ == "__main__":
    current_folder = os.getcwd()
    delete_all_mov_files(current_folder)
    delete_thumbnails(current_folder)