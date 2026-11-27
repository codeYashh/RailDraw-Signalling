import os
import json
import zipfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def test_unified_vande_bharat_logos():
    with open(os.path.join(ROOT, "android", "app", "src", "main", "res", "drawable", "ic_raildraw_logo.xml"), "r", encoding="utf-8") as f:
        splash_xml = f.read()
    with open(os.path.join(ROOT, "android", "app", "src", "main", "res", "drawable", "ic_launcher_foreground.xml"), "r", encoding="utf-8") as f:
        fg_xml = f.read()
    with open(os.path.join(ROOT, "frontend", "src", "components", "Brand", "VandeBharatLogo.tsx"), "r", encoding="utf-8") as f:
        vb_tsx = f.read()

    # Ensure old boxy Metro geometry is completely gone and unified Vande Bharat bullet nose path is present
    nose_path = "M54,18 C61,18 66,21 69,28 L76,48"
    assert nose_path in splash_xml, "ic_raildraw_logo.xml must match Vande Bharat Express icon"
    assert nose_path in fg_xml, "ic_launcher_foreground.xml must use Vande Bharat Express icon"
    assert nose_path in vb_tsx, "VandeBharatLogo.tsx must use identical Vande Bharat Express geometry"
    assert "M 29,22 L 43,22 L 41,36 L 31,36 Z" not in splash_xml, "Old Metro logo must not exist"


def test_main_screen_no_icon_and_no_variant_options():
    with open(os.path.join(ROOT, "frontend", "src", "components", "SimpleApp", "HomeComposer.tsx"), "r", encoding="utf-8") as f:
        home_tsx = f.read()
    assert "VandeBharatLogo" not in home_tsx, "HomeComposer main screen header must show RailDraw without icon"
    assert "DrawingVariantPicker" not in home_tsx, "Main screen must not contain drawing variant options"

    with open(os.path.join(ROOT, "android", "app", "src", "main", "java", "in", "gov", "railnet", "raildraw", "ui", "HomeScreen.kt"), "r", encoding="utf-8") as f:
        home_kt = f.read()
    assert "DrawingVariant.entries.forEach" not in home_kt, "HomeScreen.kt must not render drawing options on main screen"


def test_auto_calibration_and_no_mismatch_errors():
    with open(os.path.join(ROOT, "frontend", "src", "services", "promptParser.ts"), "r", encoding="utf-8") as f:
        parser_ts = f.read()
    assert "dimensionProposal" not in parser_ts.split("return { project, summary, hindiSummary }")[1] if "return { project, summary, hindiSummary }" in parser_ts else True
    assert "detectUnmeasuredMethods" in parser_ts

    with open(os.path.join(ROOT, "frontend", "src", "components", "SimpleApp", "SimpleAppView.tsx"), "r", encoding="utf-8") as f:
        simple_tsx = f.read()
    assert "setDimensionProposal(result.dimensionProposal)" not in simple_tsx

    with open(os.path.join(ROOT, "android", "app", "src", "main", "java", "in", "gov", "railnet", "raildraw", "parser", "DrawingParser.kt"), "r", encoding="utf-8") as f:
        parser_kt = f.read()
    assert "reconcileSegmentsToTotal" in parser_kt
    assert "Segments add up to" not in parser_kt


def test_four_similar_diagram_options_and_no_drawn_by_footer():
    with open(os.path.join(ROOT, "frontend", "src", "components", "ui", "DrawingVariantPicker.tsx"), "r", encoding="utf-8") as f:
        picker = f.read()
    assert "Option 4" in picker
    for opt in ["'standard'", "'schematic'", "'detailed'", "'blueprint'"]:
        assert opt in picker

    with open(os.path.join(ROOT, "frontend", "src", "components", "Canvas", "DrawingVariants.tsx"), "r", encoding="utf-8") as f:
        variants_tsx = f.read()
    for forbidden in ["DRAWN BY", "PREPARED / CHECKED", "APPROVED BY", "CHECKED BY"]:
        assert forbidden not in variants_tsx, f"Forbidden bottom credit '{forbidden}' found in DrawingVariants.tsx"

    with open(os.path.join(ROOT, "android", "app", "src", "main", "java", "in", "gov", "railnet", "raildraw", "drawing", "DrawingRenderer.kt"), "r", encoding="utf-8") as f:
        renderer_kt = f.read()
    assert "drawBottomStamp" not in renderer_kt
    assert "DRAWN BY" not in renderer_kt


