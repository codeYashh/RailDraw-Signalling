# RailDraw Signalling 🚆📐

**Next-Generation Computer-Aided Drafting (CAD) & Engineering Drawing Generator for Indian Railways Signal & Telecom (S&T)**

[![Indian Railways S&T Standard](https://img.shields.io/badge/Standard-IRSEM%20Part%20II%20%2F%20RDSO-maroon.svg)](https://indianrailways.gov.in)
[![AutoCAD Compatible](https://img.shields.io/badge/AutoCAD-DXF%20R12%2FR2010%20Layers-blue.svg)](https://ezdxf.readthedocs.io/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Android](https://img.shields.io/badge/Android-Jetpack%20Compose-3ddc84.svg?logo=android&logoColor=white)](https://developer.android.com/)
[![Offline First](https://img.shields.io/badge/Deployment-Air--Gapped%20%2F%20Offline%20Ready-success.svg)]()
[![Download APK](https://img.shields.io/badge/Download%20APK-RailDraw.apk%20(v1.5.0)-brightgreen?logo=android&style=for-the-badge)](https://github.com/codeYashh/RailDraw-Signalling/raw/main/RailDraw.apk)

> 📲 **Download on Android**: [Click here to download RailDraw.apk](https://github.com/codeYashh/RailDraw-Signalling/raw/main/RailDraw.apk) directly to install on your Android device!

---

## 📖 Overview

**RailDraw Signalling** is a modern, full-stack CAD application and mobile engineering suite purpose-built for **Indian Railways Signal & Telecom (S&T)** engineers, drawing offices, and divisional / zonal headquarters. It automatically generates print-ready, standards-compliant engineering drawings adhering strictly to the **Indian Railways Signal Engineering Manual (IRSEM)** and **RDSO standard drafting conventions**.

RailDraw bridges the gap between field survey data and precision drafting by translating natural language prompts, structured route schedules, or Excel/CSV sheets directly into production-grade vector CAD drawings and layered AutoCAD DXF files.

---

## 🌟 Key Features

### 1. ⚡ Automated Cable Route Layout Engine
* **Intelligent Segment Generation**: Automatically renders horizontal route diagrams between locations (e.g. **L1** to **L12**, total **500 m**).
* **True-to-Code Laying Methods**:
  * **Trenchless / HDD**: 45-degree cross-hatching pattern with drill entry/exit guides.
  * **GI Pipe / RCC Pipe / HDPE Pipe**: Double-line pipe representations with standard casing collars.
  * **Normal Trenching**: Clean single trench lines with Cable Route Markers (**CRM**) at 50 m intervals.
  * **Track / Rail Crossings**: Standard track sleepers and rails crossing glyphs with protective casing.
* **Standards-Compliant Dimensioning**: Engineering witness lines with 2 mm offsets, 3 mm overshoots, 3:1 closed filled arrowheads, and centered dimension text.
* **Detail 'A' Zoomed Callouts**: Automatic leader callouts detailing trench cross-sections: Ground Level (**G.L.**), 1.0 m depth, Class II protective bricks, 50 mm clean sand bedding, and multi-core signalling cables in cross-section.

### 2. 🗃️ 45+ RDSO S&T Vector Symbol Library
* Fully modular, data-driven vector symbol library with SVG graphics and an indexed `manifest.json`.
* **Signals**: 2/3/4-aspect Colour Light Signals (CLS), Semaphore, Shunt disc, Calling-on ('C' marker), Repeater ('R'), Home, Starter, Advance Starter, Outer, Distant ('P'), IBS, and Gate Signals.
* **Points & Machines**: Electric Point Machine (RDSO S-10880), Turnout switch, Derailing trap switch, Diamond crossing, Sand hump, Buffer stop.
* **Track Detection**: Glued Insulated Rail Joints (GJ), Single/Double rail Axle Counters (SSDAC/MSDAC).
* **Housing**: Single & Double Apparatus Cases (Location Boxes), S&T Junction Boxes, Cable Termination Boxes, Relay Huts, Station Relay Rooms, Signal Cabins.
* **Grounding & Protection**: Cable Route Markers (CRM), Joint Markers (CJM), Track Crossing Markers (TCM), Maintenance-Free Earth Pits (RDSO/SPN/197), and Surge Protection Devices (SPD).
* **Interactive Symbol Manager**: In-app management interface to inspect, verify, replace, and upload custom SVG symbols without modifying codebase.

### 3. 📋 Standard Indian Railways Title Block & Border
* Double neat-line border with standard **20 mm left filing margin** and 10 mm top/right/bottom margins.
* Standard Indian Railways title block in the bottom-right corner:
  * Railway Zone and Division header.
  * Name of Work and Station/Section.
  * Drawing Number, Revision history, Scale, Date, Sheet index.
  * Official signature blocks: Prepared by (**JE/Sig**), Checked by (**SSE/Sig**), Approved by (**Sr. DSTE / Dy. CSTE**).
* **Bilingual Support**: One-click toggle between English and Hindi (`भारतीय रेल`, `कार्य का नाम`, `सामान्य टिप्पणियाँ`).

### 4. 📤 Multi-Format Export Suite
* **AutoCAD DXF**: Native 10-layer DXF (`ROUTE`, `DIM`, `TEXT`, `SYMBOLS`, `FRAME`, `HATCH`, `TITLE_BLOCK`, `NOTES`, `CALLOUT`, `LEGEND`). Compatible with AutoCAD, DraftSight, and LibreCAD.
* **Printable Vector PDF**: High-resolution vector PDF in standard **A3** (recommended IRSEM size), A4, A2, and A1 formats.
* **Vector SVG Master**: Lossless scalable vector master for archival and digital sharing.
* **High-Res PNG**: 300 DPI raster preview.
* **Project JSON**: Complete drawing project file for backup, restore, and transfer.

### 5. 📱 Native Android Mobile Suite
* **100% Offline Field App**: Single Activity Kotlin + Jetpack Compose application.
* **Voice-Guided CAD Generation**: Integrated speech recognition with bilingual support (English `en-IN` and Hindi `hi-IN`).
* **Hardware-Accelerated Canvas**: Direct `android.graphics.Canvas` producing high-resolution (2800 x 1800 px) engineering bitmaps and vector PDFs.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas API |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic, SQLite |
| **CAD Export Engine** | `ezdxf` (AutoCAD DXF generation), ReportLab / Canvas Vector PDF |
| **Mobile** | Kotlin, Jetpack Compose, Material 3, Android SDK (API 24 - 34) |
| **Standards** | IRSEM Part II Chapter 15, RDSO Specifications |

---

## 📁 Repository Structure

```
Signal/
├── backend/                  # Python FastAPI Backend
│   ├── main.py               # REST API, Symbol endpoints, DXF/PDF export services
│   ├── dxf_exporter.py       # AutoCAD DXF generator (ezdxf) with layered geometry
│   ├── models.py             # Pydantic data validation schemas
│   └── database.py           # SQLite persistence for projects & audit logs
│
├── frontend/                 # Vite + React + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas/       # Master Vector SVG CAD Canvas Engine
│   │   │   ├── Wizard/       # 5-Step Signalling Wizard (Steps 1 to 5)
│   │   │   ├── SymbolManager/# In-app Symbol Manager & Verification Tool
│   │   │   └── SimpleApp/    # Mobile-first CAD UI & Prompt Composer
│   │   ├── services/         # API clients, Vector PDF & DXF exporters
│   │   └── types/            # TypeScript domain schemas
│   └── public/symbols/       # Standard Indian Railways SVG symbol set
│
├── symbols/                  # Seeded data-driven SVG symbols (45+ symbols)
│   ├── manifest.json         # Symbol manifest with RDSO references & anchor metadata
│   └── *.svg                 # Vector symbol glyphs
│
├── standards/
│   └── irsem_rules.json      # Configurable IRSEM Chapter 15 Rule Pack
│
├── android/                  # Native Android App (Kotlin + Jetpack Compose)
│   ├── app/src/main/         # Android application source code
│   └── build.gradle.kts      # Android build configuration
│
├── scripts/                  # Automation & verification utilities
│   ├── generate_symbols.py   # Symbol generator & manifest builder
│   └── verify_e2e.py         # End-to-end browser verification script
│
├── tests/                    # Automated test suites
│   └── test_dxf_and_rules.py # Unit tests for geometry, rules & DXF layers
│
├── VERIFICATION_CHECKLIST.md # Official S&T Drawing Office Verification Checklist
├── USER_GUIDE.md             # Complete user guide for S&T engineers
├── requirements.txt          # Python dependencies
└── start_app.ps1             # One-click launch script for local servers
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18 or higher) & **npm**
* **Python** (v3.10 or higher) & **pip**

### 1. Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/RailDraw.git
cd RailDraw

# 2. Install Python backend dependencies
pip install -r requirements.txt

# 3. Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Running Locally

You can launch both the backend and frontend simultaneously with the provided PowerShell script:
```powershell
.\start_app.ps1
```

Or run them individually in separate terminals:

**Backend Server (FastAPI):**
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
* API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`

**Frontend Application (Vite):**
```bash
cd frontend
npm run dev
```
* Web Application: `http://127.0.0.1:5173`

---

## 🔒 Security & Environment Configuration

* **Secrets & Keys**: All sensitive signing keys (`*.keystore`, `*.jks`, `KEYSTORE_INFO.txt`), local databases (`*.db`), and environment files (`.env`) are excluded from version control via `.gitignore`.
* **Android Signing**: For release APK generation, place your signing keystore in a local, uncommitted directory and configure signing credentials through environment variables or local Gradle properties:
  ```bash
  export ANDROID_KEYSTORE_PATH="/path/to/release.keystore"
  export ANDROID_KEYSTORE_PASSWORD="your-password"
  export ANDROID_KEY_ALIAS="your-alias"
  export ANDROID_KEY_PASSWORD="your-password"
  ```

---

## 🧪 Testing & Verification

Run the test suite to verify IRSEM rule validation and DXF generation:
```bash
# Run backend & geometry unit tests
pytest tests/test_dxf_and_rules.py -v

# Run E2E verification
python scripts/verify_e2e.py
```

---

## 📜 Standards & Compliance Reference

RailDraw Signalling adheres to:
* **IRSEM (Part I & II)**: Chapter 15 — Installation and Maintenance of Signalling Cables.
* **RDSO Standards**:
  * `SD-10021` to `SD-10029`: Colour Light Signalling Schemes.
  * `S-10880`: Point Machine Installation Standards.
  * `S-11500 / S-11501`: Single & Double Apparatus Cases (Location Boxes).
  * `RDSO/SPN/196`: Standard Specifications for Trenchless / HDD Pipe Encasement.
  * `RDSO/SPN/197`: Maintenance-Free Earthing and Bonding for Signalling Installations.
  * `IRS: S 63/2014`: PVC Insulated Armoured Railway Signalling Cables.

---

## 📄 License & Attribution

Designed and maintained for **Indian Railways S&T Department**. Distributed under the MIT License.
