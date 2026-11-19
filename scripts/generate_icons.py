import os
from PIL import Image

src_icon = r'frontend\public\icon-512.png'
img = Image.open(src_icon).convert("RGBA")

densities = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

for folder, size in densities.items():
    target_dir = os.path.join(r"android\app\src\main\res", folder)
    os.makedirs(target_dir, exist_ok=True)
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(os.path.join(target_dir, "ic_launcher.png"), "PNG")
    resized.save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")

print("Created all mipmap launcher PNG icons!")