def test_apk_hardening_and_version_sync():
    with open(os.path.join(ROOT, "version.json"), "r", encoding="utf-8") as f:
        v = json.load(f)
    assert v["version"] == "1.7.0"

    with open(os.path.join(ROOT, "android", "shell-java", "in", "gov", "railnet", "raildraw", "MainActivity.java"), "r", encoding="utf-8") as f:
        main_java = f.read()
    assert "setAllowUniversalAccessFromFileURLs(false)" in main_java
    assert "setAllowFileAccessFromFileURLs(false)" in main_java
    assert "https://appassets.androidplatform.net/assets/main.html" in main_java

    apk_path = os.path.join(ROOT, "RailDraw.apk")
    if os.path.exists(apk_path):
        with zipfile.ZipFile(apk_path, "r") as z:
            assert "assets/data/rdso_standards_pack.dat" not in z.namelist(), "Dummy padding file must be removed"
            assert z.getinfo("resources.arsc").compress_type == zipfile.ZIP_STORED

    with open(os.path.join(ROOT, "manifest_native.xml"), "r", encoding="utf-8") as f:
        m_xml = f.read()
    assert 'android:versionCode="10700"' in m_xml

    with open(os.path.join(ROOT, "android", "app", "src", "main", "java", "in", "gov", "railnet", "raildraw", "updater", "GitHubUpdater.kt"), "r", encoding="utf-8") as f:
        updater_kt = f.read()
    assert "RAW_VERSION_JSON_URL" in updater_kt
    assert "WEB_LATEST_RELEASE_URL" in updater_kt
    assert updater_kt.index("checkWebLatestReleaseRedirect(installedVersion)") < updater_kt.index("URL(LATEST_RELEASE_URL)")
    assert updater_kt.index("fetchVersionJson(RAW_VERSION_JSON_URL") < updater_kt.index("URL(LATEST_RELEASE_URL)")


def test_home_layout_and_left_swipe_sidebar():
    with open(os.path.join(ROOT, "frontend", "src", "components", "SimpleApp", "HomeComposer.tsx"), "r", encoding="utf-8") as f:
        home_tsx = f.read()
    assert "text-[2.625rem]" in home_tsx or "text-4xl" in home_tsx, "Let's Create must be larger on mobile"
    assert "mb-10" in home_tsx and "pt-16" in home_tsx, "Prompting area must be shifted downwards"

    with open(os.path.join(ROOT, "frontend", "src", "components", "SimpleApp", "SimpleAppView.tsx"), "r", encoding="utf-8") as f:
        simple_tsx = f.read()
    assert "setIsSidebarOpen(true)" in simple_tsx
    assert "setIsSidebarOpen(false)" in simple_tsx
    assert "touchStartX < 50 && dx > 60 && Math.abs(dy) < 80) {\n          handleBack();" not in simple_tsx


def test_play_protect_hardening_no_dropper_permissions():
    with open(os.path.join(ROOT, "manifest_native.xml"), "r", encoding="utf-8") as f:
        m_xml = f.read()
    assert "REQUEST_INSTALL_PACKAGES" not in m_xml
    assert "ApkFileProvider" not in m_xml
    assert 'android:allowBackup="false"' in m_xml
    assert 'android:usesCleartextTraffic="false"' in m_xml

    with open(os.path.join(ROOT, "android", "app", "src", "main", "AndroidManifest.xml"), "r", encoding="utf-8") as f:
        app_xml = f.read()
    assert "REQUEST_INSTALL_PACKAGES" not in app_xml

    with open(os.path.join(ROOT, "android", "shell-java", "in", "gov", "railnet", "raildraw", "RailDrawBridge.java"), "r", encoding="utf-8") as f:
        bridge = f.read()
    assert "downloadAndInstallApk" not in bridge

