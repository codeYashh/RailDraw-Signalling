import os
import json
import io
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, HTMLResponse, RedirectResponse

from backend.database import get_all_projects, get_project_by_id, save_project, delete_project, init_db
from backend.dxf_exporter import create_dxf_drawing

app = FastAPI(
    title="RailDraw Signalling API",
    description="CAD & Engineering Drawing Generator for Indian Railways S&T Engineers",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYMBOLS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "symbols"))
STANDARDS_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "standards", "irsem_rules.json"))

# Mount symbols static directory (both /symbols-static and /symbols for /app compatibility)
if os.path.exists(SYMBOLS_DIR):
    app.mount("/symbols-static", StaticFiles(directory=SYMBOLS_DIR), name="symbols-static")
    app.mount("/symbols", StaticFiles(directory=SYMBOLS_DIR), name="symbols")

FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    app.mount("/app", StaticFiles(directory=FRONTEND_DIST, html=True), name="app")

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "RailDraw Signalling", "version": "1.0.0"}

@app.get("/")
def index():
    return RedirectResponse(url="/simulator")

@app.get("/RailDraw.apk")
@app.get("/raildraw-signalling.apk")
def download_apk():
    apk_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "RailDraw.apk"))
    if not os.path.exists(apk_path):
        raise HTTPException(status_code=404, detail="RailDraw.apk not found")
    return FileResponse(
        apk_path,
        media_type="application/vnd.android.package-archive",
        filename="RailDraw.apk",
        headers={
            "Content-Disposition": 'attachment; filename="RailDraw.apk"',
            "Content-Type": "application/vnd.android.package-archive"
        }
    )

