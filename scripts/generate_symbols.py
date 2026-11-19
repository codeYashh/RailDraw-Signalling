#!/usr/bin/env python3
"""
Seed generator for Indian Railways S&T Symbol Library.
Generates SVG files and manifest.json compliant with IRSEM Part II and RDSO standards.
"""

import os
import json
import shutil

SYMBOLS = [
    {
        "id": "cls_2aspect",
        "name": "2-Aspect Colour Light Signal",
        "category": "Signals",
        "description": "Two aspect colour light signal (Red/Green) mounted on tubular mast with circular background plate.",
        "source": "IRSEM Part II / RDSO Drawing No. SD-10021",
        "width": 32,
        "height": 48,
        "anchor": {"x": 16, "y": 48},
        "tags": ["signal", "cls", "2-aspect", "running"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" width="32" height="48">
  <line x1="16" y1="48" x2="16" y2="12" stroke="#1e293b" stroke-width="2.5" stroke-linecap="square"/>
  <line x1="8" y1="48" x2="24" y2="48" stroke="#1e293b" stroke-width="3"/>
  <rect x="10" y="4" width="12" height="24" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="16" cy="10" r="3.5" fill="#ef4444" stroke="#ffffff" stroke-width="0.8"/>
  <circle cx="16" cy="22" r="3.5" fill="#10b981" stroke="#ffffff" stroke-width="0.8"/>
  <polygon points="22,10 27,8 27,12" fill="#0f172a"/>
  <polygon points="22,22 27,20 27,24" fill="#0f172a"/>
</svg>"""
    },
    {
        "id": "cls_3aspect",
        "name": "3-Aspect Colour Light Signal",
        "category": "Signals",
        "description": "Three aspect colour light signal (Red/Yellow/Green) for multi-aspect signalling.",
        "source": "IRSEM Part II / RDSO Drawing No. SD-10022",
        "width": 32,
        "height": 56,
        "anchor": {"x": 16, "y": 56},
        "tags": ["signal", "cls", "3-aspect", "mabs"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 56" width="32" height="56">
  <line x1="16" y1="56" x2="16" y2="16" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="8" y1="56" x2="24" y2="56" stroke="#1e293b" stroke-width="3"/>
  <rect x="10" y="4" width="12" height="34" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="16" cy="10" r="3.5" fill="#10b981" stroke="#ffffff" stroke-width="0.8"/>
  <circle cx="16" cy="21" r="3.5" fill="#f59e0b" stroke="#ffffff" stroke-width="0.8"/>
  <circle cx="16" cy="32" r="3.5" fill="#ef4444" stroke="#ffffff" stroke-width="0.8"/>
  <polygon points="22,10 27,8 27,12" fill="#0f172a"/>
  <polygon points="22,21 27,19 27,23" fill="#0f172a"/>
  <polygon points="22,32 27,30 27,34" fill="#0f172a"/>
</svg>"""
    },
    {
        "id": "cls_4aspect",
        "name": "4-Aspect Colour Light Signal",
        "category": "Signals",
        "description": "Four aspect colour light signal (Red/Yellow/Double Yellow/Green) for high density routes.",
        "source": "IRSEM Part II / RDSO Drawing No. SD-10023",
        "width": 34,
        "height": 64,
        "anchor": {"x": 17, "y": 64},
        "tags": ["signal", "cls", "4-aspect", "automatic signalling"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 64" width="34" height="64">
  <line x1="17" y1="64" x2="17" y2="20" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="9" y1="64" x2="25" y2="64" stroke="#1e293b" stroke-width="3"/>
  <rect x="11" y="4" width="12" height="44" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="17" cy="10" r="3.5" fill="#10b981" stroke="#ffffff" stroke-width="0.8"/>
  <circle cx="17" cy="20" r="3.5" fill="#f59e0b" stroke="#ffffff" stroke-width="0.8"/>
  <circle cx="17" cy="30" r="3.5" fill="#ef4444" stroke="#ffffff" stroke-width="0.8"/>
  <circle cx="17" cy="40" r="3.5" fill="#f59e0b" stroke="#ffffff" stroke-width="0.8"/>
</svg>"""
    },
    {
        "id": "signal_semaphore",
        "name": "Semaphore Stop Signal",
        "category": "Signals",
        "description": "Mechanical semaphore stop signal with horizontal square-ended red arm and white stripe.",
        "source": "IRSEM Part II / RDSO S-3286",
        "width": 44,
        "height": 52,
        "anchor": {"x": 16, "y": 52},
        "tags": ["signal", "semaphore", "mechanical"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 52" width="44" height="52">
  <line x1="16" y1="52" x2="16" y2="8" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="8" y1="52" x2="24" y2="52" stroke="#1e293b" stroke-width="3"/>
  <circle cx="16" cy="16" r="3" fill="#0f172a"/>
  <!-- Semaphore Arm -->
  <polygon points="16,13 42,13 42,19 16,19" fill="#ef4444" stroke="#0f172a" stroke-width="1"/>
  <rect x="34" y="13" width="3" height="6" fill="#ffffff"/>
  <!-- Spectacle glasses -->
  <circle cx="12" cy="12" r="3" fill="#ef4444" stroke="#0f172a" stroke-width="1"/>
  <circle cx="12" cy="20" r="3" fill="#10b981" stroke="#0f172a" stroke-width="1"/>
</svg>"""
    },
    {
        "id": "signal_shunt",
        "name": "Shunt Signal (Position Light / Disc)",
        "category": "Signals",
        "description": "Position light shunt signal / disc shunt signal for shunting movements.",
        "source": "IRSEM Part II / RDSO Drawing No. SD-10041",
        "width": 30,
        "height": 36,
        "anchor": {"x": 15, "y": 36},
        "tags": ["signal", "shunt", "yard"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 36" width="30" height="36">
  <line x1="15" y1="36" x2="15" y2="18" stroke="#1e293b" stroke-width="2"/>
  <line x1="9" y1="36" x2="21" y2="36" stroke="#1e293b" stroke-width="2.5"/>
  <circle cx="15" cy="14" r="10" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
  <rect x="5" y="12" width="20" height="4" fill="#ef4444"/>
</svg>"""
    },
    {
        "id": "signal_calling_on",
        "name": "Calling-On Signal",
        "category": "Signals",
        "description": "Calling-on signal mounted beneath a stop signal with prominent circular 'C' marker disc.",
        "source": "IRSEM Part II / RDSO Drawing No. SD-10025",
        "width": 32,
        "height": 40,
        "anchor": {"x": 16, "y": 40},
        "tags": ["signal", "subsidiary", "calling-on"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
  <line x1="16" y1="40" x2="16" y2="24" stroke="#1e293b" stroke-width="2"/>
  <line x1="10" y1="40" x2="22" y2="40" stroke="#1e293b" stroke-width="2.5"/>
  <circle cx="16" cy="16" r="9" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
  <text x="16" y="20.5" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle" fill="#0f172a">C</text>
  <circle cx="16" cy="7" r="3" fill="#f59e0b" stroke="#0f172a" stroke-width="1"/>
</svg>"""
    },
    {
        "id": "signal_repeater",
        "name": "Repeater Signal",
        "category": "Signals",
        "description": "Repeater signal with illuminated letter 'R' marker board indicating aspect of ahead signal.",
        "source": "IRSEM Part II / RDSO Drawing No. SD-10028",
        "width": 32,
        "height": 48,
        "anchor": {"x": 16, "y": 48},
        "tags": ["signal", "repeater", "sighting"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" width="32" height="48">
  <line x1="16" y1="48" x2="16" y2="28" stroke="#1e293b" stroke-width="2"/>
  <line x1="10" y1="48" x2="22" y2="48" stroke="#1e293b" stroke-width="2.5"/>
  <circle cx="16" cy="22" r="8" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
  <text x="16" y="26" font-family="Arial, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" fill="#0f172a">R</text>
  <circle cx="16" cy="8" r="4" fill="#f59e0b" stroke="#0f172a" stroke-width="1.5"/>
</svg>"""
    },
    {
        "id": "signal_home",
        "name": "Home Signal",
        "category": "Signals",
        "description": "First stop signal controlling entry of train into station yard.",
        "source": "IRSEM Part II / RDSO Standard Signalling Plan",
        "width": 32,
        "height": 56,
        "anchor": {"x": 16, "y": 56},
        "tags": ["signal", "home", "first stop"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 56" width="32" height="56">
  <line x1="16" y1="56" x2="16" y2="16" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="8" y1="56" x2="24" y2="56" stroke="#1e293b" stroke-width="3"/>
  <rect x="10" y="4" width="12" height="34" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="16" cy="10" r="3.5" fill="#10b981"/>
  <circle cx="16" cy="21" r="3.5" fill="#f59e0b"/>
  <circle cx="16" cy="32" r="3.5" fill="#ef4444"/>
  <rect x="23" y="16" width="8" height="10" rx="1" fill="#f8fafc" stroke="#0f172a" stroke-width="1"/>
  <text x="27" y="24" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#0f172a">H</text>
</svg>"""
    },
    {
        "id": "signal_starter",
        "name": "Starter Signal",
        "category": "Signals",
        "description": "Station departure signal controlling movement from a line to main line/block section.",
        "source": "IRSEM Part II / RDSO Standard Signalling Plan",
        "width": 32,
        "height": 52,
        "anchor": {"x": 16, "y": 52},
        "tags": ["signal", "starter", "departure"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 52" width="32" height="52">
  <line x1="16" y1="52" x2="16" y2="14" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="8" y1="52" x2="24" y2="52" stroke="#1e293b" stroke-width="3"/>
  <rect x="10" y="4" width="12" height="26" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="16" cy="10" r="3.5" fill="#10b981"/>
  <circle cx="16" cy="23" r="3.5" fill="#ef4444"/>
  <rect x="23" y="14" width="8" height="10" rx="1" fill="#f8fafc" stroke="#0f172a" stroke-width="1"/>
  <text x="27" y="22" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#0f172a">S</text>
</svg>"""
    },
    {
        "id": "signal_advance_starter",
        "name": "Advance Starter Signal",
        "category": "Signals",
        "description": "Last stop signal controlling entry into the absolute block section.",
        "source": "IRSEM Part II / RDSO Standard Signalling Plan",
        "width": 36,
        "height": 52,
        "anchor": {"x": 16, "y": 52},
        "tags": ["signal", "advance starter", "last stop"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 52" width="36" height="52">
  <line x1="16" y1="52" x2="16" y2="14" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="8" y1="52" x2="24" y2="52" stroke="#1e293b" stroke-width="3"/>
  <rect x="10" y="4" width="12" height="26" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="16" cy="10" r="3.5" fill="#10b981"/>
  <circle cx="16" cy="23" r="3.5" fill="#ef4444"/>
  <rect x="23" y="12" width="12" height="10" rx="1" fill="#f8fafc" stroke="#0f172a" stroke-width="1"/>
  <text x="29" y="20" font-family="Arial, sans-serif" font-size="7" font-weight="bold" text-anchor="middle" fill="#0f172a">AS</text>
</svg>"""
    },
    {
        "id": "signal_outer",
        "name": "Outer Signal",
        "category": "Signals",
        "description": "Outer stop signal in two-aspect territory, placed at adequate braking distance from home.",
        "source": "IRSEM Part II / RDSO Signalling Rules",
        "width": 32,
        "height": 50,
        "anchor": {"x": 16, "y": 50},
        "tags": ["signal", "outer", "two-aspect"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 50" width="32" height="50">
  <line x1="16" y1="50" x2="16" y2="14" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="8" y1="50" x2="24" y2="50" stroke="#1e293b" stroke-width="3"/>
  <rect x="10" y="4" width="12" height="24" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="16" cy="10" r="3.5" fill="#10b981"/>
  <circle cx="16" cy="22" r="3.5" fill="#ef4444"/>
  <rect x="23" y="12" width="8" height="10" rx="1" fill="#f8fafc" stroke="#0f172a" stroke-width="1"/>
  <text x="27" y="20" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#0f172a">O</text>
</svg>"""
    },
    {
        "id": "signal_distant",
        "name": "Distant Signal",
        "category": "Signals",
        "description": "Permissive signal with circular 'P' marker board indicating aspect of first stop signal.",
        "source": "IRSEM Part II / RDSO Drawing No. SD-10024",
        "width": 34,
        "height": 56,
        "anchor": {"x": 17, "y": 56},
        "tags": ["signal", "distant", "permissive", "p-marker"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 56" width="34" height="56">
  <line x1="17" y1="56" x2="17" y2="16" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="9" y1="56" x2="25" y2="56" stroke="#1e293b" stroke-width="3"/>
  <rect x="11" y="4" width="12" height="34" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="17" cy="10" r="3.5" fill="#10b981"/>
  <circle cx="17" cy="21" r="3.5" fill="#f59e0b"/>
  <circle cx="17" cy="32" r="3.5" fill="#f59e0b"/>
  <!-- P Marker disc -->
  <circle cx="17" cy="45" r="5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
  <text x="17" y="48" font-family="Arial, sans-serif" font-size="7" font-weight="bold" text-anchor="middle" fill="#0f172a">P</text>
</svg>"""
    },
    {
        "id": "signal_ibs",
        "name": "Intermediate Block Signal (IBS)",
        "category": "Signals",
        "description": "Intermediate block stop signal with circular 'IB' marker disc dividing long block section.",
        "source": "IRSEM Part II / RDSO Drawing No. SD-10029",
        "width": 34,
        "height": 56,
        "anchor": {"x": 17, "y": 56},
        "tags": ["signal", "ibs", "intermediate block"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 56" width="34" height="56">
  <line x1="17" y1="56" x2="17" y2="16" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="9" y1="56" x2="25" y2="56" stroke="#1e293b" stroke-width="3"/>
  <rect x="11" y="4" width="12" height="34" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="17" cy="10" r="3.5" fill="#10b981"/>
  <circle cx="17" cy="21" r="3.5" fill="#f59e0b"/>
  <circle cx="17" cy="32" r="3.5" fill="#ef4444"/>
  <!-- IB Marker disc -->
  <circle cx="17" cy="45" r="5.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
  <text x="17" y="48" font-family="Arial, sans-serif" font-size="6.5" font-weight="bold" text-anchor="middle" fill="#0f172a">IB</text>
</svg>"""
    },
    {
        "id": "signal_gate",
        "name": "Gate Signal",
        "category": "Signals",
        "description": "Level crossing interlocked gate stop signal with circular 'G' marker disc.",
        "source": "IRSEM Part II / RDSO Drawing No. SD-10027",
        "width": 34,
        "height": 56,
        "anchor": {"x": 17, "y": 56},
        "tags": ["signal", "gate", "level crossing", "g-marker"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 56" width="34" height="56">
  <line x1="17" y1="56" x2="17" y2="16" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="9" y1="56" x2="25" y2="56" stroke="#1e293b" stroke-width="3"/>
  <rect x="11" y="4" width="12" height="34" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="17" cy="10" r="3.5" fill="#10b981"/>
  <circle cx="17" cy="21" r="3.5" fill="#f59e0b"/>
  <circle cx="17" cy="32" r="3.5" fill="#ef4444"/>
  <!-- G Marker disc -->
  <circle cx="17" cy="45" r="5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
  <text x="17" y="48" font-family="Arial, sans-serif" font-size="7" font-weight="bold" text-anchor="middle" fill="#0f172a">G</text>
</svg>"""
    },
    {
        "id": "point_machine",
        "name": "Point Machine (Electric)",
        "category": "Points & Machines",
        "description": "Electrically operated point machine with throw rod, detection rod, and lock rod connections.",
        "source": "IRSEM Part II / RDSO Drawing No. S-10880",
        "width": 40,
        "height": 32,
        "anchor": {"x": 20, "y": 16},
        "tags": ["point", "machine", "interlocking", "turnout"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 32" width="40" height="32">
  <rect x="6" y="8" width="28" height="16" rx="2" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
  <rect x="10" y="11" width="20" height="10" fill="#94a3b8"/>
  <line x1="2" y1="16" x2="6" y2="16" stroke="#0f172a" stroke-width="3"/>
  <line x1="34" y1="16" x2="38" y2="16" stroke="#0f172a" stroke-width="3"/>
  <circle cx="20" cy="16" r="3" fill="#0f172a"/>
  <text x="20" y="28" font-family="Arial, sans-serif" font-size="6" font-weight="bold" text-anchor="middle" fill="#0f172a">PM</text>
</svg>"""
    },
    {
        "id": "point_turnout",
        "name": "Point Switch / Turnout",
        "category": "Points & Machines",
        "description": "1 in 8.5 / 1 in 12 single turnout point with curved diverging switch rail.",
        "source": "IRSEM Part II / Track Signalling Plan",
        "width": 54,
        "height": 28,
        "anchor": {"x": 10, "y": 20},
        "tags": ["track", "point", "turnout", "switch"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 28" width="54" height="28">
  <line x1="2" y1="20" x2="52" y2="20" stroke="#0f172a" stroke-width="2.5"/>
  <path d="M 12 20 Q 30 18 50 6" fill="none" stroke="#0f172a" stroke-width="2.5"/>
  <circle cx="12" cy="20" r="3" fill="#ef4444"/>
  <line x1="16" y1="12" x2="16" y2="24" stroke="#0f172a" stroke-width="1.5" stroke-dasharray="2,2"/>
</svg>"""
    },
    {
        "id": "derailing_switch",
        "name": "Derailing Switch (Trap)",
        "category": "Points & Machines",
        "description": "Derailing switch / trap switch provided on sidings to isolate running lines.",
        "source": "IRSEM Part II / RDSO Standard Signalling Plan",
        "width": 44,
        "height": 28,
        "anchor": {"x": 22, "y": 14},
        "tags": ["point", "trap", "derail", "safety"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 28" width="44" height="28">
  <line x1="2" y1="14" x2="42" y2="14" stroke="#0f172a" stroke-width="2"/>
  <line x1="14" y1="14" x2="28" y2="6" stroke="#ef4444" stroke-width="3"/>
  <circle cx="14" cy="14" r="2.5" fill="#0f172a"/>
  <text x="22" y="24" font-family="Arial, sans-serif" font-size="6.5" font-weight="bold" text-anchor="middle" fill="#0f172a">DS</text>
</svg>"""
    },
    {
        "id": "crossing_diamond",
        "name": "Diamond Crossing",
        "category": "Points & Machines",
        "description": "Diamond crossing intersection of two railway tracks without slips.",
        "source": "IRSEM Part II / Track Standards",
        "width": 40,
        "height": 40,
        "anchor": {"x": 20, "y": 20},
        "tags": ["crossing", "diamond", "track"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <line x1="4" y1="4" x2="36" y2="36" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="4" y1="36" x2="36" y2="4" stroke="#0f172a" stroke-width="2.5"/>
  <circle cx="20" cy="20" r="3.5" fill="none" stroke="#ef4444" stroke-width="1.5"/>
</svg>"""
    },
    {
        "id": "track_circuit_boundary",
        "name": "Track Circuit Boundary (GJ)",
        "category": "Track Circuits & Axle Counters",
        "description": "Glued insulated rail joint (GJ) / block joint separating adjacent DC/audio-frequency track circuits.",
        "source": "IRSEM Part II / RDSO Drawing No. S-22101",
        "width": 24,
        "height": 36,
        "anchor": {"x": 12, "y": 18},
        "tags": ["track circuit", "glued joint", "insulated rail joint"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
  <line x1="2" y1="18" x2="22" y2="18" stroke="#64748b" stroke-width="3"/>
  <!-- Double insulated rail joint indicator -->
  <line x1="10" y1="6" x2="10" y2="30" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="14" y1="6" x2="14" y2="30" stroke="#ef4444" stroke-width="2.5"/>
  <text x="12" y="34" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">TC</text>
</svg>"""
    },
    {
        "id": "axle_counter",
        "name": "Axle Counter Track Device",
        "category": "Track Circuits & Axle Counters",
        "description": "SSDAC / MSDAC high frequency track device (Tx/Rx heads) clamped to web of rail.",
        "source": "IRSEM Part II / RDSO/SPN/177",
        "width": 36,
        "height": 32,
        "anchor": {"x": 18, "y": 16},
        "tags": ["axle counter", "track device", "detection"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 32" width="36" height="32">
  <line x1="2" y1="16" x2="34" y2="16" stroke="#475569" stroke-width="2.5"/>
  <rect x="8" y="10" width="8" height="12" rx="1" fill="#f59e0b" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="20" y="10" width="8" height="12" rx="1" fill="#10b981" stroke="#0f172a" stroke-width="1.5"/>
  <text x="18" y="28" font-family="Arial, sans-serif" font-size="6" font-weight="bold" text-anchor="middle" fill="#0f172a">AXLE CT</text>
</svg>"""
    },
    {
        "id": "level_crossing_interlocked",
        "name": "Level Crossing Gate (Interlocked)",
        "category": "Level Crossings",
        "description": "Manned interlocked level crossing gate with electrically/mechanically operated lifting barriers.",
        "source": "IRSEM Part II / RDSO Drawing No. SD-10060",
        "width": 48,
        "height": 40,
        "anchor": {"x": 24, "y": 20},
        "tags": ["level crossing", "lc gate", "barrier", "interlocked"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 40" width="48" height="40">
  <!-- Track -->
  <line x1="4" y1="20" x2="44" y2="20" stroke="#0f172a" stroke-width="2.5"/>
  <!-- Road crossing -->
  <line x1="16" y1="4" x2="16" y2="36" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2"/>
  <line x1="32" y1="4" x2="32" y2="36" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2"/>
  <!-- Gate Booms -->
  <line x1="8" y1="14" x2="24" y2="14" stroke="#ef4444" stroke-width="3"/>
  <line x1="24" y1="26" x2="40" y2="26" stroke="#ef4444" stroke-width="3"/>
  <circle cx="8" cy="14" r="2.5" fill="#0f172a"/>
  <circle cx="40" cy="26" r="2.5" fill="#0f172a"/>
  <text x="24" y="38" font-family="Arial, sans-serif" font-size="6" font-weight="bold" text-anchor="middle" fill="#0f172a">LC GATE</text>
</svg>"""
    },
    {
        "id": "level_crossing_unmanned",
        "name": "Level Crossing (Unmanned)",
        "category": "Level Crossings",
        "description": "Unmanned level crossing warning mark on track signalling plan.",
        "source": "IRSEM Part II / RDSO Signalling Plan",
        "width": 36,
        "height": 36,
        "anchor": {"x": 18, "y": 18},
        "tags": ["level crossing", "unmanned"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <line x1="2" y1="18" x2="34" y2="18" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="10" y1="6" x2="26" y2="30" stroke="#ef4444" stroke-width="2"/>
  <line x1="10" y1="30" x2="26" y2="6" stroke="#ef4444" stroke-width="2"/>
  <text x="18" y="34" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">UMLC</text>
</svg>"""
    },
    {
        "id": "location_box_single",
        "name": "Location Box (Single Apparatus Case)",
        "category": "Location Boxes & Housing",
        "description": "Single apparatus case location box for trackside relays, batteries, transformers and cable terminations.",
        "source": "IRSEM Part II / RDSO Drawing No. S-11500",
        "width": 36,
        "height": 36,
        "anchor": {"x": 18, "y": 36},
        "tags": ["location box", "apparatus case", "cable", "l1", "l12"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <!-- Concrete Base -->
  <rect x="6" y="30" width="24" height="6" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.5"/>
  <!-- Apparatus Case Cabinet -->
  <rect x="8" y="8" width="20" height="22" rx="1" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
  <!-- Pitched roof canopy -->
  <polygon points="6,8 18,2 30,8" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
  <!-- Center division & handle -->
  <line x1="18" y1="8" x2="18" y2="30" stroke="#0f172a" stroke-width="1"/>
  <circle cx="16" cy="19" r="1" fill="#0f172a"/>
  <circle cx="20" cy="19" r="1" fill="#0f172a"/>
  <text x="18" y="27" font-family="Arial, sans-serif" font-size="5.5" font-weight="bold" text-anchor="middle" fill="#0f172a">LOC</text>
</svg>"""
    },
    {
        "id": "location_box_double",
        "name": "Location Box (Half / Double Apparatus Case)",
        "category": "Location Boxes & Housing",
        "description": "Double apparatus case location box for multi-cable terminations and auto signalling sections.",
        "source": "IRSEM Part II / RDSO Drawing No. S-11501",
        "width": 48,
        "height": 36,
        "anchor": {"x": 24, "y": 36},
        "tags": ["location box", "double apparatus case", "relay"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 36" width="48" height="36">
  <rect x="6" y="30" width="36" height="6" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="8" y="8" width="32" height="22" rx="1" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
  <polygon points="6,8 24,2 42,8" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="24" y1="8" x2="24" y2="30" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="16" y1="8" x2="16" y2="30" stroke="#0f172a" stroke-width="1" stroke-dasharray="2,2"/>
  <line x1="32" y1="8" x2="32" y2="30" stroke="#0f172a" stroke-width="1" stroke-dasharray="2,2"/>
  <text x="24" y="26" font-family="Arial, sans-serif" font-size="6" font-weight="bold" text-anchor="middle" fill="#0f172a">DBL LOC</text>
</svg>"""
    },
    {
        "id": "junction_box",
        "name": "Junction Box",
        "category": "Location Boxes & Housing",
        "description": "Weatherproof trackside junction box for cable branching and disconnection.",
        "source": "IRSEM Part II / RDSO S-11505",
        "width": 28,
        "height": 28,
        "anchor": {"x": 14, "y": 28},
        "tags": ["junction box", "cable branching", "jb"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
  <rect x="4" y="4" width="20" height="20" rx="2" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
  <circle cx="14" cy="14" r="5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="9" y1="14" x2="19" y2="14" stroke="#ef4444" stroke-width="1.5"/>
  <line x1="14" y1="9" x2="14" y2="19" stroke="#ef4444" stroke-width="1.5"/>
  <text x="14" y="27" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">JB</text>
</svg>"""
    },
    {
        "id": "cable_termination_box",
        "name": "Cable Termination Box (CTB)",
        "category": "Location Boxes & Housing",
        "description": "Cable termination box with disconnection links and WAGO/fuse terminals.",
        "source": "IRSEM Part II / RDSO S-11508",
        "width": 32,
        "height": 32,
        "anchor": {"x": 16, "y": 32},
        "tags": ["ctb", "cable termination", "rack"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect x="4" y="4" width="24" height="24" rx="2" fill="#f1f5f9" stroke="#0f172a" stroke-width="2"/>
  <line x1="8" y1="10" x2="24" y2="10" stroke="#0f172a" stroke-width="1"/>
  <line x1="8" y1="16" x2="24" y2="16" stroke="#0f172a" stroke-width="1"/>
  <line x1="8" y1="22" x2="24" y2="22" stroke="#0f172a" stroke-width="1"/>
  <text x="16" y="28" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">CTB</text>
</svg>"""
    },
    {
        "id": "relay_hut",
        "name": "Relay Hut",
        "category": "Location Boxes & Housing",
        "description": "Pre-fabricated / brick relay hut for housing vital electronic interlocking and auto-section equipment.",
        "source": "IRSEM Part II / RDSO Standard Relay Hut",
        "width": 44,
        "height": 38,
        "anchor": {"x": 22, "y": 38},
        "tags": ["relay hut", "auto section", "interlocking", "housing"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 38" width="44" height="38">
  <polygon points="4,12 22,2 40,12" fill="#475569" stroke="#0f172a" stroke-width="2"/>
  <rect x="6" y="12" width="32" height="24" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
  <rect x="18" y="20" width="8" height="16" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="24" cy="28" r="1" fill="#0f172a"/>
  <text x="22" y="17" font-family="Arial, sans-serif" font-size="5.5" font-weight="bold" text-anchor="middle" fill="#0f172a">RELAY HUT</text>
</svg>"""
    },
    {
        "id": "relay_room",
        "name": "Station Relay Room",
        "category": "Location Boxes & Housing",
        "description": "Station building relay room housing Q-series relays, EI racks and data logger.",
        "source": "IRSEM Part II / Railway Standards",
        "width": 48,
        "height": 40,
        "anchor": {"x": 24, "y": 40},
        "tags": ["relay room", "ei", "station"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 40" width="48" height="40">
  <rect x="4" y="6" width="40" height="32" rx="2" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
  <line x1="4" y1="14" x2="44" y2="14" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="10" y="20" width="8" height="18" fill="#e2e8f0" stroke="#0f172a" stroke-width="1"/>
  <rect x="30" y="20" width="8" height="18" fill="#e2e8f0" stroke="#0f172a" stroke-width="1"/>
  <text x="24" y="12" font-family="Arial, sans-serif" font-size="6" font-weight="bold" text-anchor="middle" fill="#0f172a">RELAY ROOM</text>
</svg>"""
    },
    {
        "id": "signal_cabin",
        "name": "Signal Cabin",
        "category": "Location Boxes & Housing",
        "description": "Elevated / ground signal cabin with operating panel and visual yard oversight.",
        "source": "IRSEM Part II / RDSO Signalling Plan",
        "width": 46,
        "height": 44,
        "anchor": {"x": 23, "y": 44},
        "tags": ["signal cabin", "tower", "station master"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 44" width="46" height="44">
  <polygon points="4,14 23,4 42,14" fill="#334155" stroke="#0f172a" stroke-width="2"/>
  <rect x="6" y="14" width="34" height="28" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
  <rect x="10" y="18" width="26" height="10" rx="1" fill="#93c5fd" stroke="#0f172a" stroke-width="1.5"/>
  <text x="23" y="36" font-family="Arial, sans-serif" font-size="6" font-weight="bold" text-anchor="middle" fill="#0f172a">CABIN</text>
</svg>"""
    },
    {
        "id": "station_building",
        "name": "Station Building",
        "category": "Location Boxes & Housing",
        "description": "Main railway station passenger and operational building.",
        "source": "IRSEM Part II / IR Architecture",
        "width": 54,
        "height": 38,
        "anchor": {"x": 27, "y": 38},
        "tags": ["station", "building", "sm office"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 38" width="54" height="38">
  <rect x="4" y="12" width="46" height="24" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
  <polygon points="2,12 27,2 52,12" fill="#475569" stroke="#0f172a" stroke-width="2"/>
  <rect x="22" y="22" width="10" height="14" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.5"/>
  <text x="27" y="18" font-family="Arial, sans-serif" font-size="6" font-weight="bold" text-anchor="middle" fill="#0f172a">STATION</text>
</svg>"""
    },
    {
        "id": "cable_marker_route",
        "name": "Cable Route Marker Post",
        "category": "Cable Markers & Joints",
        "description": "Reinforced concrete cable route marker post planted along cable trench at every 50m.",
        "source": "IRSEM Para 15.11 / RDSO Drawing No. SD-10080",
        "width": 26,
        "height": 40,
        "anchor": {"x": 13, "y": 40},
        "tags": ["marker", "cable route", "concrete post"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 40" width="26" height="40">
  <line x1="4" y1="40" x2="22" y2="40" stroke="#0f172a" stroke-width="2"/>
  <!-- Tapered concrete post -->
  <polygon points="6,40 20,40 18,10 8,10" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
  <polygon points="8,10 13,4 18,10" fill="#94a3b8" stroke="#0f172a" stroke-width="1.5"/>
  <!-- Directional arrow -->
  <line x1="9" y1="22" x2="17" y2="22" stroke="#ef4444" stroke-width="2"/>
  <polygon points="17,20 20,22 17,24" fill="#ef4444"/>
  <text x="13" y="32" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">CRM</text>
</svg>"""
    },
    {
        "id": "cable_marker_joint",
        "name": "Cable Joint Marker Post",
        "category": "Cable Markers & Joints",
        "description": "Post indicating exact location of straight-through cable thermo-shrink joint in ground.",
        "source": "IRSEM Para 15.11 / RDSO Drawing No. SD-10081",
        "width": 26,
        "height": 40,
        "anchor": {"x": 13, "y": 40},
        "tags": ["marker", "joint", "cable joint", "splice"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 40" width="26" height="40">
  <line x1="4" y1="40" x2="22" y2="40" stroke="#0f172a" stroke-width="2"/>
  <polygon points="6,40 20,40 18,10 8,10" fill="#fef3c7" stroke="#0f172a" stroke-width="2"/>
  <polygon points="8,10 13,4 18,10" fill="#f59e0b" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="13" cy="20" r="3.5" fill="#ef4444"/>
  <text x="13" y="32" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">CJM</text>
</svg>"""
    },
    {
        "id": "cable_marker_track_crossing",
        "name": "Track Crossing Cable Marker",
        "category": "Cable Markers & Joints",
        "description": "Marker on both sides of track crossing indicating GI/RCC pipe sleeve location.",
        "source": "IRSEM Para 15.11 / RDSO Drawing No. SD-10082",
        "width": 28,
        "height": 40,
        "anchor": {"x": 14, "y": 40},
        "tags": ["marker", "track crossing", "pipe"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" width="28" height="40">
  <line x1="4" y1="40" x2="24" y2="40" stroke="#0f172a" stroke-width="2"/>
  <polygon points="7,40 21,40 19,10 9,10" fill="#e0f2fe" stroke="#0f172a" stroke-width="2"/>
  <polygon points="9,10 14,4 19,10" fill="#0284c7" stroke="#0f172a" stroke-width="1.5"/>
  <!-- Rail track cross icon -->
  <line x1="10" y1="18" x2="18" y2="18" stroke="#0f172a" stroke-width="2"/>
  <line x1="12" y1="16" x2="12" y2="20" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="16" y1="16" x2="16" y2="20" stroke="#0f172a" stroke-width="1.5"/>
  <text x="14" y="32" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">TCM</text>
</svg>"""
    },
    {
        "id": "cable_termination",
        "name": "Cable Termination Point",
        "category": "Cable Markers & Joints",
        "description": "Point where main outdoor cable pothead or termination is made.",
        "source": "IRSEM Chapter 15 / S&T Practice",
        "width": 24,
        "height": 24,
        "anchor": {"x": 12, "y": 12},
        "tags": ["termination", "cable pothead"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="9" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
  <circle cx="12" cy="12" r="4" fill="#0f172a"/>
  <line x1="3" y1="12" x2="21" y2="12" stroke="#0f172a" stroke-width="1.5"/>
</svg>"""
    },
    {
        "id": "earth_pit",
        "name": "Earth Pit (Maintenance-Free)",
        "category": "Protection & Grounding",
        "description": "Maintenance-free copper-bonded earth electrode with test link chamber for signalling equipment.",
        "source": "IRSEM Chapter 19 / RDSO/SPN/197",
        "width": 32,
        "height": 36,
        "anchor": {"x": 16, "y": 36},
        "tags": ["earth pit", "grounding", "protection"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 36" width="32" height="36">
  <circle cx="16" cy="14" r="10" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
  <line x1="16" y1="24" x2="16" y2="34" stroke="#0f172a" stroke-width="2"/>
  <!-- Earth Symbol -->
  <line x1="9" y1="10" x2="23" y2="10" stroke="#16a34a" stroke-width="2"/>
  <line x1="11" y1="14" x2="21" y2="14" stroke="#16a34a" stroke-width="2"/>
  <line x1="13" y1="18" x2="19" y2="18" stroke="#16a34a" stroke-width="2"/>
  <text x="16" y="6" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">EARTH</text>
</svg>"""
    },
    {
        "id": "lightning_arrestor",
        "name": "Lightning Arrestor / SPD",
        "category": "Protection & Grounding",
        "description": "Class B & C Surge Protection Device for signalling transmission lines.",
        "source": "IRSEM Chapter 19 / RDSO Guidelines",
        "width": 28,
        "height": 36,
        "anchor": {"x": 14, "y": 36},
        "tags": ["spd", "surge", "lightning"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36" width="28" height="36">
  <line x1="14" y1="2" x2="14" y2="10" stroke="#0f172a" stroke-width="2"/>
  <polygon points="14,10 8,20 15,20 12,30 20,18 14,18" fill="#eab308" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="14" y1="30" x2="14" y2="36" stroke="#0f172a" stroke-width="2"/>
</svg>"""
    },
    {
        "id": "block_instrument",
        "name": "Block Instrument",
        "category": "Civil & Track Infrastructure",
        "description": "Double line lock & block instrument / Daido tokenless block instrument.",
        "source": "IRSEM Part II / RDSO S-10090",
        "width": 36,
        "height": 36,
        "anchor": {"x": 18, "y": 36},
        "tags": ["block", "instrument", "tokenless"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <rect x="6" y="6" width="24" height="26" rx="2" fill="#334155" stroke="#0f172a" stroke-width="2"/>
  <circle cx="18" cy="14" r="5" fill="#f8fafc" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="18" cy="24" r="3" fill="#f59e0b"/>
  <text x="18" y="35" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">BLOCK</text>
</svg>"""
    },
    {
        "id": "train_indicator",
        "name": "Train Indicator (TDI)",
        "category": "Civil & Track Infrastructure",
        "description": "Track occupancy / train arrival direction indicator for cabins.",
        "source": "IRSEM Part II / Signalling Standards",
        "width": 32,
        "height": 32,
        "anchor": {"x": 16, "y": 16},
        "tags": ["indicator", "tdi"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <circle cx="16" cy="16" r="12" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
  <polygon points="10,16 22,10 22,22" fill="#ef4444"/>
  <text x="16" y="30" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">TDI</text>
</svg>"""
    },
    {
        "id": "platform",
        "name": "Passenger Platform Edge",
        "category": "Civil & Track Infrastructure",
        "description": "High level passenger platform edge along track.",
        "source": "IR Engineering Code / Drawing Standards",
        "width": 50,
        "height": 24,
        "anchor": {"x": 25, "y": 20},
        "tags": ["platform", "station", "civil"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 24" width="50" height="24">
  <rect x="4" y="4" width="42" height="12" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
  <line x1="4" y1="16" x2="46" y2="16" stroke="#0f172a" stroke-width="3"/>
  <text x="25" y="12" font-family="Arial, sans-serif" font-size="6" font-weight="bold" text-anchor="middle" fill="#0f172a">PLATFORM</text>
</svg>"""
    },
    {
        "id": "bridge",
        "name": "Railway Bridge",
        "category": "Civil & Track Infrastructure",
        "description": "Steel girder / RCC bridge crossing river, nallah or road.",
        "source": "IR Bridge Manual / Drawing Conventions",
        "width": 56,
        "height": 32,
        "anchor": {"x": 28, "y": 16},
        "tags": ["bridge", "structure", "girder"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 32" width="56" height="32">
  <line x1="2" y1="16" x2="54" y2="16" stroke="#0f172a" stroke-width="3"/>
  <polygon points="10,8 10,24 16,16" fill="#64748b"/>
  <polygon points="46,8 46,24 40,16" fill="#64748b"/>
  <line x1="12" y1="6" x2="44" y2="6" stroke="#0f172a" stroke-width="2"/>
  <line x1="12" y1="26" x2="44" y2="26" stroke="#0f172a" stroke-width="2"/>
  <text x="28" y="22" font-family="Arial, sans-serif" font-size="6" font-weight="bold" text-anchor="middle" fill="#0f172a">BRIDGE</text>
</svg>"""
    },
    {
        "id": "culvert",
        "name": "Culvert Crossing",
        "category": "Civil & Track Infrastructure",
        "description": "Pipe or slab culvert under railway embankment.",
        "source": "IR Bridge Manual / RDSO S-10075",
        "width": 44,
        "height": 28,
        "anchor": {"x": 22, "y": 14},
        "tags": ["culvert", "drainage", "pipe"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 28" width="44" height="28">
  <line x1="2" y1="14" x2="42" y2="14" stroke="#0f172a" stroke-width="2.5"/>
  <rect x="14" y="6" width="16" height="16" rx="2" fill="#cbd5e1" stroke="#0f172a" stroke-width="2"/>
  <circle cx="22" cy="14" r="5" fill="#f8fafc" stroke="#0f172a" stroke-width="1.5"/>
  <text x="22" y="27" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">CULVERT</text>
</svg>"""
    },
    {
        "id": "km_post",
        "name": "Kilometre Post",
        "category": "Civil & Track Infrastructure",
        "description": "Trackside kilometre post indicating railway route chainage.",
        "source": "IR Permanent Way Manual",
        "width": 24,
        "height": 38,
        "anchor": {"x": 12, "y": 38},
        "tags": ["km post", "chainage", "marker"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 38" width="24" height="38">
  <line x1="4" y1="38" x2="20" y2="38" stroke="#0f172a" stroke-width="2"/>
  <rect x="6" y="8" width="12" height="30" rx="1" fill="#f8fafc" stroke="#0f172a" stroke-width="1.5"/>
  <path d="M 6 8 Q 12 2 18 8 Z" fill="#eab308" stroke="#0f172a" stroke-width="1.5"/>
  <text x="12" y="20" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">KM</text>
  <text x="12" y="28" font-family="Arial, sans-serif" font-size="5.5" font-weight="bold" text-anchor="middle" fill="#0f172a">124</text>
</svg>"""
    },
    {
        "id": "sighting_board",
        "name": "Signal Sighting Board",
        "category": "Signals",
        "description": "Passenger / Goods warning board placed at 1000m before first stop signal.",
        "source": "IRSEM Part II / RDSO SD-10035",
        "width": 36,
        "height": 42,
        "anchor": {"x": 18, "y": 42},
        "tags": ["sighting board", "warning", "board"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 42" width="36" height="42">
  <line x1="18" y1="42" x2="18" y2="18" stroke="#0f172a" stroke-width="2"/>
  <rect x="4" y="6" width="28" height="14" rx="1" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
  <line x1="4" y1="6" x2="18" y2="20" stroke="#0f172a" stroke-width="2"/>
  <line x1="18" y1="6" x2="32" y2="20" stroke="#0f172a" stroke-width="2"/>
  <circle cx="18" cy="13" r="3" fill="#eab308"/>
</svg>"""
    },
    {
        "id": "sand_hump",
        "name": "Sand Hump",
        "category": "Points & Machines",
        "description": "Safety siding terminating in a mound of sand to stop runaway vehicles.",
        "source": "IRSEM Part II / RDSO Signalling Plan",
        "width": 46,
        "height": 26,
        "anchor": {"x": 8, "y": 18},
        "tags": ["sand hump", "overrun", "safety siding"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 26" width="46" height="26">
  <line x1="4" y1="18" x2="26" y2="18" stroke="#0f172a" stroke-width="2.5"/>
  <path d="M 26 18 Q 34 8 42 18 Z" fill="#fde047" stroke="#0f172a" stroke-width="2"/>
  <line x1="28" y1="18" x2="40" y2="18" stroke="#0f172a" stroke-width="2"/>
  <text x="34" y="24" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#0f172a">SAND</text>
</svg>"""
    },
    {
        "id": "buffer_stop",
        "name": "Buffer Stop",
        "category": "Civil & Track Infrastructure",
        "description": "Track buffer stop / friction buffer at dead end of track.",
        "source": "IRSEM Part II / RDSO Drawing No. S-10098",
        "width": 34,
        "height": 30,
        "anchor": {"x": 17, "y": 20},
        "tags": ["buffer stop", "dead end", "terminal"],
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 30" width="34" height="30">
  <line x1="2" y1="20" x2="24" y2="20" stroke="#0f172a" stroke-width="2.5"/>
  <rect x="24" y="8" width="6" height="20" rx="1" fill="#ef4444" stroke="#0f172a" stroke-width="2"/>
  <polygon points="16,20 24,10 24,20" fill="#94a3b8" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="27" cy="18" r="1.5" fill="#ffffff"/>
</svg>"""
    }
]

def generate():
    symbols_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "symbols"))
    frontend_symbols_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "symbols"))
    
    os.makedirs(symbols_dir, exist_ok=True)
    os.makedirs(frontend_symbols_dir, exist_ok=True)

    manifest_entries = []

    for item in SYMBOLS:
        svg_filename = f"{item['id']}.svg"
        svg_path = os.path.join(symbols_dir, svg_filename)
        
        # Write SVG
        with open(svg_path, "w", encoding="utf-8") as f:
            f.write(item["svg"].strip() + "\n")
        
        # Copy to frontend public
        shutil.copy(svg_path, os.path.join(frontend_symbols_dir, svg_filename))

        # Add manifest entry with verification status
        manifest_entries.append({
            "id": item["id"],
            "name": item["name"],
            "category": item["category"],
            "description": item["description"],
            "sourceReference": item["source"],
            "defaultSize": {"width": item["width"], "height": item["height"]},
            "anchorPoint": item["anchor"],
            "version": "1.0.0",
            "verificationStatus": "NEEDS VERIFICATION",  # As per acceptance criteria!
            "verifiedBy": None,
            "verificationDate": None,
            "verificationNotes": "Awaiting official review against current RDSO / IRSEM Part II amendment",
            "tags": item["tags"],
            "svgFile": svg_filename
        })

    # Save manifest.json
    manifest_data = {
        "standard": "Indian Railways Signal Engineering Manual (IRSEM) & RDSO Standard S&T Symbols",
        "version": "1.0.0",
        "updatedAt": "2026-11-15T20:41:00Z",
        "totalSymbols": len(manifest_entries),
        "symbols": manifest_entries
    }

    manifest_path = os.path.join(symbols_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)

    shutil.copy(manifest_path, os.path.join(frontend_symbols_dir, "manifest.json"))
    print(f"Generated {len(manifest_entries)} symbols in {symbols_dir} and frontend/public/symbols/")

if __name__ == "__main__":
    generate()

