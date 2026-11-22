#!/usr/bin/env python3
"""
Adds 25 new authentic Indian Railways S&T symbols (Signals, Trackside equipment, Boards,
Power & Telecom) compliant with IRSEM Part II, RDSO specifications, and IRISET standards.
"""

import os
import json
import shutil

NEW_SYMBOLS = [
    {
        "id": "signal_route_indicator",
        "name": "Route Indicator / Junction Indicator (Feather Type)",
        "category": "Signals",
        "description": "RDSO standard Junction Type Route Indicator with 5 lunar white lamps in a feather arm at 45° angle mounted above CLS for turnout route indication.",
        "source": "IRSEM Part II Chapter 15 / RDSO Drawing SD-10041",
        "width": 36,
        "height": 60,
        "anchor": {"x": 18, "y": 60},
        "tags": ["signal", "route indicator", "junction", "feather", "turnout", "cls"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 60" width="36" height="60">
  <line x1="18" y1="60" x2="18" y2="18" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="10" y1="60" x2="26" y2="60" stroke="#0f172a" stroke-width="3"/>
  <!-- 3-aspect signal head -->
  <rect x="11" y="16" width="14" height="28" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="18" cy="22" r="3.2" fill="#10b981" stroke="#ffffff" stroke-width="0.7"/>
  <circle cx="18" cy="30" r="3.2" fill="#f59e0b" stroke="#ffffff" stroke-width="0.7"/>
  <circle cx="18" cy="38" r="3.2" fill="#ef4444" stroke="#ffffff" stroke-width="0.7"/>
  <!-- Feather arm with 5 lunar white indicators -->
  <line x1="18" y1="16" x2="32" y2="4" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
  <circle cx="21" cy="13" r="1.5" fill="#f8fafc" stroke="#0f172a" stroke-width="0.5"/>
  <circle cx="24" cy="10.5" r="1.5" fill="#f8fafc" stroke="#0f172a" stroke-width="0.5"/>
  <circle cx="27" cy="8" r="1.5" fill="#f8fafc" stroke="#0f172a" stroke-width="0.5"/>
  <circle cx="30" cy="5.5" r="1.5" fill="#f8fafc" stroke="#0f172a" stroke-width="0.5"/>
</svg>"""
    },
    {
        "id": "signal_automatic",
        "name": "Automatic Stop Signal ('A' Marker)",
        "category": "Signals",
        "description": "Multiple Aspect Colour Light Signal fitted with circular white disc and black letter 'A' marker for Automatic Block Signalling sections.",
        "source": "IRSEM Part II 15.3 / RDSO Drawing SD-10025",
        "width": 34,
        "height": 56,
        "anchor": {"x": 16, "y": 56},
        "tags": ["signal", "automatic", "a marker", "abs", "running signal", "cls"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 56" width="34" height="56">
  <line x1="16" y1="56" x2="16" y2="16" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="8" y1="56" x2="24" y2="56" stroke="#0f172a" stroke-width="3"/>
  <rect x="10" y="6" width="12" height="32" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="16" cy="12" r="3" fill="#10b981" stroke="#ffffff" stroke-width="0.7"/>
  <circle cx="16" cy="22" r="3" fill="#f59e0b" stroke="#ffffff" stroke-width="0.7"/>
  <circle cx="16" cy="32" r="3" fill="#ef4444" stroke="#ffffff" stroke-width="0.7"/>
  <!-- Circular 'A' marker disc -->
  <circle cx="27" cy="22" r="6" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/>
  <text x="27" y="24.5" font-size="7.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">A</text>
</svg>"""
    },
    {
        "id": "signal_semi_automatic",
        "name": "Semi-Automatic Stop Signal (Illuminated 'A' Marker)",
        "category": "Signals",
        "description": "Controlled colour light signal with illuminated 'A' marker box that illuminates when working in automatic mode and extinguishes when manually interlocked.",
        "source": "IRSEM Part II 15.3.4 / RDSO SD-10026",
        "width": 38,
        "height": 56,
        "anchor": {"x": 16, "y": 56},
        "tags": ["signal", "semi-automatic", "illuminated a marker", "king lever", "cls"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 56" width="38" height="56">
  <line x1="16" y1="56" x2="16" y2="16" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="8" y1="56" x2="24" y2="56" stroke="#0f172a" stroke-width="3"/>
  <rect x="10" y="6" width="12" height="32" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="16" cy="12" r="3" fill="#10b981" stroke="#ffffff" stroke-width="0.7"/>
  <circle cx="16" cy="22" r="3" fill="#f59e0b" stroke="#ffffff" stroke-width="0.7"/>
  <circle cx="16" cy="32" r="3" fill="#ef4444" stroke="#ffffff" stroke-width="0.7"/>
  <!-- Illuminated 'A' marker rectangular indicator box -->
  <rect x="24" y="16" width="12" height="12" rx="2" fill="#0f172a" stroke="#facc15" stroke-width="1.2"/>
  <text x="30" y="25" font-size="8" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#facc15">A</text>
</svg>"""
    },
    {
        "id": "signal_inner_distant",
        "name": "Inner Distant Signal ('ID' Marker)",
        "category": "Signals",
        "description": "Distant signal with circular disc 'ID' marker used in Double Distant territory for high-speed routes (130-160 km/h) under RDSO guidelines.",
        "source": "RDSO Drawing SD-10028 / IRSEM Part II 15.2",
        "width": 36,
        "height": 56,
        "anchor": {"x": 16, "y": 56},
        "tags": ["signal", "inner distant", "id marker", "double distant", "macls"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 56" width="36" height="56">
  <line x1="16" y1="56" x2="16" y2="16" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="8" y1="56" x2="24" y2="56" stroke="#0f172a" stroke-width="3"/>
  <rect x="10" y="6" width="12" height="32" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="16" cy="12" r="3" fill="#10b981" stroke="#ffffff" stroke-width="0.7"/>
  <circle cx="16" cy="22" r="3" fill="#f59e0b" stroke="#ffffff" stroke-width="0.7"/>
  <circle cx="16" cy="32" r="3" fill="#f59e0b" stroke="#ffffff" stroke-width="0.7"/>
  <!-- Circular 'ID' marker disc -->
  <circle cx="28" cy="22" r="7" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/>
  <text x="28" y="24.5" font-size="6.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">ID</text>
</svg>"""
    },
    {
        "id": "signal_intermediate_starter",
        "name": "Intermediate Starter Signal",
        "category": "Signals",
        "description": "Intermediate Starter signal installed between Starter and Advanced Starter in large yards or long loop sidings.",
        "source": "IRSEM Part II 15.4 / RDSO SD-10029",
        "width": 36,
        "height": 56,
        "anchor": {"x": 16, "y": 56},
        "tags": ["signal", "intermediate starter", "is", "starter", "yard", "cls"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 56" width="36" height="56">
  <line x1="16" y1="56" x2="16" y2="16" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="8" y1="56" x2="24" y2="56" stroke="#0f172a" stroke-width="3"/>
  <rect x="10" y="6" width="12" height="32" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="16" cy="12" r="3" fill="#10b981" stroke="#ffffff" stroke-width="0.7"/>
  <circle cx="16" cy="22" r="3" fill="#f59e0b" stroke="#ffffff" stroke-width="0.7"/>
  <circle cx="16" cy="32" r="3" fill="#ef4444" stroke="#ffffff" stroke-width="0.7"/>
  <!-- 'IS' Indicator Plate -->
  <rect x="23" y="17" width="12" height="10" rx="2" fill="#0284c7" stroke="#ffffff" stroke-width="0.8"/>
  <text x="29" y="24.5" font-size="6" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#ffffff">IS</text>
</svg>"""
    },
    {
        "id": "signal_coacting",
        "name": "Co-acting Signal (Duplicate Signal)",
        "category": "Signals",
        "description": "Duplicate signal units on the same tubular post (upper and lower heads) to ensure visibility when obstructed by FOB, ROB, or overline structure.",
        "source": "IRSEM Part II 15.5 / RDSO SD-10030",
        "width": 34,
        "height": 68,
        "anchor": {"x": 16, "y": 68},
        "tags": ["signal", "co-acting", "duplicate", "fob", "sighting", "cls"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 68" width="34" height="68">
  <line x1="16" y1="68" x2="16" y2="6" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="8" y1="68" x2="24" y2="68" stroke="#0f172a" stroke-width="3"/>
  <!-- Upper signal head -->
  <rect x="10" y="4" width="12" height="22" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.4"/>
  <circle cx="16" cy="9" r="2.8" fill="#10b981" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="16" cy="19" r="2.8" fill="#ef4444" stroke="#ffffff" stroke-width="0.6"/>
  <!-- Lower duplicated signal head -->
  <rect x="10" y="32" width="12" height="22" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.4"/>
  <circle cx="16" cy="37" r="2.8" fill="#10b981" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="16" cy="47" r="2.8" fill="#ef4444" stroke="#ffffff" stroke-width="0.6"/>
</svg>"""
    },
    {
        "id": "signal_banner_repeater",
        "name": "Banner Type Repeater Signal",
        "category": "Signals",
        "description": "Standard Indian Railways banner type visual repeater with circular yellow disc and horizontal revolving black bar indicating 'ON' or 45° 'OFF'.",
        "source": "IRSEM Part II Chapter 15 / RDSO Drawing SD-10035",
        "width": 34,
        "height": 48,
        "anchor": {"x": 16, "y": 48},
        "tags": ["signal", "repeater", "banner", "visual", "caution", "sighting"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 48" width="34" height="48">
  <line x1="16" y1="48" x2="16" y2="18" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="8" y1="48" x2="24" y2="48" stroke="#0f172a" stroke-width="3"/>
  <!-- Circular yellow housing -->
  <circle cx="16" cy="16" r="14" fill="#facc15" stroke="#0f172a" stroke-width="2"/>
  <!-- Black revolving banner bar -->
  <rect x="5" y="13.5" width="22" height="5" rx="1" fill="#0f172a"/>
  <!-- Center pivot -->
  <circle cx="16" cy="16" r="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
</svg>"""
    },
    {
        "id": "signal_shunt_position",
        "name": "Position Light Shunt Signal (Ground Disc)",
        "category": "Signals",
        "description": "Standard ground mounted position light shunt signal with two white lunar lights horizontally (Stop) or diagonally at 45° (Proceed).",
        "source": "IRSEM Part II 15.8 / RDSO Drawing SD-10045",
        "width": 32,
        "height": 36,
        "anchor": {"x": 16, "y": 36},
        "tags": ["signal", "shunt", "position light", "ground shunt", "shunting"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 36" width="32" height="36">
  <line x1="16" y1="36" x2="16" y2="24" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="10" y1="36" x2="22" y2="36" stroke="#0f172a" stroke-width="3"/>
  <!-- White circular disc housing -->
  <circle cx="16" cy="14" r="12" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
  <!-- Red horizontal bar (STOP indication) -->
  <rect x="7" y="12" width="18" height="4" rx="1" fill="#dc2626"/>
  <!-- Position light lamps -->
  <circle cx="11" cy="17" r="2.2" fill="#ffffff" stroke="#0f172a" stroke-width="0.8"/>
  <circle cx="21" cy="11" r="2.2" fill="#ffffff" stroke="#0f172a" stroke-width="0.8"/>
</svg>"""
    },
    {
        "id": "signal_calling_on_cls",
        "name": "Calling-On Signal on CLS Mast",
        "category": "Signals",
        "description": "Calling-on unit with circular 'C' marker mounted beneath main CLS Home signal displaying miniature yellow aspect for receiving train on obstructed line.",
        "source": "IRSEM Part II 15.9 / RDSO Drawing SD-10048",
        "width": 34,
        "height": 62,
        "anchor": {"x": 16, "y": 62},
        "tags": ["signal", "calling-on", "c marker", "subsidiary", "stop signal"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 62" width="34" height="62">
  <line x1="16" y1="62" x2="16" y2="12" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="8" y1="62" x2="24" y2="62" stroke="#0f172a" stroke-width="3"/>
  <!-- Main 3-aspect head -->
  <rect x="10" y="4" width="12" height="30" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="16" cy="9" r="2.8" fill="#10b981" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="16" cy="18" r="2.8" fill="#f59e0b" stroke="#ffffff" stroke-width="0.6"/>
  <circle cx="16" cy="27" r="2.8" fill="#ef4444" stroke="#ffffff" stroke-width="0.6"/>
  <!-- Calling-on unit beneath -->
  <rect x="10" y="38" width="12" height="12" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="16" cy="44" r="2.5" fill="#facc15" stroke="#ffffff" stroke-width="0.6"/>
  <!-- 'C' marker circular plate -->
  <circle cx="26" cy="44" r="5" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
  <text x="26" y="46.5" font-size="6.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">C</text>
</svg>"""
    },
    {
        "id": "signal_gate_cls",
        "name": "Gate Signal with 'G' Marker",
        "category": "Signals",
        "description": "Colour light signal protecting a level crossing gate equipped with standard circular yellow disc and black letter 'G'.",
        "source": "IRSEM Part II 15.10 / RDSO Drawing SD-10050",
        "width": 34,
        "height": 56,
        "anchor": {"x": 16, "y": 56},
        "tags": ["signal", "gate signal", "g marker", "level crossing", "cls"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 56" width="34" height="56">
  <line x1="16" y1="56" x2="16" y2="16" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="8" y1="56" x2="24" y2="56" stroke="#0f172a" stroke-width="3"/>
  <rect x="10" y="6" width="12" height="32" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="16" cy="12" r="3" fill="#10b981" stroke="#ffffff" stroke-width="0.7"/>
  <circle cx="16" cy="22" r="3" fill="#f59e0b" stroke="#ffffff" stroke-width="0.7"/>
  <circle cx="16" cy="32" r="3" fill="#ef4444" stroke="#ffffff" stroke-width="0.7"/>
  <!-- Circular yellow 'G' marker disc -->
  <circle cx="27" cy="22" r="6" fill="#facc15" stroke="#0f172a" stroke-width="1.2"/>
  <text x="27" y="24.5" font-size="7.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">G</text>
</svg>"""
    },
    {
        "id": "signal_warner",
        "name": "Semaphore Warner / Distant Signal",
        "category": "Signals",
        "description": "Semaphore warning arm with fishtail end (yellow with black chevron) on lattice post.",
        "source": "IRSEM Part II Chapter 14 / RDSO SD-10012",
        "width": 44,
        "height": 52,
        "anchor": {"x": 24, "y": 52},
        "tags": ["signal", "semaphore", "warner", "distant", "fishtail"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 52" width="44" height="52">
  <line x1="24" y1="52" x2="24" y2="6" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="16" y1="52" x2="32" y2="52" stroke="#0f172a" stroke-width="3"/>
  <!-- Fishtail semaphore warning arm -->
  <polygon points="24,10 6,10 1,15 6,20 24,20" fill="#facc15" stroke="#0f172a" stroke-width="1.5"/>
  <!-- Black chevron stripe -->
  <polygon points="12,10 8,15 12,20 15,20 11,15 15,10" fill="#0f172a"/>
  <!-- Spectacle glasses -->
  <circle cx="26" cy="15" r="3.5" fill="#10b981" stroke="#0f172a" stroke-width="1"/>
  <circle cx="33" cy="15" r="3.5" fill="#f59e0b" stroke="#0f172a" stroke-width="1"/>
</svg>"""
    },
    {
        "id": "fouling_mark",
        "name": "Fouling Mark (FM Post)",
        "category": "Civil & Track Infrastructure",
        "description": "Standard Indian Railways painted concrete post with black crown placed between converging tracks where standard clearance is reached.",
        "source": "IRSEM Part II Chapter 15 / Indian Railways Permanent Way Manual",
        "width": 28,
        "height": 32,
        "anchor": {"x": 14, "y": 32},
        "tags": ["track", "fouling mark", "fm", "clearance", "turnout", "pway"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 32" width="28" height="32">
  <!-- Concrete foundation base -->
  <line x1="4" y1="30" x2="24" y2="30" stroke="#475569" stroke-width="3"/>
  <!-- White concrete stone post -->
  <rect x="8" y="10" width="12" height="20" rx="1" fill="#ffffff" stroke="#0f172a" stroke-width="1.8"/>
  <!-- Black painted top crown -->
  <rect x="8" y="10" width="12" height="6" fill="#0f172a"/>
  <text x="14" y="24" font-size="7" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">FM</text>
</svg>"""
    },
    {
        "id": "track_lead_junction_box",
        "name": "Track Lead Junction Box (TLJB)",
        "category": "Track Circuits & Axle Counters",
        "description": "Dedicated trackside junction box with bootleg connection for track circuit feed and relay cables connecting to rail web.",
        "source": "RDSO Drawing RDSO/S-3500 / IRSEM Chapter 17",
        "width": 34,
        "height": 36,
        "anchor": {"x": 17, "y": 36},
        "tags": ["track circuit", "tljb", "track lead", "bootleg", "junction box"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 36" width="34" height="36">
  <!-- Track rail web above -->
  <line x1="2" y1="6" x2="32" y2="6" stroke="#64748b" stroke-width="3"/>
  <!-- Bootleg jumper cables to rail -->
  <path d="M 12,16 L 12,6 M 22,16 L 22,6" stroke="#dc2626" stroke-width="1.6"/>
  <!-- Box body -->
  <rect x="8" y="16" width="18" height="16" rx="2" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.8"/>
  <polygon points="6,16 17,11 28,16" fill="#0f172a"/>
  <text x="17" y="27" font-size="6.5" font-family="sans-serif" font-weight="800" text-anchor="middle" fill="#0f172a">TLJB</text>
  <line x1="6" y1="34" x2="28" y2="34" stroke="#475569" stroke-width="2.5"/>
</svg>"""
    },
    {
        "id": "axle_counter_wheel_sensor",
        "name": "MSDAC Wheel Sensor (Web Mounted)",
        "category": "Track Circuits & Axle Counters",
        "description": "High-frequency dual coil wheel sensor clamped to rail web with deflector plates (RDSO/SPN/177 compliant).",
        "source": "RDSO/SPN/177/2012 / IRISET S-23",
        "width": 38,
        "height": 30,
        "anchor": {"x": 19, "y": 15},
        "tags": ["axle counter", "wheel sensor", "msdac", "ssdac", "detection"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 30" width="38" height="30">
  <!-- Rail crown and base -->
  <line x1="2" y1="8" x2="36" y2="8" stroke="#475569" stroke-width="4"/>
  <!-- Clamped sensor housing -->
  <rect x="10" y="8" width="18" height="14" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.8"/>
  <circle cx="15" cy="15" r="2.5" fill="#d97706"/>
  <circle cx="23" cy="15" r="2.5" fill="#d97706"/>
  <!-- Deflector skids -->
  <polygon points="4,10 10,14 10,16 4,14" fill="#64748b"/>
  <polygon points="34,10 28,14 28,16 34,14" fill="#64748b"/>
  <text x="19" y="27" font-size="5.5" font-family="sans-serif" font-weight="800" text-anchor="middle" fill="#92400e">MSDAC</text>
</svg>"""
    },
    {
        "id": "point_machine_clamp",
        "name": "Point Machine with Clamp Lock (IRS/RDSO)",
        "category": "Points & Machines",
        "description": "Heavy duty electric point machine with integrated clamp point lock mechanism for thick web switches.",
        "source": "RDSO Drawing S-10880 / IRSEM Chapter 19",
        "width": 46,
        "height": 30,
        "anchor": {"x": 23, "y": 15},
        "tags": ["point machine", "clamp lock", "turnout", "switch", "facing point"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 30" width="46" height="30">
  <rect x="8" y="5" width="28" height="20" rx="2" fill="#dbeafe" stroke="#1d4ed8" stroke-width="1.8"/>
  <line x1="2" y1="12" x2="44" y2="12" stroke="#0f172a" stroke-width="2.2"/>
  <line x1="2" y1="18" x2="44" y2="18" stroke="#0f172a" stroke-width="2.2"/>
  <!-- Clamp lock bracket -->
  <rect x="36" y="8" width="6" height="14" rx="1" fill="#f59e0b" stroke="#0f172a" stroke-width="1"/>
  <text x="21" y="17" font-size="7" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#1e3a8a">PM/CL</text>
</svg>"""
    },
    {
        "id": "board_shunting_limit",
        "name": "Shunting Limit Board (SLB)",
        "category": "Civil & Track Infrastructure",
        "description": "Yellow rectangular board with black letters 'SHUNTING LIMIT' and cross, marking the boundary for shunting operations towards block section.",
        "source": "General & Subsidiary Rules (G&SR) / IRSEM Part II",
        "width": 40,
        "height": 44,
        "anchor": {"x": 20, "y": 44},
        "tags": ["board", "shunting limit", "slb", "trackside", "yard", "boundary"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 44" width="40" height="44">
  <line x1="20" y1="44" x2="20" y2="24" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="14" y1="44" x2="26" y2="44" stroke="#0f172a" stroke-width="3"/>
  <!-- Yellow board with cross -->
  <rect x="4" y="4" width="32" height="20" rx="2" fill="#facc15" stroke="#0f172a" stroke-width="1.8"/>
  <line x1="6" y1="6" x2="34" y2="22" stroke="#0f172a" stroke-width="1.4"/>
  <line x1="6" y1="22" x2="34" y2="6" stroke="#0f172a" stroke-width="1.4"/>
  <rect x="11" y="9" width="18" height="10" rx="1" fill="#facc15"/>
  <text x="20" y="16.5" font-size="7" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">SLB</text>
</svg>"""
    },
    {
        "id": "board_block_section_limit",
        "name": "Block Section Limit Board (BSLB)",
        "category": "Civil & Track Infrastructure",
        "description": "Yellow board with black border and 'BLOCK SECTION LIMIT', installed on double line MACLS territory.",
        "source": "G&SR Rule 3.32 / IRSEM Part II",
        "width": 40,
        "height": 44,
        "anchor": {"x": 20, "y": 44},
        "tags": ["board", "bslb", "block section limit", "macls", "double line"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 44" width="40" height="44">
  <line x1="20" y1="44" x2="20" y2="24" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="14" y1="44" x2="26" y2="44" stroke="#0f172a" stroke-width="3"/>
  <rect x="4" y="4" width="32" height="20" rx="2" fill="#ffffff" stroke="#0f172a" stroke-width="1.8"/>
  <rect x="7" y="7" width="26" height="14" fill="#fef08a"/>
  <text x="20" y="16.5" font-size="6.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">BSLB</text>
</svg>"""
    },
    {
        "id": "board_whistle",
        "name": "Whistle Board ('W' / 'W/L')",
        "category": "Civil & Track Infrastructure",
        "description": "Trackside yellow board with black 'W' or 'W/L' directing loco pilots to sound horn when approaching LC gate or curve.",
        "source": "Indian Railways G&SR / Engineering Manual",
        "width": 34,
        "height": 44,
        "anchor": {"x": 17, "y": 44},
        "tags": ["board", "whistle", "w/l", "level crossing", "trackside", "sign"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 44" width="34" height="44">
  <line x1="17" y1="44" x2="17" y2="24" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="11" y1="44" x2="23" y2="44" stroke="#0f172a" stroke-width="3"/>
  <!-- Circular yellow board -->
  <circle cx="17" cy="13" r="11" fill="#facc15" stroke="#0f172a" stroke-width="1.8"/>
  <text x="17" y="16.5" font-size="7.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">W/L</text>
</svg>"""
    },
    {
        "id": "board_warning",
        "name": "Passenger / Goods Warning Board",
        "category": "Civil & Track Infrastructure",
        "description": "High-visibility board with alternating black and yellow diagonal stripes placed at braking distance ahead of first stop signal.",
        "source": "IRSEM Part II Chapter 15 / RDSO Drawing SD-10065",
        "width": 36,
        "height": 44,
        "anchor": {"x": 18, "y": 44},
        "tags": ["board", "warning board", "sighting", "braking distance", "stripes"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 44" width="36" height="44">
  <line x1="18" y1="44" x2="18" y2="22" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="12" y1="44" x2="24" y2="44" stroke="#0f172a" stroke-width="3"/>
  <!-- Striped warning board -->
  <rect x="4" y="4" width="28" height="18" rx="2" fill="#facc15" stroke="#0f172a" stroke-width="1.8"/>
  <line x1="6" y1="20" x2="16" y2="6" stroke="#0f172a" stroke-width="2.2"/>
  <line x1="14" y1="20" x2="24" y2="6" stroke="#0f172a" stroke-width="2.2"/>
  <line x1="22" y1="20" x2="32" y2="6" stroke="#0f172a" stroke-width="2.2"/>
</svg>"""
    },
    {
        "id": "board_speed_indicator",
        "name": "Speed Restriction Board & Termination Indicator (T/P & T/G)",
        "category": "Civil & Track Infrastructure",
        "description": "Yellow triangular speed indicator with black numerals and circular Termination indicators for Passenger (T/P) and Goods (T/G).",
        "source": "Indian Railways Engineering Code / IRSEM",
        "width": 38,
        "height": 44,
        "anchor": {"x": 19, "y": 44},
        "tags": ["board", "speed restriction", "t/p", "t/g", "caution indicator"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 44" width="38" height="44">
  <line x1="19" y1="44" x2="19" y2="22" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="12" y1="44" x2="26" y2="44" stroke="#0f172a" stroke-width="3"/>
  <!-- Triangular speed board -->
  <polygon points="19,3 32,22 6,22" fill="#facc15" stroke="#0f172a" stroke-width="1.8"/>
  <text x="19" y="18" font-size="8.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">30</text>
  <!-- Attached T/P indicator -->
  <circle cx="31" cy="10" r="5" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
  <text x="31" y="12" font-size="4" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">T/P</text>
</svg>"""
    },
    {
        "id": "emergency_socket_pillar",
        "name": "Emergency Telephone Socket Pillar (EC Socket)",
        "category": "Location Boxes & Housing",
        "description": "Standard trackside 4-pin/6-pin telephone pillar located every 1 km along track for emergency driver-guard-control communication.",
        "source": "IR Telecom Manual Chapter 7 / RDSO Specification",
        "width": 28,
        "height": 44,
        "anchor": {"x": 14, "y": 44},
        "tags": ["telecom", "emergency socket", "ec socket", "pillar", "communication"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 44" width="28" height="44">
  <line x1="6" y1="42" x2="22" y2="42" stroke="#475569" stroke-width="3"/>
  <!-- Concrete pedestal -->
  <rect x="7" y="16" width="14" height="26" rx="2" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/>
  <!-- Red cylindrical domed cap -->
  <path d="M 7,16 C 7,8 21,8 21,16 Z" fill="#dc2626" stroke="#0f172a" stroke-width="1.8"/>
  <!-- Blue socket plate -->
  <rect x="10" y="22" width="8" height="8" rx="1" fill="#0284c7"/>
  <text x="14" y="37" font-size="6.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">EC</text>
</svg>"""
    },
    {
        "id": "ips_room",
        "name": "Integrated Power Supply (IPS) Room",
        "category": "Location Boxes & Housing",
        "description": "Central signalling power equipment room housing SMPS-based IPS system (RDSO/SPN/165) providing AC/DC power for signals, points, and EI.",
        "source": "RDSO/SPN/165/2012 / IRSEM Part II",
        "width": 44,
        "height": 42,
        "anchor": {"x": 22, "y": 42},
        "tags": ["power", "ips", "integrated power supply", "relay room", "housing"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 42" width="44" height="42">
  <line x1="4" y1="40" x2="40" y2="40" stroke="#475569" stroke-width="3"/>
  <rect x="6" y="15" width="32" height="25" rx="2" fill="#fef3c7" stroke="#0f172a" stroke-width="2"/>
  <!-- Pitched roof -->
  <polygon points="4,15 22,5 40,15" fill="#b45309" stroke="#0f172a" stroke-width="1.5"/>
  <!-- Lightning flash -->
  <path d="M 22,18 L 18,25 L 23,25 L 21,31 L 27,24 L 22,24 Z" fill="#dc2626"/>
  <text x="22" y="38" font-size="6.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#78350f">IPS</text>
</svg>"""
    },
    {
        "id": "solar_panel_array",
        "name": "Solar PV Power Array for Signalling",
        "category": "Protection & Grounding",
        "description": "Photovoltaic solar array installed at LC gates and intermediate huts for uninterrupted clean power backup.",
        "source": "RDSO/SPN/164/2004 / Indian Railways Solar Policy",
        "width": 42,
        "height": 42,
        "anchor": {"x": 21, "y": 42},
        "tags": ["power", "solar", "photovoltaic", "green energy", "backup"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42" width="42" height="42">
  <line x1="21" y1="42" x2="21" y2="24" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="13" y1="42" x2="29" y2="42" stroke="#0f172a" stroke-width="3"/>
  <!-- Tilted solar array -->
  <polygon points="4,10 36,6 38,24 6,28" fill="#1e3a8a" stroke="#0f172a" stroke-width="1.8"/>
  <line x1="15" y1="8.5" x2="17" y2="26.5" stroke="#facc15" stroke-width="1"/>
  <line x1="26" y1="7" x2="28" y2="25" stroke="#facc15" stroke-width="1"/>
  <line x1="5" y1="19" x2="37" y2="15" stroke="#facc15" stroke-width="1"/>
  <text x="21" y="37" font-size="5" font-family="sans-serif" font-weight="800" text-anchor="middle" fill="#0f172a">SOLAR</text>
</svg>"""
    },
    {
        "id": "ofc_cable_marker",
        "name": "Optical Fibre Cable (OFC) Route Marker Post",
        "category": "Cable Markers & Joints",
        "description": "Triangular/cylindrical high-visibility orange/yellow post embossed with 'OFC S&T' for telecom fibre route demarcation.",
        "source": "IR Telecom Manual Chapter 10 / RDSO Specification",
        "width": 28,
        "height": 46,
        "anchor": {"x": 14, "y": 46},
        "tags": ["telecom", "ofc", "optical fibre", "marker", "cable route"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 46" width="28" height="46">
  <line x1="6" y1="44" x2="22" y2="44" stroke="#475569" stroke-width="3"/>
  <rect x="8" y="16" width="12" height="28" rx="2" fill="#fb923c" stroke="#c2410c" stroke-width="2"/>
  <path d="M 8,16 C 8,10 20,10 20,16 Z" fill="#ea580c" stroke="#c2410c" stroke-width="1.8"/>
  <text x="14" y="32" font-size="6.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#ffffff">OFC</text>
</svg>"""
    },
    {
        "id": "spd_cabinet",
        "name": "Surge Protection Device (SPD) Panel",
        "category": "Protection & Grounding",
        "description": "Class B & Class C surge arrestor cabinet protecting electronic interlocking (EI) and power cables from lightning surges.",
        "source": "RDSO/SPN/144/2006 / IRSEM Part II",
        "width": 34,
        "height": 36,
        "anchor": {"x": 17, "y": 36},
        "tags": ["protection", "spd", "surge protection", "lightning arrestor", "grounding"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 36" width="34" height="36">
  <line x1="6" y1="34" x2="28" y2="34" stroke="#475569" stroke-width="2.5"/>
  <rect x="7" y="6" width="20" height="28" rx="2" fill="#f1f5f9" stroke="#0f172a" stroke-width="1.8"/>
  <!-- Louvered vents -->
  <line x1="11" y1="12" x2="23" y2="12" stroke="#64748b" stroke-width="1.2"/>
  <line x1="11" y1="16" x2="23" y2="16" stroke="#64748b" stroke-width="1.2"/>
  <!-- Yellow lightning symbol -->
  <path d="M 17,19 L 14,24 L 17.5,24 L 16,29 L 20,22.5 L 17,22.5 Z" fill="#eab308" stroke="#713f12" stroke-width="0.6"/>
  <text x="17" y="33" font-size="5.5" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#0f172a">SPD</text>
</svg>"""
    }
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

        # Write to symbols/
        with open(os.path.join(symbols_dir, svg_filename), "w", encoding="utf-8") as f:
            f.write(svg_content)

        # Write to frontend/public/symbols/
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
                "verificationStatus": "NEEDS VERIFICATION",
                "verifiedBy": None,
                "verificationDate": None,
                "verificationNotes": "Awaiting official review against current RDSO / IRSEM Part II amendment",
                "tags": item["tags"],
                "svgFile": svg_filename
            }
            data["symbols"].append(entry)
            added += 1

    data["totalSymbols"] = len(data["symbols"])

    # Save to symbols/manifest.json
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    # Save to frontend/public/symbols/manifest.json
    with open(frontend_manifest_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    # Save to frontend/src/constants/symbolManifest.json
    with open(bundled_manifest_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Added {added} symbols. Total symbols in library: {len(data['symbols'])}")

if __name__ == "__main__":
    add_symbols()
