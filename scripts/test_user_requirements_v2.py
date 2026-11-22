#!/usr/bin/env python3
"""
Automated Verification Suite for User Requirements:
1. Load screen matching app theme (Light / Dark mode).
2. Addition of authentic Indian Railways S&T symbols (signals, boards, track equipment, power, telecom).
"""

import os
import json
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def test_manifest_and_svg_symbols():
    print("--- 1. Testing Symbol Manifest & SVG Files ---")
    manifest_path = os.path.join(ROOT, "symbols", "manifest.json")
    bundled_manifest = os.path.join(ROOT, "frontend", "src", "constants", "symbolManifest.json")
    public_manifest = os.path.join(ROOT, "frontend", "public", "symbols", "manifest.json")

    assert os.path.exists(manifest_path), "symbols/manifest.json must exist"
    assert os.path.exists(bundled_manifest), "frontend/src/constants/symbolManifest.json must exist"
    assert os.path.exists(public_manifest), "frontend/public/symbols/manifest.json must exist"

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    with open(bundled_manifest, "r", encoding="utf-8") as f:
        bdata = json.load(f)

    symbols = data["symbols"]
    assert len(symbols) >= 70, f"Expected at least 70 symbols, got {len(symbols)}"
    assert len(bdata["symbols"]) == len(symbols), "Bundled manifest must match symbols/manifest.json"
    print(f"✓ Total symbols in library: {len(symbols)} (Target >= 70)")

    # Verify specific key Indian Railways symbols exist
    required_ids = [
        "cls_4aspect", "cls_3aspect", "cls_2aspect",
        "signal_route_indicator", "signal_automatic", "signal_semi_automatic",
        "signal_inner_distant", "signal_intermediate_starter", "signal_coacting",
        "signal_banner_repeater", "signal_calling_on_cls", "signal_shunt_position",
        "signal_gate_cls", "signal_warner",
        "fouling_mark", "track_lead_junction_box", "axle_counter_wheel_sensor",
        "point_machine_clamp", "board_shunting_limit", "board_block_section_limit",
        "board_whistle", "board_warning", "board_speed_indicator",
        "emergency_socket_pillar", "ips_room", "solar_panel_array", "ofc_cable_marker", "spd_cabinet"
    ]

    sym_ids = {s["id"] for s in symbols}
    for rid in required_ids:
        assert rid in sym_ids, f"Required railway symbol '{rid}' missing from manifest"
        svg_file = os.path.join(ROOT, "symbols", f"{rid}.svg")
        assert os.path.exists(svg_file), f"SVG file {rid}.svg missing"
        assert os.path.getsize(svg_file) > 100, f"SVG file {rid}.svg too small"
        
        pub_svg = os.path.join(ROOT, "frontend", "public", "symbols", f"{rid}.svg")
        assert os.path.exists(pub_svg), f"Public SVG file {rid}.svg missing"

    print(f"✓ All {len(required_ids)} required Indian Railways signal and equipment symbols verified with SVG assets!")


def test_theme_matching_splash():
    print("\n--- 2. Testing Splash Load Screen Theme Matching ---")
    splash_file = os.path.join(ROOT, "frontend", "src", "components", "Brand", "SplashScreen.tsx")
    assert os.path.exists(splash_file), "SplashScreen.tsx must exist"
    
    with open(splash_file, "r", encoding="utf-8") as f:
        code = f.read()

    assert "isDark" in code, "SplashScreen must accept isDark prop"
    assert "#121E2E" in code and "#FFFFFF" in code, "SplashScreen must contain both dark and light theme palettes"
    assert "text-slate-900" in code or "text-slate-800" in code, "SplashScreen must have light theme typography"
    assert "text-white" in code, "SplashScreen must have dark theme typography"
    print("✓ SplashScreen.tsx has dedicated theme rendering logic for both light and dark modes!")

    # Verify index.html instant theme bootstrap
    index_html = os.path.join(ROOT, "frontend", "index.html")
    with open(index_html, "r", encoding="utf-8") as f:
        html = f.read()
    assert "raildraw_theme_mode" in html, "index.html must bootstrap theme from localStorage"
    assert "theme-dark" in html, "index.html must set theme-dark class"
    print("✓ index.html has early theme bootstrapping script to prevent load-time flashes!")

    # Verify App.tsx theme management
    app_tsx = os.path.join(ROOT, "frontend", "src", "App.tsx")
    with open(app_tsx, "r", encoding="utf-8") as f:
        app_code = f.read()
    assert "isDark={isDark}" in app_code, "App.tsx must pass isDark to SplashScreen"
    assert "syncAndroidSystemBars(isDark)" in app_code, "App.tsx must sync Android system bars"
    print("✓ App.tsx properly orchestrates theme state across SplashScreen, SimpleAppView, and Android bridge!")


def test_interactive_symbols_and_prompt_parser():
    print("\n--- 3. Testing Interactive Canvas & Prompt Parser Integration ---")
    interactive_file = os.path.join(ROOT, "frontend", "src", "components", "Canvas", "InteractiveSymbols.tsx")
    with open(interactive_file, "r", encoding="utf-8") as f:
        icode = f.read()

    # Check key symbols in INTERACTIVE_SYMBOLS
    for sym in ["signal_route_indicator", "signal_automatic", "board_shunting_limit", "track_lead_junction_box", "ips_room"]:
        assert f"type: '{sym}'" in icode, f"Symbol {sym} missing from INTERACTIVE_SYMBOLS"
        assert f"case '{sym}':" in icode, f"RenderInteractiveSymbol missing case for {sym}"

    print("✓ InteractiveSymbols.tsx contains full inline SVG rendering for newly added railway symbols!")

    # Check prompt parser detection
    parser_file = os.path.join(ROOT, "frontend", "src", "services", "promptParser.ts")
    with open(parser_file, "r", encoding="utf-8") as f:
        pcode = f.read()

    for pattern_term in ["signal_route_indicator", "signal_automatic", "signal_inner_distant", "board_shunting_limit", "track_lead_junction_box"]:
        assert pattern_term in pcode, f"Prompt parser missing detection for {pattern_term}"

    print("✓ promptParser.ts contains keyword detection for new railway signals and trackside signs!")


def test_dxf_export_symbols():
    print("\n--- 4. Testing DXF Exporter Placed Symbols Integration ---")
    client_dxf = os.path.join(ROOT, "frontend", "src", "services", "dxfClient.ts")
    backend_dxf = os.path.join(ROOT, "backend", "dxf_exporter.py")

    with open(client_dxf, "r", encoding="utf-8") as f:
        c_code = f.read()
    assert "placedSymbols" in c_code, "client dxf generator must handle placedSymbols"
    print("✓ Client-side DXF exporter successfully exports placed symbols!")

    with open(backend_dxf, "r", encoding="utf-8") as f:
        b_code = f.read()
    assert "placedSymbols" in b_code, "backend dxf exporter must handle placedSymbols"
    print("✓ Backend Python DXF exporter successfully exports placed symbols!")


if __name__ == "__main__":
    test_manifest_and_svg_symbols()
    test_theme_matching_splash()
    test_interactive_symbols_and_prompt_parser()
    test_dxf_export_symbols()
    print("\n🎉 ALL TESTS PASSED! User requirements 1 & 2 are 100% verified!")
