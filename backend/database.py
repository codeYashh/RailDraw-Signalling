"""
SQLite Database Layer for RailDraw Signalling
Provides persistent storage for projects, revisions, custom symbols, and audit history.
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "raildraw.db")

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            data_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS revisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            revision_tag TEXT NOT NULL,
            data_json TEXT NOT NULL,
            author TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS custom_symbols (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            manifest_json TEXT NOT NULL,
            svg_content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            user TEXT NOT NULL,
            details TEXT,
            timestamp TEXT NOT NULL
        )
    """)

    conn.commit()

    # Check if seed projects exist
    c.execute("SELECT COUNT(*) FROM projects")
    count = c.fetchone()[0]
    if count == 0:
        seed_default_projects(conn)

    conn.close()

def seed_default_projects(conn):
    now = datetime.now().isoformat()
    # 1. PRIMARY REFERENCE PROJECT (L1 to L12, 500m)
    p1 = {
        "id": "proj-l1-l12",
        "name": "Cable Route L1 to L12 (500m Reference)",
        "metadata": {
            "railwayZone": "Northern Railway",
            "division": "Delhi",
            "stationSection": "Ghaziabad - Sahibabad Section",
            "workName": "Provision of Signalling Cable Route between Location Box L1 and L12",
            "drawingNumber": "NR/S&T/CABLE/GZB-SBB/2026/01",
            "revision": "R0",
            "scale": "N.T.S.",
            "date": "15-11-2026",
            "preparedBy": "R. K. Sharma",
            "preparedByDesig": "JE (Signal) / Drg",
            "checkedBy": "A. K. Verma",
            "checkedByDesig": "SSE (Signal) / Drg",
            "approvedBy": "S. N. Singh",
            "approvedByDesig": "Dy. CSTE / Projects",
            "sheetNo": "01",
            "totalSheets": "01",
            "isBilingual": True
        },
        "startNode": {
            "id": "L1",
            "name": "Location Box L1",
            "type": "location_box_single",
            "chainageKm": 18.0,
            "chainageM": 100.0,
            "remarks": "Apparatus Case for Signal S2 & Point 101 Detection"
        },
        "endNode": {
            "id": "L12",
            "name": "Location Box L12",
            "type": "location_box_single",
            "chainageKm": 18.0,
            "chainageM": 600.0,
            "remarks": "Apparatus Case for Auto Signal A2 & Repeater"
        },
        "intermediateNodes": [],
        "segments": [
            {
                "id": "seg-1",
                "length": 20.0,
                "layingMethod": "Trenchless-HDD",
                "depth": 1.5,
                "coverType": "HDPE Casing Pipe",
                "remarks": "Crossing under Goods Line & Shunting Neck via HDD"
            },
            {
                "id": "seg-2",
                "length": 50.0,
                "layingMethod": "GI Pipe",
                "depth": 1.2,
                "coverType": "100mm GI Pipe Class B",
                "remarks": "Culvert crossing & rocky ground protection"
            },
            {
                "id": "seg-3",
                "length": 430.0,
                "layingMethod": "Normal Trenching",
                "depth": 1.0,
                "coverType": "Class II Bricks",
                "remarks": "Standard soil trench with sand bedding & CRM at 50m"
            }
        ],
        "cables": [
            {
                "id": "cab-1",
                "cableType": "Signalling",
                "count": 7,
                "coreCount": 12,
                "conductorSize": "1.5 sq mm",
                "isArmoured": True,
                "cableTag": "SIG/C-01 to C-07",
                "function": "Signal Aspects, Point Machine Operation & Track Circuit Repeater Circuits"
            }
        ],
        "settings": {
            "paperSize": "A3",
            "orientation": "landscape",
            "showGrid": False,
            "showNorthArrow": True,
            "showScaleBar": True,
            "showLegend": True,
            "showNotes": True,
            "showCallout": True,
            "calloutPosition": {"x": 550, "y": 380, "sourceIndex": 1},
            "customNotes": [],
            "customNotesHindi": []
        },
        "revisionHistory": [
            {
                "revision": "R0",
                "date": "15-11-2026",
                "description": "Initial Cable Route Plan Release",
                "preparedBy": "R. K. Sharma",
                "approvedBy": "S. N. Singh"
            }
        ],
        "createdAt": now,
        "updatedAt": now
    }

    # 2. YARD CROSSING PROJECT (1200m)
    p2 = {
        "id": "proj-yard-crossing",
        "name": "Yard Track Crossing Route (Station Yard to LC Gate)",
        "metadata": {
            "railwayZone": "Western Railway",
            "division": "Mumbai Central",
            "stationSection": "Borivali - Virar Section",
            "workName": "Signalling & Telecom Cable Laying for LC Gate No. 34 Interlocking",
            "drawingNumber": "WR/S&T/SIG/BVI-VR/LC34/2026/07",
            "revision": "R1",
            "scale": "N.T.S.",
            "date": "15-11-2026",
            "preparedBy": "D. M. Patel",
            "preparedByDesig": "SSE (Signal)",
            "checkedBy": "K. S. Rao",
            "checkedByDesig": "ASTE (W)",
            "approvedBy": "M. K. Gupta",
            "approvedByDesig": "Sr. DSTE",
            "sheetNo": "01",
            "totalSheets": "01",
            "isBilingual": True
        },
        "startNode": {
            "id": "RH-1",
            "name": "Station Relay Hut",
            "type": "relay_hut",
            "chainageKm": 34.0,
            "chainageM": 200.0,
            "remarks": "Main Electronic Interlocking Hut"
        },
        "endNode": {
            "id": "LC-34",
            "name": "LC Gate No. 34",
            "type": "level_crossing_interlocked",
            "chainageKm": 35.0,
            "chainageM": 400.0,
            "remarks": "Interlocked Manned Lifting Barrier Gate"
        },
        "intermediateNodes": [],
        "segments": [
            {
                "id": "seg-y1",
                "length": 80.0,
                "layingMethod": "Track crossing",
                "depth": 1.2,
                "coverType": "150mm RCC Pipe",
                "remarks": "Crossing 4 Yard tracks"
            },
            {
                "id": "seg-y2",
                "length": 120.0,
                "layingMethod": "GI Pipe",
                "depth": 1.0,
                "coverType": "GI Pipe on brackets",
                "remarks": "Along Culvert No. 12"
            },
            {
                "id": "seg-y3",
                "length": 1000.0,
                "layingMethod": "Normal Trenching",
                "depth": 1.0,
                "coverType": "Pre-cast RCC Slabs",
                "remarks": "Along cess with cable markers at 50m"
            }
        ],
        "cables": [
            {
                "id": "cab-y1",
                "cableType": "Signalling",
                "count": 4,
                "coreCount": 24,
                "conductorSize": "1.5 sq mm",
                "isArmoured": True,
                "cableTag": "SIG/LC34-01-04",
                "function": "Gate Control, Boom Detection & Interlocking Relays"
            },
            {
                "id": "cab-y2",
                "cableType": "Power",
                "count": 2,
                "coreCount": 2,
                "conductorSize": "25.0 sq mm",
                "isArmoured": True,
                "cableTag": "PWR/LC34-01-02",
                "function": "110V DC Power Supply for Barrier Motor"
            }
        ],
        "settings": {
            "paperSize": "A3",
            "orientation": "landscape",
            "showGrid": False,
            "showNorthArrow": True,
            "showScaleBar": True,
            "showLegend": True,
            "showNotes": True,
            "showCallout": True,
            "calloutPosition": {"x": 550, "y": 380, "sourceIndex": 0},
            "customNotes": [],
            "customNotesHindi": []
        },
        "revisionHistory": [],
        "createdAt": now,
        "updatedAt": now
    }

    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO projects (id, name, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
              (p1["id"], p1["name"], json.dumps(p1), now, now))
    c.execute("INSERT OR REPLACE INTO projects (id, name, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
              (p2["id"], p2["name"], json.dumps(p2), now, now))
    conn.commit()

