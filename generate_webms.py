import os
import subprocess
import json

# Data from fotky.html - all albums
albums_data = [
    {
        "title": "Silvestr balls",
        "folder": "projects/fotky/assets/Silvestr balls",
        "files": [
            "silvert_maty-32.webp", "silvert_maty-37.webp", "silvert_maty-45.webp",
            "silvert_maty-49.webp", "silvert_maty-50.webp", "silvert_maty-52.webp", 
            "silvert_maty-53.webp", "silvert_maty-65.webp", "silvert_maty-67.webp"
        ]
    },
    {
        "title": "Krušky",
        "folder": "projects/fotky/assets/krusky",
        "files": [
            "109-DSC03906.webp", "113-DSC03910.webp", "281-DSC04130.webp",
            "285-DSC04134.webp", "286-DSC04135.webp", "287-DSC04136.webp", 
            "444-DSC04297.webp", "446-DSC04299.webp", "452-DSC04305.webp", 
            "463-DSC04316.webp", "85-DSC03875.webp"
        ]
    },
    {
        "title": "Tábor",
        "folder": "projects/fotky/assets/Tábor",
        "files": [
            "tabor fotky pro knížku-10.webp", "tabor fotky pro knížku-103.webp", 
            "tabor fotky pro knížku-12.webp", "tabor fotky pro knížku-16.webp", 
            "tabor fotky pro knížku-17.webp", "tabor fotky pro knížku-32.webp",
            "tabor fotky pro knížku-95.webp",
            "tabor25_maty thunder_wonder fotak-098.webp",
            "tabor25_maty thunder_wonder fotak-249.webp",
            "tabor25_maty thunder_wonder fotak-250.webp",
            "tabor25_maty thunder_wonder fotak-324.webp",
            "tabor25_maty thunder_wonder fotak-399.webp",
            "tabor25_maty thunder_wonder fotak-400.webp",
            "tabor25_maty thunder_wonder fotak-414.webp"
        ]
    },
    {
        "title": "Operace bahňáci",
        "folder": "projects/fotky/assets/operace bahňáci",
        "files": [
            "DSC03737.webp", "podmostaci samota.webp", "podz.webp",
            "silvert_maty-95.webp", "silvert_maty-98.webp"
        ]
    },
    {
        "title": "Bůčo puťák",
        "folder": "projects/fotky/assets/buco",
        "files": [
            "DSC03580-Edit.webp", "DSC03608-Edit.webp", "DSC03626.webp",
            "DSC03647.webp", "silvert_maty-90.webp", "silvert_maty-99.webp"
        ]
    },
    {
        "title": "Semi centrifuga",
        "folder": "projects/fotky/assets/semi centrifuga",
        "files": [
            "Semi centrifuga - matyho fotacek 30.4.24-13.webp",
            "Semi centrifuga - matyho fotacek 30.4.24-18.webp",
            "Semi centrifuga - matyho fotacek 30.4.24-19.webp",
            "Semi centrifuga - matyho fotacek 30.4.24-23.webp",
            "Semi centrifuga - matyho fotacek 30.4.24-28.webp",
            "Semi centrifuga - matyho fotacek 30.4.24-34.webp"
        ]
    }
]

output_dir = "projects/fotky/webms"
os.makedirs(output_dir, exist_ok=True)
ffmpeg_path = os.path.abspath("ffmpeg.exe")

for album in albums_data:
    title = album['title'].replace(" - ", "_").replace(" ", "_").lower()
    output_filename = os.path.abspath(os.path.join(output_dir, f"{title}.webm"))
    concat_file_path = f"{title}_concat.txt"
    frames = album['files']
    
    if not frames:
        continue
    
    # Create the concat demuxer file
    valid_frames = []
    with open(concat_file_path, "w", encoding="utf-8") as f:
        for frame in frames:
            frame_path = os.path.abspath(os.path.join(album["folder"], frame))
            if not os.path.exists(frame_path):
                print(f"File not found: {frame_path}")
                continue
            valid_frames.append(frame_path)
            formatted_path = frame_path.replace("\\", "/")
            f.write(f"file '{formatted_path}'\n")
            f.write("duration 2\n")
        
        # Repeat last frame once more (ffmpeg concat demuxer quirk)
        if valid_frames:
            f.write(f"file '{valid_frames[-1].replace(chr(92), '/')}'\n")
    
    if not valid_frames:
        print(f"Skipping {title} - no valid files found")
        os.remove(concat_file_path)
        continue

    # KLÍČOVÁ OPRAVA: vf filter který ZACHOVÁVÁ aspect ratio:
    # 1. Škáluje na max 1080x1080 se zachováním poměru
    # 2. Zkontroluje jestli šířka/výška je liché číslo (VP9 vyžaduje sudé) a opraví
    # format yuv420p je nezbytný pro Chrome/Firefox kompatibilitu
    vf_filter = (
        "scale=iw*min(1080/iw\\,1080/ih):ih*min(1080/iw\\,1080/ih),"  # scale to fit in 1080x1080 box
        "pad=width=ceil(iw/2)*2:height=ceil(ih/2)*2"                    # ensure even dimensions
    )

    cmd = [
        ffmpeg_path,
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_file_path,
        "-c:v", "libvpx-vp9",
        "-crf", "28",
        "-b:v", "0",
        "-vf", vf_filter,
        "-pix_fmt", "yuv420p",
        "-r", "1",    # 1 fps je dostačující pro slideshow (menší soubory)
        output_filename
    ]
    
    print(f"Generating {title}...")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  OK: {output_filename}")
        else:
            print(f"  ERROR: {result.stderr[-500:]}")
    except Exception as e:
        print(f"  EXCEPTION: {e}")
        
    try:
        os.remove(concat_file_path)
    except:
        pass

print("Done.")
