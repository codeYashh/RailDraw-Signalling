import os
from PIL import Image, ImageDraw

def draw_vande_bharat_icon(size: int) -> Image.Image:
    # Supersample 4x for razor-sharp anti-aliased edges
    S = size * 4
    img = Image.new("RGBA", (S, S), (7, 20, 38, 255))
    d = ImageDraw.Draw(img)

    def p(nx, ny):
        return (int(nx * S / 108.0), int(ny * S / 108.0))

    # Upper deep navy gradient band
    d.polygon([p(0, 0), p(108, 0), p(108, 60), p(54, 70), p(0, 60)], fill=(14, 41, 75, 255))

    # Sweeping Indian Tricolor Horizon Ribbons
    def ribbon(y_edge, y_mid, h, color):
        pts = [
            p(0, y_edge), p(27, (y_edge + y_mid) / 2), p(54, y_mid), p(81, (y_edge + y_mid) / 2), p(108, y_edge),
            p(108, y_edge + h), p(81, (y_edge + y_mid) / 2 + h), p(54, y_mid + h), p(27, (y_edge + y_mid) / 2 + h), p(0, y_edge + h),
        ]
        d.polygon(pts, fill=color)

    ribbon(72, 61, 6.2, (255, 153, 51, 255))   # Saffron #FF9933
    ribbon(78.5, 67.5, 6.2, (255, 255, 255, 255))  # White #FFFFFF
    ribbon(85, 74, 6.2, (19, 136, 8, 255))     # India Green #138808

    # Converging steel rails
    w_rail = max(2, int(2.6 * S / 108.0))
    d.line([p(30, 92), p(44, 72)], fill=(148, 163, 184, 255), width=w_rail)
    d.line([p(78, 92), p(64, 72)], fill=(148, 163, 184, 255), width=w_rail)
    w_slp = max(1, int(1.6 * S / 108.0))
    d.line([p(33, 87), p(75, 87)], fill=(100, 116, 139, 255), width=w_slp)
    d.line([p(38, 80), p(70, 80)], fill=(100, 116, 139, 255), width=w_slp)

    # Vande Bharat Aerodynamic Bullet Nose Body (Pearl White)
    body = [
        p(54, 18), p(64, 19.5), p(72, 26), p(77, 37), p(80, 56),
        p(79, 66), p(73, 73), p(64, 76), p(44, 76), p(35, 73),
        p(29, 66), p(28, 56), p(31, 37), p(36, 26), p(44, 19.5),
    ]
    d.polygon(body, fill=(248, 250, 252, 255))

    # Subtle right-side silver shading
    shade = [
        p(54, 18), p(64, 19.5), p(72, 26), p(77, 37), p(80, 56),
        p(79, 66), p(73, 73), p(64, 76), p(54, 76),
    ]
    d.polygon(shade, fill=(226, 232, 240, 255))

    # Signature Vande Bharat Electric Blue Nose Skirt
    skirt = [
        p(28.5, 56), p(42, 62), p(54, 63.5), p(66, 62), p(79.5, 56),
        p(79, 66), p(73, 73), p(64, 76), p(44, 76), p(35, 73), p(29, 66),
    ]
    d.polygon(skirt, fill=(2, 132, 199, 255))

    # Lower Cowcatcher
    d.polygon([p(37, 70), p(71, 70), p(66, 76), p(42, 76)], fill=(12, 35, 64, 255))

    # Wrap-around Panoramic Dark Cockpit Windshield
    windshield = [
        p(54, 25), p(63, 26.5), p(70, 32), p(73.5, 42.5),
        p(65, 46.5), p(54, 48), p(43, 46.5), p(34.5, 42.5),
        p(38, 32), p(45, 26.5),
    ]
    d.polygon(windshield, fill=(11, 23, 42, 255))

    # Windshield Cyan Glint
    glint = [p(42, 31.5), p(49, 28), p(54, 27.5), p(50, 36.5), p(39, 39)]
    d.polygon(glint, fill=(56, 189, 248, 220))

    # Central Top Headlamp
    d.polygon([p(49, 20.5), p(59, 20.5), p(57.8, 23.3), p(50.2, 23.3)], fill=(250, 204, 21, 255))

    # Tricolor Nose Stripes on Engine Front
    def nose_stripe(y_side, y_ctr, h, color):
        pts = [
            p(31, y_side), p(54, y_ctr), p(77, y_side),
            p(77.4, y_side + h), p(54, y_ctr + h), p(30.6, y_side + h),
        ]
        d.polygon(pts, fill=color)

    nose_stripe(49.5, 54.0, 2.5, (255, 153, 51, 255))
    nose_stripe(52.0, 56.5, 2.5, (255, 255, 255, 255))
    nose_stripe(54.5, 59.0, 2.5, (19, 136, 8, 255))

    # Twin Angular LED Headlamps
    d.polygon([p(33.5, 60.5), p(44.5, 63.5), p(43, 67), p(33, 63.8)], fill=(224, 242, 254, 255))
    d.polygon([p(74.5, 60.5), p(63.5, 63.5), p(65, 67), p(75, 63.8)], fill=(224, 242, 254, 255))

    return img.resize((size, size), Image.Resampling.LANCZOS)