def get_all_projects() -> List[Dict[str, Any]]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, name, data_json, created_at, updated_at FROM projects ORDER BY updated_at DESC")
    rows = c.fetchall()
    conn.close()
    result = []
    for row in rows:
        proj = json.loads(row["data_json"])
        result.append(proj)
    return result

def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT data_json FROM projects WHERE id = ?", (project_id,))
    row = c.fetchone()
    conn.close()
    if row:
        return json.loads(row["data_json"])
    return None

def save_project(project: Dict[str, Any], user: str = "Engineer") -> Dict[str, Any]:
    conn = get_connection()
    c = conn.cursor()
    now = datetime.now().isoformat()
    project["updatedAt"] = now
    if not project.get("createdAt"):
        project["createdAt"] = now

    p_id = project.get("id")
    p_name = project.get("name", "Untitled Signalling Drawing")
    data_str = json.dumps(project)

    c.execute("INSERT OR REPLACE INTO projects (id, name, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
              (p_id, p_name, data_str, project["createdAt"], now))
    
    # Audit log
    c.execute("INSERT INTO audit_logs (action, user, details, timestamp) VALUES (?, ?, ?, ?)",
              ("SAVE_PROJECT", user, f"Saved project {p_id} ({p_name})", now))
    
    conn.commit()
    conn.close()
    return project

def delete_project(project_id: str, user: str = "Engineer") -> bool:
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    c.execute("INSERT INTO audit_logs (action, user, details, timestamp) VALUES (?, ?, ?, ?)",
              ("DELETE_PROJECT", user, f"Deleted project {project_id}", datetime.now().isoformat()))
    conn.commit()
    conn.close()
    return True

# Initialize on import
init_db()

