import os
from PIL import Image, ImageDraw

def draw_vande_bharat_icon(size: int) -> Image.Image:
    # Supersample 4x for razor-sharp anti-aliased edges matching ic_launcher & VandeBharatLogo.tsx
    S = size * 4
    img = Image.new("RGBA", (S, S), (7, 20, 38, 255))
    d = ImageDraw.Draw(img)

    def p(nx, ny):
        return (int(round(nx * S / 108.0)), int(round(ny * S / 108.0)))

    # Subtle upper sky atmosphere (#0E294B)
    d.polygon([p(0, 0), p(108, 0), p(108, 56), p(54, 68), p(0, 56)], fill=(14, 41, 75, 255))

    # Sweeping Indian Tricolour Speed Ribbons
    def ribbon(y_edge, y_mid, h, color):
        pts = [
            p(0, y_edge), p(27, (y_edge + y_mid) / 2), p(54, y_mid), p(81, (y_edge + y_mid) / 2), p(108, y_edge),
            p(108, y_edge + h), p(81, (y_edge + y_mid) / 2 + h), p(54, y_mid + h), p(27, (y_edge + y_mid) / 2 + h), p(0, y_edge + h),
        ]
        d.polygon(pts, fill=color)

    ribbon(73, 61, 5.0, (255, 153, 51, 255))    # Saffron #FF9933
    ribbon(78.5, 66.5, 5.0, (255, 255, 255, 255)) # White #FFFFFF
    ribbon(84, 72, 5.0, (19, 136, 8, 255))      # India Green #138808

    # Converging Perspective Steel Rails
    w_rail = max(2, int(2.4 * S / 108.0))
    d.line([p(31, 89), p(45, 73)], fill=(203, 213, 225, 255), width=w_rail)
    d.line([p(77, 89), p(63, 73)], fill=(203, 213, 225, 255), width=w_rail)
    w_slp = max(1, int(1.5 * S / 108.0))
    d.line([p(34, 84.5), p(74, 84.5)], fill=(100, 116, 139, 255), width=w_slp)
    d.line([p(38.5, 79.5), p(69.5, 79.5)], fill=(100, 116, 139, 255), width=w_slp)

    # Vande Bharat Sleek Tapered Aerodynamic Bullet Nose Shell
    body = [
        p(54, 18), p(61, 18.5), p(66, 21.5), p(69, 28), p(76, 48),
        p(77.5, 56), p(75.5, 64), p(70.5, 69.5), p(59, 75.5), p(54, 76.8),
        p(49, 75.5), p(37.5, 69.5), p(32.5, 64), p(30.5, 56), p(32, 48),
        p(39, 28), p(42, 21.5), p(47, 18.5),
    ]
    d.polygon(body, fill=(248, 250, 252, 255))

    # Cool Metallic Shading on Right Aerodynamic Flank
    shade = [
        p(54, 18), p(61, 18.5), p(66, 21.5), p(69, 28), p(76, 48),
        p(77.5, 56), p(75.5, 64), p(70.5, 69.5), p(59, 75.5), p(54, 76.8),
    ]
    d.polygon(shade, fill=(226, 232, 240, 255))

    # Signature Vande Bharat Electric Blue Lower Nose Fairing & Wedge Skirt
    skirt = [
        p(31.6, 51.5), p(54, 60.5), p(76.4, 51.5), p(76.8, 57.5),
        p(74.5, 65), p(68.5, 70.8), p(58.5, 75.6), p(54, 76.8),
        p(49.5, 75.6), p(39.5, 70.8), p(33.5, 65), p(31.2, 57.5),
    ]
    d.polygon(skirt, fill=(2, 132, 199, 255))

    # Lower Aerodynamic Splitter / Cowcatcher
    d.polygon([p(39.5, 69.5), p(54, 73.5), p(68.5, 69.5), p(63.5, 74.8), p(54, 76.8), p(44.5, 74.8)], fill=(11, 31, 58, 255))

    # Swept-Back Wrap-Around Panoramic Black Cockpit Windshield
    windshield = [
        p(54, 24.5), p(61.5, 24.8), p(66.5, 28.2), p(69.5, 35.5), p(72.5, 44.5),
        p(64, 48.2), p(54, 49.5), p(44, 48.2), p(35.5, 44.5),
        p(38.5, 35.5), p(41.5, 28.2), p(46.5, 24.8),
    ]
    d.polygon(windshield, fill=(9, 19, 36, 255))

    # Windshield Glass Diagonal Sky Glint
    glint = [p(41.5, 31.5), p(46.5, 27.5), p(53.2, 26.8), p(49.2, 40.5), p(37.8, 37.2)]
    d.polygon(glint, fill=(56, 189, 248, 220))

    # Top Destination LED Beacon
    d.polygon([p(50, 20.6), p(58, 20.6), p(57, 23.2), p(51, 23.2)], fill=(250, 204, 21, 255))

    # Sleek V-Curved Tricolour Nose Chevron
    def nose_stripe(y_side, y_ctr, h, color):
        pts = [
            p(32.4, y_side), p(54, y_ctr), p(75.6, y_side),
            p(76.0, y_side + h), p(54, y_ctr + h), p(32.0, y_side + h),
        ]
        d.polygon(pts, fill=color)

    nose_stripe(48.2, 57.5, 2.3, (255, 153, 51, 255))
    nose_stripe(50.5, 59.8, 2.3, (255, 255, 255, 255))
    nose_stripe(52.8, 62.1, 2.3, (19, 136, 8, 255))

    # Sharp Angled Vande Bharat Twin LED Headlamps
    d.polygon([p(34.2, 57.5), p(46.0, 62.4), p(44.4, 65.8), p(33.5, 61.0)], fill=(224, 242, 254, 255))
    d.polygon([p(73.8, 57.5), p(62.0, 62.4), p(63.6, 65.8), p(74.5, 61.0)], fill=(224, 242, 254, 255))
    d.polygon([p(36.5, 59.6), p(43.5, 62.6), p(42.8, 64.1), p(35.8, 61.1)], fill=(56, 189, 248, 255))
    d.polygon([p(71.5, 59.6), p(64.5, 62.6), p(65.2, 64.1), p(72.2, 61.1)], fill=(56, 189, 248, 255))

    # Aerodynamic Center Nose Ridge
    w_ridge = max(1, int(1.1 * S / 108.0))
    d.line([p(54, 49.5), p(54, 73.5)], fill=(203, 213, 225, 255), width=w_ridge)

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

    # Write matching SVG favicon
    svg_logo = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">
  <defs>
    <clipPath id="c"><rect width="108" height="108" rx="24"/></clipPath>
  </defs>
  <g clip-path="url(#c)">
    <rect width="108" height="108" rx="24" fill="#071426"/>
    <path d="M0,0 L108,0 L108,56 Q54,74 0,56 Z" fill="#0E294B"/>
    <path d="M0,73 Q54,61 108,73 L108,78 Q54,66 0,78 Z" fill="#FF9933"/>
    <path d="M0,78.5 Q54,66.5 108,78.5 L108,83.5 Q54,71.5 0,83.5 Z" fill="#FFFFFF"/>
    <path d="M0,84 Q54,72 108,84 L108,89 Q54,77 0,89 Z" fill="#138808"/>
    <path d="M31,89 L45,73 M77,89 L63,73" stroke="#CBD5E1" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M34,84.5 L74,84.5 M38.5,79.5 L69.5,79.5" stroke="#64748B" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M54,18 C61,18 66,21 69,28 L76,48 C78.5,56 76.5,64 70.5,69.5 L59,75.5 C55.8,77 52.2,77 49,75.5 L37.5,69.5 C31.5,64 29.5,56 32,48 L39,28 C42,21 47,18 54,18 Z" fill="#F8FAFC"/>
    <path d="M31.6,51.5 Q54,60.5 76.4,51.5 L76.8,57.5 C76.4,63.5 73.2,67.8 68.5,70.8 L58.5,75.6 C55.6,77 52.4,77 49.5,75.6 L39.5,70.8 C34.8,67.8 31.6,63.5 31.2,57.5 Z" fill="#0284C7"/>
    <path d="M39.5,69.5 L54,73.5 L68.5,69.5 L63.5,74.8 C57.5,77.2 50.5,77.2 44.5,74.8 Z" fill="#0B1F3A"/>
    <path d="M54,24.5 C61.5,24.5 66.5,28 69.5,35.5 L72.5,44.5 C66.2,48 60,49.5 54,49.5 C48,49.5 41.8,48 35.5,44.5 L38.5,35.5 C41.5,28 46.5,24.5 54,24.5 Z" fill="#091324"/>
    <path d="M41.5,31.5 C45,27.8 49.2,26.8 53.2,26.8 L49.2,40.5 C44.5,40 40.5,38.8 37.8,37.2 Z" fill="#38BDF8" fill-opacity="0.85"/>
    <path d="M50,20.6 L58,20.6 L57,23.2 L51,23.2 Z" fill="#FACC15"/>
    <path d="M32.4,48.2 Q54,57.5 75.6,48.2 L76.0,50.5 Q54,59.8 32.0,50.5 Z" fill="#FF9933"/>
    <path d="M32.0,50.5 Q54,59.8 76.0,50.5 L76.3,52.8 Q54,62.1 31.7,52.8 Z" fill="#FFFFFF"/>
    <path d="M31.7,52.8 Q54,62.1 76.3,52.8 L76.6,55.1 Q54,64.4 31.4,55.1 Z" fill="#138808"/>
    <path d="M34.2,57.5 L46.0,62.4 L44.4,65.8 L33.5,61.0 Z" fill="#E0F2FE"/>
    <path d="M73.8,57.5 L62.0,62.4 L63.6,65.8 L74.5,61.0 Z" fill="#E0F2FE"/>
    <path d="M54,49.5 L54,73.5" stroke="#CBD5E1" stroke-width="1.1"/>
  </g>
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

    print("OK: Generated unified Vande Bharat Express icons across Web & Android mipmaps!")

if __name__ == "__main__":
    main()