def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    public_dir = os.path.join(root, "frontend", "public")
    res_dir = os.path.join(root, "android", "app", "src", "main", "res")

    icon_512 = draw_vande_bharat_icon(512)
    icon_512.save(os.path.join(public_dir, "icon-512.png"), "PNG")

    icon_192 = draw_vande_bharat_icon(192)
    icon_192.save(os.path.join(public_dir, "icon-192.png"), "PNG")

    icon_64 = draw_vande_bharat_icon(64)
    icon_64.save(os.path.join(public_dir, "favicon.ico"), format="ICO", sizes=[(64, 64), (32, 32), (16, 16)])

    # Also write SVG favicon
    svg_logo = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">
  <rect width="108" height="108" rx="22" fill="#071426"/>
  <path d="M0,74 Q54,62 108,74 L108,79.5 Q54,67.5 0,79.5 Z" fill="#FF9933"/>
  <path d="M0,80 Q54,68 108,80 L108,85.5 Q54,73.5 0,85.5 Z" fill="#FFFFFF"/>
  <path d="M0,86 Q54,74 108,86 L108,91.5 Q54,79.5 0,91.5 Z" fill="#138808"/>
  <path d="M54,20 C66,20 74,28 76,42 L78,61 C78,68 72,73 64,74 L44,74 C36,73 30,68 30,61 L32,42 C34,28 42,20 54,20 Z" fill="#F8FAFC"/>
  <path d="M30.5,56 C38,61 46,63 54,63 C62,63 70,61 77.5,56 L77.8,62 C77.2,68.5 71.5,73 64,74 L44,74 C36.5,73 30.8,68.5 30.2,62 Z" fill="#0284C7"/>
  <path d="M54,27 C63.5,27 69.5,33 71.5,43 C66,46 60,47.5 54,47.5 C48,47.5 42,46 36.5,43 C38.5,33 44.5,27 54,27 Z" fill="#0B172A"/>
  <path d="M43,32.5 C46.5,30 50,29.2 54,29.2 L51,36 C47,36.2 43.5,37 40.5,38.5 Z" fill="#38BDF8"/>
  <path d="M34,50 Q54,54.5 74,50 L74.5,52.3 Q54,56.8 33.5,52.3 Z" fill="#FF9933"/>
  <path d="M33.5,52.3 Q54,56.8 74.5,52.3 L74.9,54.6 Q54,59.1 33.1,54.6 Z" fill="#FFFFFF"/>
  <path d="M33.1,54.6 Q54,59.1 74.9,54.6 L75.3,56.9 Q54,61.4 32.7,56.9 Z" fill="#138808"/>
  <path d="M35.5,59.5 L44.5,62 L43,65.2 L35,62.5 Z" fill="#E0F2FE"/>
  <path d="M72.5,59.5 L63.5,62 L65,65.2 L73,62.5 Z" fill="#E0F2FE"/>
</svg>"""
    with open(os.path.join(public_dir, "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(svg_logo)

    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    for folder, sz in densities.items():
        target = os.path.join(res_dir, folder)
        os.makedirs(target, exist_ok=True)
        ic = draw_vande_bharat_icon(sz)
        ic.save(os.path.join(target, "ic_launcher.png"), "PNG")
        ic.save(os.path.join(target, "ic_launcher_round.png"), "PNG")

    print("OK: Generated Vande Bharat + Tricolor launcher icons across Web & Android mipmaps!")

if __name__ == "__main__":
    main()
