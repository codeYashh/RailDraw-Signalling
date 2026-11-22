"""
AutoCAD DXF Exporter for RailDraw Signalling
Compliant with Indian Railways Signal Engineering Manual (IRSEM) drafting conventions.
Generates layered, vector DXF files compatible with AutoCAD, LibreCAD, DraftSight.
"""

import io
import math
import ezdxf
from ezdxf import colors
from typing import Dict, Any, List

def create_dxf_drawing(project_data: Dict[str, Any]) -> bytes:
    # Create DXF R2010 document
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()

    # Define standard Indian Railways S&T CAD layers
    layers = [
        ("FRAME", colors.WHITE, "CONTINUOUS"),
        ("TITLE_BLOCK", colors.CYAN, "CONTINUOUS"),
        ("ROUTE", colors.RED, "CONTINUOUS"),
        ("HATCH", colors.GRAY, "CONTINUOUS"),
        ("SYMBOLS", colors.GREEN, "CONTINUOUS"),
        ("DIM", colors.YELLOW, "CONTINUOUS"),
        ("TEXT", colors.WHITE, "CONTINUOUS"),
        ("CALLOUT", colors.MAGENTA, "CONTINUOUS"),
        ("NOTES", colors.WHITE, "CONTINUOUS"),
        ("LEGEND", colors.BLUE, "CONTINUOUS"),
    ]

    for name, color, linetype in layers:
        if name not in doc.layers:
            doc.layers.add(name, color=color, linetype=linetype)

    # Drawing dimensions (A3 Landscape in mm: 420 x 297)
    W, H = 420.0, 297.0
    margin_left = 20.0  # IR binding margin
    margin_top = 10.0
    margin_right = 10.0
    margin_bottom = 10.0

    # 1. BORDER & FRAME
    # Outer sheet boundary
    msp.add_lwpolyline([(0, 0), (W, 0), (W, H), (0, H), (0, 0)], dxfattribs={"layer": "FRAME"})
    # Inner neat line
    inner_poly = [
        (margin_left, margin_bottom),
        (W - margin_right, margin_bottom),
        (W - margin_right, H - margin_top),
        (margin_left, H - margin_top),
        (margin_left, margin_bottom)
    ]
    msp.add_lwpolyline(inner_poly, dxfattribs={"layer": "FRAME"})

    meta = project_data.get("metadata", {})
    # 2. TITLE BLOCK (Standard Indian Railways format, bottom-right)
    # Box: X from 210 to 410, Y from 10 to 80 (Width 200mm, Height 70mm)
    tb_x1, tb_y1 = 210.0, 10.0
    tb_x2, tb_y2 = 410.0, 80.0
    msp.add_lwpolyline([
        (tb_x1, tb_y1), (tb_x2, tb_y1), (tb_x2, tb_y2), (tb_x1, tb_y2), (tb_x1, tb_y1)
    ], dxfattribs={"layer": "TITLE_BLOCK"})

    # Title block horizontal dividers
    dividers_y = [22.0, 34.0, 48.0, 62.0, 70.0]
    for dy in dividers_y:
        msp.add_line((tb_x1, dy), (tb_x2, dy), dxfattribs={"layer": "TITLE_BLOCK"})

    # Zone & Indian Railways Header
    zone = meta.get("railwayZone", "INDIAN RAILWAYS").upper()
    division = meta.get("division", "").upper() + " DIVISION"
    msp.add_text(f"INDIAN RAILWAYS - {zone}", dxfattribs={"layer": "TITLE_BLOCK", "height": 3.5}).set_placement((tb_x1 + 10, 73.0))
    msp.add_text(division, dxfattribs={"layer": "TITLE_BLOCK", "height": 2.5}).set_placement((tb_x1 + 10, 64.5))

    # Name of Work
    work = meta.get("workName", "CABLE ROUTE PLAN")
    msp.add_text("NAME OF WORK:", dxfattribs={"layer": "TITLE_BLOCK", "height": 2.0}).set_placement((tb_x1 + 4, 58.0))
    # Fit work name into two lines if long
    if len(work) > 45:
        msp.add_text(work[:45], dxfattribs={"layer": "TITLE_BLOCK", "height": 2.2}).set_placement((tb_x1 + 4, 53.0))
        msp.add_text(work[45:90], dxfattribs={"layer": "TITLE_BLOCK", "height": 2.2}).set_placement((tb_x1 + 4, 49.5))
    else:
        msp.add_text(work, dxfattribs={"layer": "TITLE_BLOCK", "height": 2.5}).set_placement((tb_x1 + 4, 52.0))

    # Section / Station
    stn = meta.get("stationSection", "")
    msp.add_text(f"STATION/SEC: {stn}", dxfattribs={"layer": "TITLE_BLOCK", "height": 2.2}).set_placement((tb_x1 + 4, 43.0))
    
    drg_no = meta.get("drawingNumber", "NR/S&T/SIG/01")
    rev = meta.get("revision", "R0")
    scale = meta.get("scale", "N.T.S.")
    msp.add_text(f"DRG NO: {drg_no}  |  REV: {rev}  |  SCALE: {scale}", dxfattribs={"layer": "TITLE_BLOCK", "height": 2.2}).set_placement((tb_x1 + 4, 36.5))

    # Signature columns
    msp.add_line((tb_x1 + 65, tb_y1), (tb_x1 + 65, 34.0), dxfattribs={"layer": "TITLE_BLOCK"})
    msp.add_line((tb_x1 + 130, tb_y1), (tb_x1 + 130, 34.0), dxfattribs={"layer": "TITLE_BLOCK"})
    
    # Signature rows text
    prep_by = meta.get("preparedBy", "JE (Sig)")
    chk_by = meta.get("checkedBy", "SSE (Sig)")
    app_by = meta.get("approvedBy", "Sr. DSTE")

    msp.add_text("PREPARED BY", dxfattribs={"layer": "TITLE_BLOCK", "height": 1.8}).set_placement((tb_x1 + 5, 29.0))
    msp.add_text(prep_by, dxfattribs={"layer": "TITLE_BLOCK", "height": 2.2}).set_placement((tb_x1 + 5, 24.5))
    msp.add_text(meta.get("preparedByDesig", "JE/Sig"), dxfattribs={"layer": "TITLE_BLOCK", "height": 1.6}).set_placement((tb_x1 + 5, 14.0))

    msp.add_text("CHECKED BY", dxfattribs={"layer": "TITLE_BLOCK", "height": 1.8}).set_placement((tb_x1 + 70, 29.0))
    msp.add_text(chk_by, dxfattribs={"layer": "TITLE_BLOCK", "height": 2.2}).set_placement((tb_x1 + 70, 24.5))
    msp.add_text(meta.get("checkedByDesig", "SSE/Drg"), dxfattribs={"layer": "TITLE_BLOCK", "height": 1.6}).set_placement((tb_x1 + 70, 14.0))

    msp.add_text("APPROVED BY", dxfattribs={"layer": "TITLE_BLOCK", "height": 1.8}).set_placement((tb_x1 + 135, 29.0))
    msp.add_text(app_by, dxfattribs={"layer": "TITLE_BLOCK", "height": 2.2}).set_placement((tb_x1 + 135, 24.5))
    msp.add_text(meta.get("approvedByDesig", "Dy. CSTE"), dxfattribs={"layer": "TITLE_BLOCK", "height": 1.6}).set_placement((tb_x1 + 135, 14.0))

    # 3. STANDARD IRSEM NOTES (Top-Left)
    notes_x, notes_y = 25.0, 280.0
    msp.add_text("GENERAL NOTES (AS PER IRSEM PART-II / RAILWAY BOARD):", dxfattribs={"layer": "NOTES", "height": 2.5}).set_placement((notes_x, notes_y))
    notes = project_data.get("settings", {}).get("customNotes", [])
    if not notes:
        notes = [
            "1. All dimensions are in metres unless specified otherwise.",
            "2. Normal cable trench depth 1.0m, track crossing depth 1.2m below rail level.",
            "3. 50mm sand bedding below cable & 50mm sand cover above cable before placing protective bricks.",
            "4. Cable route markers (CRM) placed every 50m and at every turn/joint.",
            "5. Cables under track/road crossings laid in GI/RCC/HDPE pipe casings as per RDSO/SPN/196."
        ]
    
    cur_ny = notes_y - 6.0
    for note in notes[:6]:
        msp.add_text(note, dxfattribs={"layer": "NOTES", "height": 2.0}).set_placement((notes_x, cur_ny))
        cur_ny -= 4.2

    # 4. HORIZONTAL CABLE ROUTE
    route_y = 150.0
    route_start_x = 55.0
    route_end_x = 365.0
    total_screen_w = route_end_x - route_start_x

    segments = project_data.get("segments", [])
    total_len = sum(s.get("length", 0) for s in segments)
    if total_len <= 0:
        total_len = 500.0

    # Calculate segment widths
    cur_x = route_start_x
    start_node = project_data.get("startNode", {"id": "L1", "name": "L1"})
    end_node = project_data.get("endNode", {"id": "L12", "name": "L12"})

    # Draw Start Location Box Symbol
    draw_location_box_dxf(msp, cur_x, route_y, start_node.get("id", "L1"))

    # Dimension extension line top Y
    dim_ext_y = route_y - 6.0
    dim_line_y = route_y - 18.0

    for i, seg in enumerate(segments):
        seg_len = seg.get("length", 100.0)
        seg_w = (seg_len / total_len) * total_screen_w
        method = seg.get("layingMethod", "Normal Trenching")
        next_x = cur_x + seg_w

        # Draw segment route line per method
        if "Trenchless" in method or "HDD" in method:
            # Trenchless / HDD: dashed center line with cross hatching
            msp.add_line((cur_x, route_y), (next_x, route_y), dxfattribs={"layer": "ROUTE", "linetype": "DASHED"})
            # Draw hatch lines (45 degrees)
            hatch_step = 4.0
            hx = cur_x
            while hx < next_x:
                msp.add_line((hx, route_y - 3), (hx + 3, route_y + 3), dxfattribs={"layer": "HATCH"})
                hx += hatch_step
            # Top and bottom guideline
            msp.add_line((cur_x, route_y - 3), (next_x, route_y - 3), dxfattribs={"layer": "ROUTE"})
            msp.add_line((cur_x, route_y + 3), (next_x, route_y + 3), dxfattribs={"layer": "ROUTE"})
        elif "Pipe" in method:
            # Double line pipe symbol
            msp.add_line((cur_x, route_y - 2.5), (next_x, route_y - 2.5), dxfattribs={"layer": "ROUTE"})
            msp.add_line((cur_x, route_y + 2.5), (next_x, route_y + 2.5), dxfattribs={"layer": "ROUTE"})
            # Casing collar ends
            msp.add_line((cur_x, route_y - 4), (cur_x, route_y + 4), dxfattribs={"layer": "ROUTE"})
            msp.add_line((next_x, route_y - 4), (next_x, route_y + 4), dxfattribs={"layer": "ROUTE"})
        elif "crossing" in method.lower():
            # Track/Road crossing
            msp.add_line((cur_x, route_y - 3), (next_x, route_y - 3), dxfattribs={"layer": "ROUTE"})
            msp.add_line((cur_x, route_y + 3), (next_x, route_y + 3), dxfattribs={"layer": "ROUTE"})
            # Sleeper/crossing marks
            cx_step = 5.0
            cx = cur_x + 2.0
            while cx < next_x:
                msp.add_line((cx, route_y - 4), (cx, route_y + 4), dxfattribs={"layer": "ROUTE"})
                cx += cx_step
        else:
            # Normal Trenching: Solid clean engineering line
            msp.add_line((cur_x, route_y), (next_x, route_y), dxfattribs={"layer": "ROUTE"})

        # Method Text above route
        mid_x = (cur_x + next_x) / 2.0
        msp.add_text(method.upper(), dxfattribs={"layer": "TEXT", "height": 1.8}).set_placement((mid_x - (len(method)*0.5), route_y + 5.0))

        # Extension lines for segment dimension
        msp.add_line((cur_x, dim_ext_y), (cur_x, dim_line_y - 4.0), dxfattribs={"layer": "DIM"})
        msp.add_line((next_x, dim_ext_y), (next_x, dim_line_y - 4.0), dxfattribs={"layer": "DIM"})

        # Dimension line with arrowheads
        draw_dimension_segment_dxf(msp, cur_x, next_x, dim_line_y, f"{seg_len:g} m")

        cur_x = next_x

    # Draw End Location Box Symbol
    draw_location_box_dxf(msp, route_end_x, route_y, end_node.get("id", "L12"))

    # OVERALL DIMENSION LINE (500m)
    overall_dim_y = route_y - 32.0
    msp.add_line((route_start_x, dim_line_y - 4), (route_start_x, overall_dim_y - 4), dxfattribs={"layer": "DIM"})
    msp.add_line((route_end_x, dim_line_y - 4), (route_end_x, overall_dim_y - 4), dxfattribs={"layer": "DIM"})
    draw_dimension_segment_dxf(msp, route_start_x, route_end_x, overall_dim_y, f"TOTAL LENGTH = {total_len:g} m")

    # Placed S&T Symbols on DXF sheet
    placed_symbols = project_data.get("placedSymbols", [])
    for sym in placed_symbols:
        sx = float(sym.get("x", 480))
        sy = float(sym.get("y", 300))
        dxf_x = margin_left + (sx / 960.0) * (W - margin_left - margin_right)
        dxf_y = H - margin_top - (sy / 600.0) * (H - margin_top - margin_bottom)
        scale = float(sym.get("scale", 1.0))
        r = 3.5 * scale
        msp.add_circle((dxf_x, dxf_y), radius=r, dxfattribs={"layer": "SYMBOLS"})
        lbl = sym.get("label") or sym.get("symbolType", "")
        if lbl:
            msp.add_text(lbl, dxfattribs={"layer": "TEXT", "height": 1.8}).set_placement((dxf_x - len(lbl) * 0.5, dxf_y - r - 2.8))

    # 5. ZOOMED DETAIL CALLOUT (Cables cross-section & trench profile)
    callout_src_x = route_start_x + total_screen_w * 0.45
    callout_src_y = route_y
    callout_box_x = 24.0
    callout_box_y = 65.0
    callout_box_w = 120.0
    callout_box_h = 55.0

    # Circular zoom reference on route
    msp.add_circle((callout_src_x, callout_src_y), radius=6.0, dxfattribs={"layer": "CALLOUT"})

    # Dashed leader lines from circle to callout box
    msp.add_line((callout_src_x - 4, callout_src_y - 4), (callout_box_x + callout_box_w - 5, callout_box_y + callout_box_h), dxfattribs={"layer": "CALLOUT", "linetype": "DASHED"})
    msp.add_line((callout_src_x + 4, callout_src_y - 4), (callout_box_x + callout_box_w, callout_box_y + callout_box_h - 10), dxfattribs={"layer": "CALLOUT", "linetype": "DASHED"})

    # Callout border box
    msp.add_lwpolyline([
        (callout_box_x, callout_box_y),
        (callout_box_x + callout_box_w, callout_box_y),
        (callout_box_x + callout_box_w, callout_box_y + callout_box_h),
        (callout_box_x, callout_box_y + callout_box_h),
        (callout_box_x, callout_box_y)
    ], dxfattribs={"layer": "CALLOUT"})

    # Callout Header
    msp.add_text("DETAIL - 'A' : TRENCH CROSS-SECTION & CABLE BUNDLE", dxfattribs={"layer": "CALLOUT", "height": 2.2}).set_placement((callout_box_x + 4, callout_box_y + callout_box_h - 5))

    # Cross section trench geometry
    tr_x1 = callout_box_x + 10.0
    tr_y_gl = callout_box_y + 42.0  # Ground level
    tr_y_bot = callout_box_y + 12.0 # Trench bottom (1.0m depth)
    tr_w = 40.0

    # Ground Level (GL) line
    msp.add_line((tr_x1 - 5, tr_y_gl), (tr_x1 + tr_w + 5, tr_y_gl), dxfattribs={"layer": "CALLOUT"})
    msp.add_text("G.L. (GROUND LEVEL)", dxfattribs={"layer": "CALLOUT", "height": 1.6}).set_placement((tr_x1 - 4, tr_y_gl + 1.5))

    # Trench walls and bottom
    msp.add_line((tr_x1, tr_y_gl), (tr_x1, tr_y_bot), dxfattribs={"layer": "CALLOUT"})
    msp.add_line((tr_x1 + tr_w, tr_y_gl), (tr_x1 + tr_w, tr_y_bot), dxfattribs={"layer": "CALLOUT"})
    msp.add_line((tr_x1, tr_y_bot), (tr_x1 + tr_w, tr_y_bot), dxfattribs={"layer": "CALLOUT"})

    # Depth dimension (1.0 m)
    msp.add_line((tr_x1 - 3, tr_y_gl), (tr_x1 - 3, tr_y_bot), dxfattribs={"layer": "DIM"})
    msp.add_text("D = 1.0 m", dxfattribs={"layer": "DIM", "height": 1.8}).set_placement((tr_x1 - 9, (tr_y_gl + tr_y_bot)/2.0))

    # Protective bricks
    brick_y = tr_y_bot + 16.0
    msp.add_lwpolyline([
        (tr_x1 + 2, brick_y), (tr_x1 + tr_w - 2, brick_y),
        (tr_x1 + tr_w - 2, brick_y + 4), (tr_x1 + 2, brick_y + 4),
        (tr_x1 + 2, brick_y)
    ], dxfattribs={"layer": "CALLOUT"})
    msp.add_text("CLASS II BRICKS", dxfattribs={"layer": "CALLOUT", "height": 1.5}).set_placement((tr_x1 + 4, brick_y + 1))

    # Sand cushion
    sand_top_y = brick_y - 1.0
    sand_bot_y = tr_y_bot + 2.0
    msp.add_line((tr_x1 + 2, sand_top_y), (tr_x1 + tr_w - 2, sand_top_y), dxfattribs={"layer": "HATCH", "linetype": "DOTTED"})

    # Cable circles (e.g. 7 signalling cables inside sand cushion)
    cables = project_data.get("cables", [])
    total_cable_count = sum(c.get("count", 1) for c in cables) if cables else 7
    first_cable = cables[0] if cables else {}
    core_spec = f"{total_cable_count} Nos. x {first_cable.get('coreCount', 12)} Core Signalling Cables"
    cond_size = first_cable.get("conductorSize", "1.5 sq mm")

    # Draw individual cable cross sections in a neat cluster
    cable_r = 2.2
    c_start_x = tr_x1 + 8.0
    c_y1 = tr_y_bot + 5.0
    c_y2 = tr_y_bot + 10.0

    # 4 on bottom row, 3 on top row = 7 cables
    for idx in range(min(total_cable_count, 4)):
        msp.add_circle((c_start_x + idx * 6.5, c_y1), radius=cable_r, dxfattribs={"layer": "CALLOUT"})
    for idx in range(min(total_cable_count - 4, 3)):
        msp.add_circle((c_start_x + 3.25 + idx * 6.5, c_y2), radius=cable_r, dxfattribs={"layer": "CALLOUT"})

    # Leader pointer to cable bundle
    leader_pt_x = tr_x1 + tr_w - 4.0
    leader_text_x = callout_box_x + 55.0
    msp.add_line((c_start_x + 15, c_y2 + 2), (leader_text_x, callout_box_y + 24), dxfattribs={"layer": "CALLOUT"})
    msp.add_text(core_spec, dxfattribs={"layer": "CALLOUT", "height": 2.2}).set_placement((leader_text_x + 2, callout_box_y + 24))
    msp.add_text(f"Conductor: {cond_size} Armoured", dxfattribs={"layer": "CALLOUT", "height": 1.8}).set_placement((leader_text_x + 2, callout_box_y + 19))
    msp.add_text("Sand Bedding: 50mm Top & Bottom", dxfattribs={"layer": "CALLOUT", "height": 1.6}).set_placement((leader_text_x + 2, callout_box_y + 14))

    # 6. LEGEND / SYMBOL KEY (Dynamically included)
    leg_x = 240.0
    leg_y = 205.0
    leg_w = 160.0
    leg_h = 75.0
    msp.add_lwpolyline([
        (leg_x, leg_y), (leg_x + leg_w, leg_y),
        (leg_x + leg_w, leg_y + leg_h), (leg_x, leg_y + leg_h),
        (leg_x, leg_y)
    ], dxfattribs={"layer": "LEGEND"})
    msp.add_text("LEGEND / SYMBOLS USED IN THIS DRAWING:", dxfattribs={"layer": "LEGEND", "height": 2.2}).set_placement((leg_x + 4, leg_y + leg_h - 5))

    # Items in legend
    items = [
        ("LOC BOX (APPARATUS CASE)", "Apparatus case for cable termination & relays"),
        ("NORMAL TRENCH", "Single trench line, depth 1.0m, sand cushion"),
        ("TRENCHLESS / HDD", "Hatched casing, minimum 1.5m depth"),
        ("GI PIPE CASING", "Double line pipe for track/culvert protection"),
        ("DIMENSION LINE", "Distance in metres with 3:1 closed arrows")
    ]
    cur_ly = leg_y + leg_h - 12.0
    for title, desc in items:
        msp.add_text(f"[ - ] {title}: {desc}", dxfattribs={"layer": "LEGEND", "height": 1.8}).set_placement((leg_x + 4, cur_ly))
        cur_ly -= 5.5

    # North arrow
    na_x = W - margin_right - 25.0
    na_y = H - margin_top - 25.0
    msp.add_line((na_x, na_y - 10), (na_x, na_y + 10), dxfattribs={"layer": "TEXT"})
    msp.add_line((na_x, na_y + 10), (na_x - 3, na_y + 4), dxfattribs={"layer": "TEXT"})
    msp.add_line((na_x, na_y + 10), (na_x + 3, na_y + 4), dxfattribs={"layer": "TEXT"})
    msp.add_text("N", dxfattribs={"layer": "TEXT", "height": 3.0}).set_placement((na_x - 1, na_y + 12))

    # Stream out DXF as bytes
    stream = io.StringIO()
    doc.write(stream)
    return stream.getvalue().encode("utf-8")