@app.get("/simulator", response_class=HTMLResponse)
def phone_simulator():
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RailDraw Mobile Simulator — Engineering Preview</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; }
        body {
            background: #1B2028;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            color: #D1D7E0;
        }
        .container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 40px;
            max-width: 1100px;
            width: 100%;
            flex-wrap: wrap;
        }
        /* Clean Flat Technical Phone Frame */
        .phone {
            width: 412px;
            height: 860px;
            background: #12151A;
            border-radius: 32px;
            border: 2px solid #323A46;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: none;
            transition: width 0.3s, height 0.3s;
        }
        .phone.landscape {
            width: 860px;
            height: 412px;
        }
        /* Top System Status Bar */
        .status-bar {
            height: 34px;
            background: #0C2340;
            color: #D1D7E0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #051426;
            user-select: none;
        }
        .camera-punch {
            width: 8px;
            height: 8px;
            background: #05070A;
            border-radius: 50%;
            border: 1px solid #1E252F;
        }
        .status-indicators {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 10px;
            font-family: monospace;
        }
        /* Embedded RailDraw App Frame */
        .screen-frame {
            flex: 1;
            width: 100%;
            height: 100%;
            border: none;
            background: #ECEEF2;
        }
        /* Android Bottom Gesture Bar */
        .gesture-bar-container {
            height: 16px;
            background: #ECEEF2;
            display: flex;
            align-items: center;
            justify-content: center;
            border-top: 1px solid #CBD2DC;
        }
        .gesture-bar {
            width: 100px;
            height: 3px;
            background: #8893A2;
            border-radius: 2px;
        }
        /* Sidebar / Technical Info Panel */
        .sidebar {
            max-width: 420px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .brand-icon {
            width: 40px;
            height: 40px;
            background: #0C2340;
            border: 1px solid #283444;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .brand-icon svg { width: 24px; height: 24px; stroke: #D1D7E0; fill: none; }
        .brand-text h1 { font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px; }
        .brand-text p { font-size: 12px; color: #8A96A6; }
        .tech-badge {
            display: inline-block;
            background: #232A34;
            color: #A4B1C2;
            border: 1px solid #364150;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            font-family: monospace;
            width: fit-content;
        }
        .panel {
            background: #222832;
            border: 1px solid #323B47;
            border-radius: 8px;
            padding: 16px;
        }
        .panel-header {
            font-size: 11px;
            font-weight: 800;
            color: #8C99AA;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            margin-bottom: 12px;
            border-bottom: 1px solid #2D3642;
            padding-bottom: 6px;
        }
        .action-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        button.btn {
            background: #2D3542;
            color: #DDE2EB;
            border: 1px solid #3F4A5B;
            border-radius: 4px;
            padding: 9px 12px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.15s;
            text-align: center;
            letter-spacing: 0.3px;
        }
        button.btn:hover { background: #394354; border-color: #556377; }
        .prompt-chip {
            background: #1B2129;
            border: 1px solid #2D3642;
            border-left: 3px solid #0C4A6E;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: background 0.15s, border-left-color 0.15s;
        }
        .prompt-chip:hover {
            background: #232A34;
            border-left-color: #38BDF8;
        }
        .chip-title { font-size: 11px; font-weight: 700; color: #E2E8F0; margin-bottom: 2px; }
        .chip-desc { font-size: 11px; color: #8A96A6; line-height: 1.4; }
        .download-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #0C2340;
            border: 1px solid #051426;
            border-radius: 6px;
            padding: 14px 16px;
            text-decoration: none;
            color: #FFFFFF;
            font-size: 13px;
            font-weight: 700;
            transition: background 0.15s;
        }
        .download-box:hover { background: #07172C; }
        .download-box small { font-size: 11px; color: #8A96A6; font-weight: normal; display: block; margin-top: 2px; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Clean Flat Technical Phone Frame -->
        <div class="phone" id="phoneMockup">
            <!-- Status Bar -->
            <div class="status-bar">
                <span id="clockTime">10:45</span>
                <div class="camera-punch"></div>
                <div class="status-indicators">
                    <span>5G</span>
                    <span>ONLINE</span>
                    <span>100%</span>
                </div>
            </div>

            <!-- Live RailDraw App Screen -->
            <iframe id="appIframe" class="screen-frame" src="/app/?v=1.0.2"></iframe>

            <!-- Bottom Android Bar -->
            <div class="gesture-bar-container">
                <div class="gesture-bar"></div>
            </div>
        </div>

        <!-- Sidebar / Laptop Controls -->
        <div class="sidebar">
            <div class="brand">
                <div class="brand-icon">
                    <svg viewBox="0 0 24 24" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16M8 6v12M16 6v12"/></svg>
                </div>
                <div class="brand-text">
                    <h1>RailDraw Signalling</h1>
                    <p>Indian Railways S&T Drawing Generator</p>
                </div>
            </div>

            <div class="tech-badge">STATUS: SIMULATOR CONNECTED (PORT 8000)</div>

            <!-- Controls Panel -->
            <div class="panel">
                <div class="panel-header">Device Controls</div>
                <div class="action-grid">
                    <button class="btn" onclick="toggleOrientation()">ROTATE SCREEN</button>
                    <button class="btn" onclick="reloadPhone()">RELOAD APP</button>
                    <button class="btn" onclick="window.open('/app/', '_blank')">FULLSCREEN TAB</button>
                    <button class="btn" onclick="openDownload()">PHONE DOWNLOAD</button>
                </div>
            </div>

            <!-- 1-Click Test Prompts -->
            <div class="panel">
                <div class="panel-header">Test Prompts</div>
                <div class="prompt-chip" onclick="injectPrompt('Cable route from L1 to L12, 500 m: 20 m trenchless, 50 m GI pipe, 430 m normal trenching, 7 cables of 12 core')">
                    <div class="chip-title">1. Standard Route (L1 to L12, 500m)</div>
                    <div class="chip-desc">20m trenchless, 50m GI pipe, 430m normal trenching, 7x12 core.</div>
                </div>

                <div class="prompt-chip" onclick="injectPrompt('एल १ से एल १२ तक ५०० मीटर केबल रूट बनाओ, २० मीटर ट्रेंचलेस, ५० मीटर जीआई पाइप और ४३० मीटर नॉर्मल ट्रेंचिंग ७x१२ कोर')">
                    <div class="chip-title">2. Devanagari Hindi Input</div>
                    <div class="chip-desc">५०० मीटर केबल रूट, ट्रेंचलेस, जीआई पाइप और नॉर्मल ट्रेंचिंग।</div>
                </div>

                <div class="prompt-chip" onclick="injectPrompt('Cable route from L1 to L15, 600 m: 30 m road crossing, 50 m trenchless, 70 m GI pipe, 450 m normal trenching, 6 cables of 24 core')">
                    <div class="chip-title">3. Road & Track Crossing (600m)</div>
                    <div class="chip-desc">30m road crossing, 50m trenchless, 70m GI pipe, 450m trenching, 6x24 core.</div>
                </div>
            </div>

            <!-- Download Official Signed APK -->
            <a href="/RailDraw.apk" class="download-box" download="RailDraw.apk">
                <div>
                    Download RailDraw.apk
                    <small>Official Signed Release v1.0.0 (0.90 MB)</small>
                </div>
                <span style="font-size: 14px; font-weight: bold;">[APK]</span>
            </a>
        </div>
    </div>

    <script>
        function updateClock() {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            document.getElementById('clockTime').textContent = h + ':' + m;
        }
        setInterval(updateClock, 1000);
        updateClock();

        function toggleOrientation() {
            document.getElementById('phoneMockup').classList.toggle('landscape');
        }

        function reloadPhone() {
            const iframe = document.getElementById('appIframe');
            iframe.src = '/app/?t=' + Date.now();
        }

        function injectPrompt(text) {
            const iframe = document.getElementById('appIframe');
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const textarea = doc.querySelector('textarea');
                if (textarea) {
                    textarea.value = text;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    const genBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Generate'));
                    if (genBtn) {
                        setTimeout(() => genBtn.click(), 150);
                    }
                } else {
                    const editBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Edit'));
                    if (editBtn) {
                        editBtn.click();
                        setTimeout(() => injectPrompt(text), 250);
                    }
                }
            } catch (err) {
                console.log('Inject note:', err);
            }
        }

        function openDownload() {
            window.location.href = '/download';
        }
    </script>
</body>
</html>
"""

@app.get("/download", response_class=HTMLResponse)
def download_page():
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download RailDraw APK</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; }
        body { background: #ECEEF2; color: #16202C; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
        .card { background: #F4F5F8; border-radius: 8px; border: 1px solid #CBD2DC; max-width: 440px; width: 100%; padding: 28px 24px; text-align: center; }
        .icon { width: 56px; height: 56px; background: #0C2340; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .icon svg { width: 32px; height: 32px; stroke: #D1D7E0; fill: none; }
        h1 { font-size: 22px; font-weight: 800; color: #0C2340; margin-bottom: 4px; }
        .subtitle { font-size: 13px; color: #475569; margin-bottom: 20px; }
        .btn-download { display: flex; align-items: center; justify-content: center; gap: 8px; background: #0C2340; color: #FFFFFF; text-decoration: none; font-size: 15px; font-weight: 700; padding: 12px 20px; border-radius: 6px; border: 1px solid #051426; transition: background 0.15s; }
        .btn-download:hover { background: #07172C; }
        .btn-sim { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; background: #D7DCE3; color: #16202C; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 16px; border-radius: 6px; border: 1px solid #BAC3CF; transition: background 0.15s; }
        .btn-sim:hover { background: #CAD0D9; }
        .meta { margin-top: 12px; font-size: 12px; color: #64748B; font-family: monospace; }
        .qr-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid #CBD2DC; }
        .qr-section h3 { font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 10px; }
        .qr-box { background: #FFFFFF; border: 1px solid #BAC3CF; border-radius: 4px; display: inline-block; padding: 8px; width: 160px; height: 160px; }
        .qr-box img { width: 100%; height: 100%; }
        .instructions { margin-top: 16px; text-align: left; background: #ECEEF2; border: 1px solid #CBD2DC; border-radius: 4px; padding: 12px; font-size: 12px; line-height: 1.5; }
        .instructions ol { padding-left: 18px; color: #334155; }
        .badge { display: inline-block; background: #D7DCE3; color: #0C2340; border: 1px solid #BAC3CF; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-bottom: 12px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">
            <svg viewBox="0 0 24 24" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16M8 6v12M16 6v12"/></svg>
        </div>
        <div class="badge">SIGNED RELEASE V1.0.0</div>
        <h1>RailDraw Signalling</h1>
        <div class="subtitle">Indian Railways S&T Cable Route Generator</div>

        <a href="/RailDraw.apk" class="btn-download" download="RailDraw.apk">
            Download RailDraw APK
        </a>

        <a href="/simulator" class="btn-sim">
            Test on Laptop Simulator
        </a>

        <div class="meta">Size: 0.90 MB • Package: com.raildraw.app • API 24–34</div>

        <div class="qr-section">
            <h3>Scan with Phone Camera</h3>
            <div class="qr-box">
                <img src="/qr.svg" alt="Scan QR Code">
            </div>
        </div>

        <div class="instructions">
            <strong>How to install on your phone:</strong>
            <ol>
                <li>Tap <b>Download RailDraw APK</b> above.</li>
                <li>When download finishes, tap the notification or file to open.</li>
                <li>If prompted <i>"Install unknown apps"</i>, tap <b>Settings</b> and enable <b>Allow from this source</b>.</li>
                <li>Tap <b>Install</b> and open RailDraw!</li>
            </ol>
        </div>
    </div>
</body>
</html>"""

@app.get("/qr.svg")
def get_qr_svg():
    qr_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "qr_apk.svg"))
    if not os.path.exists(qr_path):
        raise HTTPException(status_code=404, detail="QR code not found")
    return FileResponse(qr_path, media_type="image/svg+xml")


# PROJECTS
@app.get("/api/projects")
def list_projects():
    return get_all_projects()

@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    proj = get_project_by_id(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj

@app.post("/api/projects")
def upsert_project(project: Dict[str, Any]):
    saved = save_project(project)
    return saved

@app.delete("/api/projects/{project_id}")
def remove_project(project_id: str):
    success = delete_project(project_id)
    return {"success": success}

# SYMBOLS & MANIFEST
@app.get("/api/symbols")
def get_symbols():
    manifest_path = os.path.join(SYMBOLS_DIR, "manifest.json")
    if not os.path.exists(manifest_path):
        raise HTTPException(status_code=404, detail="Symbol manifest not found")
    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

@app.post("/api/symbols/{symbol_id}/verify")
def verify_symbol(symbol_id: str, payload: Dict[str, Any]):
    """Verify or update verification status of a symbol as per Indian Railways acceptance criteria."""
    manifest_path = os.path.join(SYMBOLS_DIR, "manifest.json")
    if not os.path.exists(manifest_path):
        raise HTTPException(status_code=404, detail="Symbol manifest not found")
    
    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    found = False
    for sym in data.get("symbols", []):
        if sym["id"] == symbol_id:
            sym["verificationStatus"] = payload.get("status", "VERIFIED")
            sym["verifiedBy"] = payload.get("verifiedBy", "SSE (Drawing)")
            sym["verificationDate"] = payload.get("date", "15-11-2026")
            sym["verificationNotes"] = payload.get("notes", "Verified against RDSO standard drawing")
            found = True
            break
            
    if not found:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol_id} not found in manifest")

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    # Also sync to frontend public
    frontend_manifest = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "symbols", "manifest.json"))
    if os.path.exists(os.path.dirname(frontend_manifest)):
        with open(frontend_manifest, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    return {"success": True, "symbolId": symbol_id, "status": payload.get("status", "VERIFIED")}

@app.post("/api/symbols")
def add_custom_symbol(payload: Dict[str, Any]):
    """Add a new symbol or update existing SVG and metadata."""
    manifest_path = os.path.join(SYMBOLS_DIR, "manifest.json")
    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    sym_id = payload.get("id")
    svg_content = payload.get("svgContent", "")
    
    # Save SVG file
    svg_file = f"{sym_id}.svg"
    svg_path = os.path.join(SYMBOLS_DIR, svg_file)
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
        
    frontend_svg_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "symbols", svg_file))
    with open(frontend_svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)

    # Update manifest
    symbols_list = data.get("symbols", [])
    existing = next((s for s in symbols_list if s["id"] == sym_id), None)
    
    new_entry = {
        "id": sym_id,
        "name": payload.get("name", sym_id),
        "category": payload.get("category", "Custom"),
        "description": payload.get("description", ""),
        "sourceReference": payload.get("sourceReference", "Custom Drawing"),
        "defaultSize": payload.get("defaultSize", {"width": 32, "height": 32}),
        "anchorPoint": payload.get("anchorPoint", {"x": 16, "y": 16}),
        "version": payload.get("version", "1.0.0"),
        "verificationStatus": payload.get("verificationStatus", "NEEDS VERIFICATION"),
        "verifiedBy": payload.get("verifiedBy"),
        "verificationDate": payload.get("verificationDate"),
        "verificationNotes": payload.get("verificationNotes", ""),
        "tags": payload.get("tags", []),
        "svgFile": svg_file
    }

    if existing:
        idx = symbols_list.index(existing)
        symbols_list[idx] = new_entry
    else:
        symbols_list.append(new_entry)

    data["symbols"] = symbols_list
    data["totalSymbols"] = len(symbols_list)

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    # Also sync manifest to frontend public
    frontend_manifest = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "symbols", "manifest.json"))
    if os.path.exists(os.path.dirname(frontend_manifest)):
        with open(frontend_manifest, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    return {"success": True, "symbol": new_entry}

# RULES
@app.get("/api/rules")
def get_rules():
    if not os.path.exists(STANDARDS_FILE):
        raise HTTPException(status_code=404, detail="Standards file not found")
    with open(STANDARDS_FILE, "r", encoding="utf-8") as f:
        rules = json.load(f)
    return rules

# DXF EXPORT
@app.post("/api/export/dxf")
def export_dxf(project: Dict[str, Any]):
    try:
        dxf_bytes = create_dxf_drawing(project)
        drg_no = project.get("metadata", {}).get("drawingNumber", "signalling_drawing").replace("/", "_")
        filename = f"{drg_no}.dxf"
        
        return Response(
            content=dxf_bytes,
            media_type="application/dxf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DXF generation error: {str(e)}")

# EXCEL / CSV IMPORT
@app.post("/api/import/excel")
async def import_route_data(file: UploadFile = File(...)):
    """Parses uploaded CSV/Excel containing route segments and cables."""
    content = await file.read()
    filename = file.filename.lower()
    segments = []
    cables = []

    try:
        if filename.endswith(".csv"):
            text = content.decode("utf-8")
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            mode = "segments"
            for line in lines:
                if "cable" in line.lower() and "," not in line:
                    mode = "cables"
                    continue
                parts = [p.strip() for p in line.split(",")]
                if len(parts) >= 2 and parts[0].lower() not in ["length", "length (m)", "cable type", "type"]:
                    if mode == "segments":
                        try:
                            length = float(parts[0])
                            method = parts[1] if len(parts) > 1 else "Normal Trenching"
                            depth = float(parts[2]) if len(parts) > 2 and parts[2] else 1.0
                            segments.append({
                                "id": f"seg-imp-{len(segments)+1}",
                                "length": length,
                                "layingMethod": method,
                                "depth": depth,
                                "coverType": parts[3] if len(parts) > 3 else "Class II Bricks",
                                "remarks": parts[4] if len(parts) > 4 else ""
                            })
                        except ValueError:
                            pass
        return {"success": True, "segments": segments, "cables": cables}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")

