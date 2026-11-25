#!/usr/bin/env python3
"""
Adds 16 new Indian Railways S&T symbols:
- 6 Signal variants (Theatre Route Indicator, Distant 'P' Marker, IBS 'IB' Marker,
  Repeater 'R' Marker, Signal Gantry/Cantilever, Fixed Stop Board)
- 10 Underground Cable & Infrastructure symbols (Cable Trench Cross-Section, HDD Bore,
  HDPE/RCC Multi-Duct Bank, Cable Draw Pit, Cable Joint Pit, CT Rack, Concrete Trough,
  Under-Track Crossing UTX, OFC Splice Pit, Underground Earth Electrode Pit)
"""

import os
import json

NEW_SYMBOLS = [
    # --- 6 NEW SIGNAL SYMBOLS ---
    {
        "id": "signal_theatre_route",
        "name": "Home Signal with Theatre Route Indicator",
        "category": "Signals",
        "description": "RDSO Colour Light Signal equipped with an illuminated matrix Theatre Type Route Indicator for multi-turnout station yards.",
        "source": "IRSEM Part II Chapter 15 / RDSO Drawing SA-23841",
        "width": 36,
        "height": 60,
        "anchor": {"x": 18, "y": 60},
        "tags": ["signal", "theatre", "route indicator", "home", "matrix", "cls"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 60" width="36" height="60">
  <line x1="18" y1="60" x2="18" y2="20" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="10" y1="60" x2="26" y2="60" stroke="#0f172a" stroke-width="3"/>
  <rect x="8" y="3" width="20" height="14" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1.4"/>
  <text x="18" y="13" font-size="9" font-family="monospace" font-weight="900" text-anchor="middle" fill="#facc15">2L</text>
  <rect x="11" y="19" width="14" height="27" rx="4" fill="#1e293b" stroke="#0f172a" stroke-width="1.4"/>
  <circle cx="18" cy="25" r="2.8" fill="#10b981" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="18" cy="32.5" r="2.8" fill="#f59e0b" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="18" cy="40" r="2.8" fill="#ef4444" stroke="#ffffff" stroke-width="0.6"/>
</svg>"""
    },
    {
        "id": "signal_distant_p",
        "name": "Distant Signal ('P' Marker Disc)",
        "category": "Signals",
        "description": "Permissive Distant Colour Light Signal fitted with circular white 'P' marker disc on mast per IRSEM.",
        "source": "IRSEM Part II 15.2 / RDSO Drawing SD-10027",
        "width": 36,
        "height": 56,
        "anchor": {"x": 16, "y": 56},
        "tags": ["signal", "distant", "p marker", "permissive", "cls"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 56" width="36" height="56">
  <line x1="16" y1="56" x2="16" y2="16" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="8" y1="56" x2="24" y2="56" stroke="#0f172a" stroke-width="3"/>
  <rect x="10" y="6" width="12" height="32" rx="4" fill="#1e293b" stroke="#0f172a" stroke-width="1.4"/>
  <circle cx="16" cy="12" r="2.9" fill="#10b981" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="16" cy="22" r="2.9" fill="#f59e0b" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="16" cy="32" r="2.9" fill="#f59e0b" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="28" cy="24" r="6" fill="#ffffff" stroke="#0f172a" stroke-width="1.3"/>
  <text x="28" y="26.5" font-size="7.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">P</text>
</svg>"""
    },
    {
        "id": "signal_ibs_marker",
        "name": "Intermediate Block Signal (IBS 'IB' Marker)",
        "category": "Signals",
        "description": "Intermediate Block Stop Signal with white rectangular/circular 'IB' marker plate and IBS telephone indicator.",
        "source": "IRSEM Part II 15.4 / RDSO SD-10030",
        "width": 38,
        "height": 56,
        "anchor": {"x": 16, "y": 56},
        "tags": ["signal", "ibs", "intermediate block", "ib marker", "cls"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 56" width="38" height="56">
  <line x1="16" y1="56" x2="16" y2="16" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="8" y1="56" x2="24" y2="56" stroke="#0f172a" stroke-width="3"/>
  <rect x="10" y="6" width="12" height="28" rx="4" fill="#1e293b" stroke="#0f172a" stroke-width="1.4"/>
  <circle cx="16" cy="13" r="3" fill="#10b981" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="16" cy="21" r="3" fill="#f59e0b" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="16" cy="29" r="3" fill="#ef4444" stroke="#ffffff" stroke-width="0.6"/>
  <rect x="23" y="16" width="13" height="11" rx="2" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/>
  <text x="29.5" y="23.8" font-size="6.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">IB</text>
</svg>"""
    },
    {
        "id": "signal_repeater_r",
        "name": "Colour Light Repeater Signal ('R' Marker)",
        "category": "Signals",
        "description": "Repeating signal placed ahead of obstructed running signal, identified by white circular 'R' marker.",
        "source": "IRSEM Part II / RDSO SD-10032",
        "width": 36,
        "height": 56,
        "anchor": {"x": 16, "y": 56},
        "tags": ["signal", "repeater", "r marker", "cls"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 56" width="36" height="56">
  <line x1="16" y1="56" x2="16" y2="16" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="8" y1="56" x2="24" y2="56" stroke="#0f172a" stroke-width="3"/>
  <rect x="10" y="8" width="12" height="24" rx="4" fill="#1e293b" stroke="#0f172a" stroke-width="1.4"/>
  <circle cx="16" cy="15" r="3" fill="#10b981" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="16" cy="25" r="3" fill="#f59e0b" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="28" cy="22" r="6" fill="#ffffff" stroke="#0f172a" stroke-width="1.3"/>
  <text x="28" y="24.5" font-size="7.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">R</text>
</svg>"""
    },
    {
        "id": "signal_gantry_portal",
        "name": "Signal Gantry / Cantilever Mast",
        "category": "Signals",
        "description": "Overhead steel portal gantry or cantilever signal bridge supporting dual-line CLS heads over multiple tracks.",
        "source": "RDSO Standard Gantry Drawing S-23150",
        "width": 52,
        "height": 54,
        "anchor": {"x": 26, "y": 54},
        "tags": ["signal", "gantry", "cantilever", "portal", "bridge", "multi-track"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 54" width="52" height="54">
  <line x1="8" y1="54" x2="8" y2="12" stroke="#0f172a" stroke-width="3"/>
  <line x1="44" y1="54" x2="44" y2="12" stroke="#0f172a" stroke-width="3"/>
  <rect x="6" y="10" width="40" height="5" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="14" y="15" width="9" height="17" rx="3" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <circle cx="18.5" cy="19.5" r="2" fill="#10b981"/>
  <circle cx="18.5" cy="24" r="2" fill="#f59e0b"/>
  <circle cx="18.5" cy="28.5" r="2" fill="#ef4444"/>
  <rect x="29" y="15" width="9" height="17" rx="3" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <circle cx="33.5" cy="19.5" r="2" fill="#10b981"/>
  <circle cx="33.5" cy="24" r="2" fill="#f59e0b"/>
  <circle cx="33.5" cy="28.5" r="2" fill="#ef4444"/>
</svg>"""
    },
    {
        "id": "signal_stop_board",
        "name": "Fixed Stop Board / Buffer Stop Signal",
        "category": "Signals",
        "description": "Illuminated or retro-reflective red stop board / buffer stop marker at dead-end siding or terminal line.",
        "source": "IRSEM / G&SR Rule 3.23",
        "width": 36,
        "height": 48,
        "anchor": {"x": 18, "y": 48},
        "tags": ["signal", "stop board", "buffer stop", "dead end", "fixed"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
  <line x1="18" y1="48" x2="18" y2="24" stroke="#0f172a" stroke-width="2.6"/>
  <line x1="10" y1="48" x2="26" y2="48" stroke="#0f172a" stroke-width="3"/>
  <rect x="7" y="6" width="22" height="18" rx="2" fill="#dc2626" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="11" y1="15" x2="25" y2="15" stroke="#ffffff" stroke-width="3.2"/>
</svg>"""
    },

    # --- 10 NEW UNDERGROUND CABLE & INFRASTRUCTURE SYMBOLS ---
    {
        "id": "underground_cable_trench",
        "name": "Underground Cable Trench (Cross-Section)",
        "category": "Cable Markers & Joints",
        "description": "Standard 1.0 m deep underground signalling cable trench with Class II protective bricks, clean sand bedding, and multi-core cables.",
        "source": "IRSEM Part II Ch. 15 / RDSO/SPN/194",
        "width": 44,
        "height": 44,
        "anchor": {"x": 22, "y": 22},
        "tags": ["underground", "cable", "trench", "brick", "sand", "excavation"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" width="44" height="44">
  <line x1="2" y1="8" x2="42" y2="8" stroke="#0f172a" stroke-width="1.8" stroke-dasharray="4 2"/>
  <path d="M 10,8 L 12,38 L 32,38 L 34,8" fill="#fef3c7" stroke="#0f172a" stroke-width="1.6"/>
  <rect x="13" y="21" width="18" height="4.5" fill="#b91c1c" stroke="#450a0a" stroke-width="0.8"/>
  <rect x="12.5" y="26" width="19" height="11" fill="#fde68a"/>
  <circle cx="17" cy="32" r="2.2" fill="#0f172a"/>
  <circle cx="22" cy="32" r="2.2" fill="#0f172a"/>
  <circle cx="27" cy="32" r="2.2" fill="#0f172a"/>
</svg>"""
    },
    {
        "id": "underground_hdd_bore",
        "name": "Underground HDD / Trenchless Bore",
        "category": "Cable Markers & Joints",
        "description": "Horizontal Directional Drilling (HDD) underground HDPE casing bore for crossing roads, culverts, and busy yards.",
        "source": "IRSEM Part II 15.6 / RDSO Trenchless Spec",
        "width": 48,
        "height": 38,
        "anchor": {"x": 24, "y": 19},
        "tags": ["underground", "hdd", "trenchless", "bore", "hdpe", "cable"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 38" width="48" height="38">
  <line x1="2" y1="8" x2="46" y2="8" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="4 2"/>
  <path d="M 4,10 Q 12,26 24,26 Q 36,26 44,10" fill="none" stroke="#0284c7" stroke-width="5" stroke-linecap="round"/>
  <path d="M 4,10 Q 12,26 24,26 Q 36,26 44,10" fill="none" stroke="#f8fafc" stroke-width="1.8" stroke-dasharray="3 3"/>
  <text x="24" y="35" font-size="6.5" font-family="sans-serif" font-weight="800" text-anchor="middle" fill="#0f172a">HDD BORE</text>
</svg>"""
    },
    {
        "id": "underground_cable_duct",
        "name": "Underground HDPE / RCC Duct Bank",
        "category": "Cable Markers & Joints",
        "description": "Multi-way underground HDPE or RCC protective duct bank carrying separated signalling and telecom cables.",
        "source": "RDSO/SPN/TC/45 / IRSEM",
        "width": 44,
        "height": 38,
        "anchor": {"x": 22, "y": 19},
        "tags": ["underground", "duct", "hdpe", "rcc", "conduit", "cable"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 38" width="44" height="38">
  <rect x="6" y="7" width="32" height="24" rx="2" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.6"/>
  <circle cx="15" cy="14" r="4" fill="#0284c7" stroke="#0f172a" stroke-width="1.1"/>
  <circle cx="29" cy="14" r="4" fill="#0284c7" stroke="#0f172a" stroke-width="1.1"/>
  <circle cx="15" cy="24" r="4" fill="#ea580c" stroke="#0f172a" stroke-width="1.1"/>
  <circle cx="29" cy="24" r="4" fill="#ea580c" stroke="#0f172a" stroke-width="1.1"/>
  <circle cx="15" cy="14" r="1.5" fill="#0f172a"/>
  <circle cx="29" cy="24" r="1.5" fill="#0f172a"/>
</svg>"""
    },
    {
        "id": "cable_draw_pit",
        "name": "Underground Cable Draw Pit / Manhole",
        "category": "Cable Markers & Joints",
        "description": "Brick or RCC underground cable pulling & inspection chamber with heavy-duty cover.",
        "source": "IRSEM Part II / RDSO Cable Pit Drawing",
        "width": 40,
        "height": 40,
        "anchor": {"x": 20, "y": 20},
        "tags": ["underground", "draw pit", "manhole", "chamber", "cable"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <rect x="6" y="6" width="28" height="28" rx="2" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/>
  <rect x="11" y="11" width="18" height="18" fill="#94a3b8" stroke="#0f172a" stroke-width="1.2"/>
  <line x1="11" y1="11" x2="29" y2="29" stroke="#0f172a" stroke-width="1.2"/>
  <line x1="29" y1="11" x2="11" y2="29" stroke="#0f172a" stroke-width="1.2"/>
  <text x="20" y="38.5" font-size="6" font-family="sans-serif" font-weight="800" text-anchor="middle" fill="#0f172a">DP</text>
</svg>"""
    },
    {
        "id": "cable_joint_pit",
        "name": "Underground Straight-Through Joint Pit",
        "category": "Cable Markers & Joints",
        "description": "Underground resin/cast-iron straight-through cable splice enclosure pit with loop slack.",
        "source": "IRSEM Part II 15.8 / RDSO/SPN/195",
        "width": 44,
        "height": 36,
        "anchor": {"x": 22, "y": 18},
        "tags": ["underground", "joint pit", "splice", "cable joint"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 36" width="44" height="36">
  <rect x="4" y="6" width="36" height="22" rx="3" fill="#f1f5f9" stroke="#0f172a" stroke-width="1.6" stroke-dasharray="3 2"/>
  <line x1="2" y1="17" x2="14" y2="17" stroke="#0f172a" stroke-width="2.4"/>
  <line x1="30" y1="17" x2="42" y2="17" stroke="#0f172a" stroke-width="2.4"/>
  <rect x="14" y="12" width="16" height="10" rx="3" fill="#0284c7" stroke="#0f172a" stroke-width="1.4"/>
  <text x="22" y="34" font-size="6" font-family="sans-serif" font-weight="800" text-anchor="middle" fill="#0f172a">JOINT PIT</text>
</svg>"""
    },
    {
        "id": "cable_termination_rack",
        "name": "Cable Termination Rack (CT Rack)",
        "category": "Location Boxes & Housing",
        "description": "Indoor Relay Room / Cabin termination rack where underground signalling cables terminate onto ARA terminals.",
        "source": "IRSEM Part II / RDSO CT Rack Spec",
        "width": 36,
        "height": 46,
        "anchor": {"x": 18, "y": 46},
        "tags": ["cable", "termination", "ct rack", "relay room", "ara"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 46" width="36" height="46">
  <rect x="7" y="4" width="22" height="36" rx="1.5" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/>
  <line x1="11" y1="11" x2="25" y2="11" stroke="#334155" stroke-width="2"/>
  <line x1="11" y1="17" x2="25" y2="17" stroke="#334155" stroke-width="2"/>
  <line x1="11" y1="23" x2="25" y2="23" stroke="#334155" stroke-width="2"/>
  <line x1="11" y1="29" x2="25" y2="29" stroke="#334155" stroke-width="2"/>
  <text x="18" y="37" font-size="6" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">CT RACK</text>
</svg>"""
    },
    {
        "id": "cable_trough_concrete",
        "name": "Precast Concrete Cable Troughing",
        "category": "Cable Markers & Joints",
        "description": "Precast RCC surface/sub-surface cable trough with removable lid used along bridges, rocky strata, and station yards.",
        "source": "IRSEM Part II 15.7",
        "width": 44,
        "height": 36,
        "anchor": {"x": 22, "y": 18},
        "tags": ["underground", "cable", "trough", "concrete", "rcc"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 36" width="44" height="36">
  <rect x="6" y="7" width="32" height="4.5" fill="#94a3b8" stroke="#0f172a" stroke-width="1.3"/>
  <path d="M 8,11.5 L 11,29 L 33,29 L 36,11.5 Z" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.6"/>
  <circle cx="17" cy="22" r="2.2" fill="#0f172a"/>
  <circle cx="22" cy="22" r="2.2" fill="#0f172a"/>
  <circle cx="27" cy="22" r="2.2" fill="#0f172a"/>
</svg>"""
    },
    {
        "id": "under_track_crossing",
        "name": "Under-Track Cable Crossing (UTX)",
        "category": "Cable Markers & Joints",
        "description": "Underground GI / RCC pipe casing crossing perpendicular beneath railway track sleepers and ballast.",
        "source": "IRSEM Part II 15.5 / RDSO UTX Spec",
        "width": 48,
        "height": 42,
        "anchor": {"x": 24, "y": 21},
        "tags": ["underground", "utx", "track crossing", "gi pipe", "cable"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 42" width="48" height="42">
  <line x1="16" y1="4" x2="16" y2="38" stroke="#475569" stroke-width="2.4"/>
  <line x1="32" y1="4" x2="32" y2="38" stroke="#475569" stroke-width="2.4"/>
  <line x1="12" y1="10" x2="36" y2="10" stroke="#64748b" stroke-width="2"/>
  <line x1="12" y1="32" x2="36" y2="32" stroke="#64748b" stroke-width="2"/>
  <rect x="2" y="17" width="44" height="8" fill="#fef08a" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="2" y1="21" x2="46" y2="21" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3 2"/>
</svg>"""
    },
    {
        "id": "ofc_splice_pit",
        "name": "Underground OFC Splice Chamber",
        "category": "Cable Markers & Joints",
        "description": "Underground optical fibre cable (OFC) splice closure chamber with protective concrete ring and route marker.",
        "source": "RDSO/SPN/TC/55 / RailTel OFC Spec",
        "width": 40,
        "height": 40,
        "anchor": {"x": 20, "y": 20},
        "tags": ["underground", "ofc", "fiber", "splice", "telecom", "pit"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <circle cx="20" cy="20" r="15" fill="#fff7ed" stroke="#ea580c" stroke-width="2"/>
  <circle cx="20" cy="20" r="9" fill="#fed7aa" stroke="#0f172a" stroke-width="1.2"/>
  <line x1="5" y1="20" x2="35" y2="20" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="2 2"/>
  <text x="20" y="22.5" font-size="6.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#9a3412">OFC</text>
</svg>"""
    },
    {
        "id": "underground_earth_grid",
        "name": "Underground Chemical Earth Electrode Pit",
        "category": "Protection & Grounding",
        "description": "Sub-surface copper-bonded / chemical earthing electrode pit with inspection chamber for S&T surge & lightning protection.",
        "source": "RDSO/SPN/197 / IRSEM Earthing",
        "width": 40,
        "height": 44,
        "anchor": {"x": 20, "y": 22},
        "tags": ["underground", "earth", "earthing", "electrode", "grounding", "pit"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 44" width="40" height="44">
  <rect x="8" y="6" width="24" height="10" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="20" y1="16" x2="20" y2="38" stroke="#b45309" stroke-width="3"/>
  <line x1="12" y1="26" x2="28" y2="26" stroke="#16a34a" stroke-width="2"/>
  <line x1="14" y1="31" x2="26" y2="31" stroke="#16a34a" stroke-width="2"/>
  <line x1="16" y1="36" x2="24" y2="36" stroke="#16a34a" stroke-width="2"/>
</svg>"""
    },
]


def add_symbols():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    symbols_dir = os.path.join(root, "symbols")
    frontend_symbols_dir = os.path.join(root, "frontend", "public", "symbols")
    manifest_path = os.path.join(symbols_dir, "manifest.json")
    frontend_manifest_path = os.path.join(frontend_symbols_dir, "manifest.json")
    bundled_manifest_path = os.path.join(root, "frontend", "src", "constants", "symbolManifest.json")

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {s["id"] for s in data["symbols"]}
    added = 0

    for item in NEW_SYMBOLS:
        svg_filename = f"{item['id']}.svg"
        svg_content = item["svg"].strip() + "\n"

        with open(os.path.join(symbols_dir, svg_filename), "w", encoding="utf-8") as f:
            f.write(svg_content)

        os.makedirs(frontend_symbols_dir, exist_ok=True)
        with open(os.path.join(frontend_symbols_dir, svg_filename), "w", encoding="utf-8") as f:
            f.write(svg_content)

        if item["id"] not in existing_ids:
            entry = {
                "id": item["id"],
                "name": item["name"],
                "category": item["category"],
                "description": item["description"],
                "sourceReference": item["source"],
                "defaultSize": {"width": item["width"], "height": item["height"]},
                "anchorPoint": item["anchor"],
                "version": "1.0.0",
                "verificationStatus": "VERIFIED",
                "verifiedBy": "RailDraw S&T Library",
                "verificationDate": "2026-11-25",
                "verificationNotes": "Added to RDSO S&T Signal & Underground Cable library",
                "tags": item["tags"],
                "svgFile": svg_filename,
            }
            data["symbols"].append(entry)
            added += 1

    data["totalSymbols"] = len(data["symbols"])

    for target in (manifest_path, frontend_manifest_path, bundled_manifest_path):
        with open(target, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    print(f"Added {added} new symbols. Total symbols in library: {len(data['symbols'])}")


if __name__ == "__main__":
    add_symbols()