def draw_location_box_dxf(msp, x: float, y: float, label: str):
    """Draws standard Indian Railways apparatus case / location box symbol in DXF."""
    w, h = 10.0, 12.0
    bx = x - w/2.0
    by = y - h/2.0
    # Cabinet
    msp.add_lwpolyline([
        (bx, by), (bx + w, by), (bx + w, by + h), (bx, by + h), (bx, by)
    ], dxfattribs={"layer": "SYMBOLS"})
    # Peaked canopy roof
    msp.add_line((bx - 1, by + h), (x, by + h + 3), dxfattribs={"layer": "SYMBOLS"})
    msp.add_line((x, by + h + 3), (bx + w + 1, by + h), dxfattribs={"layer": "SYMBOLS"})
    # Center divider
    msp.add_line((x, by), (x, by + h), dxfattribs={"layer": "SYMBOLS"})
    # Text label
    msp.add_text(label, dxfattribs={"layer": "TEXT", "height": 2.2}).set_placement((x - (len(label)*0.6), y - h/2.0 - 4.5))


def draw_dimension_segment_dxf(msp, x1: float, x2: float, y: float, text: str):
    """Draws a clean CAD dimension line with 3:1 closed arrows and centered text."""
    msp.add_line((x1, y), (x2, y), dxfattribs={"layer": "DIM"})
    arrow_len = 3.0
    arrow_w = 0.8
    # Left arrow
    msp.add_lwpolyline([
        (x1, y), (x1 + arrow_len, y + arrow_w), (x1 + arrow_len, y - arrow_w), (x1, y)
    ], dxfattribs={"layer": "DIM"})
    # Right arrow
    msp.add_lwpolyline([
        (x2, y), (x2 - arrow_len, y + arrow_w), (x2 - arrow_len, y - arrow_w), (x2, y)
    ], dxfattribs={"layer": "DIM"})
    # Centered text
    mid_x = (x1 + x2) / 2.0
    msp.add_text(text, dxfattribs={"layer": "DIM", "height": 2.2}).set_placement((mid_x - (len(text)*0.6), y + 1.2))

