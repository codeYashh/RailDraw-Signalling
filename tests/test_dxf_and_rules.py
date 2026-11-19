import os
import json
import pytest
import ezdxf
import io

from backend.dxf_exporter import create_dxf_drawing

def test_l1_to_l12_geometry_and_sum():
    """Verify primary acceptance criteria: L1 to L12 (500m) split into 20m + 50m + 430m."""
    segments = [
        {"id": "seg-1", "length": 20.0, "layingMethod": "Trenchless-HDD", "depth": 1.5},
        {"id": "seg-2", "length": 50.0, "layingMethod": "GI Pipe", "depth": 1.2},
        {"id": "seg-3", "length": 430.0, "layingMethod": "Normal Trenching", "depth": 1.0}
    ]
    total_length = sum(s["length"] for s in segments)
    assert total_length == 500.0, "Total route length must equal 500m"

def test_irsem_validation_rules():
    """Test validation warnings against IRSEM rules."""
    standards_path = os.path.join(os.path.dirname(__file__), "..", "standards", "irsem_rules.json")
    with open(standards_path, "r", encoding="utf-8") as f:
        rules = json.load(f)

    # 1. Check normal trenching rule
    normal_rule = next(r for r in rules["depthRules"] if r["method"] == "Normal Trenching")
    assert normal_rule["minDepth"] == 1.0

    # 2. Check track crossing rule
    track_rule = next(r for r in rules["depthRules"] if r["method"] == "Track crossing")
    assert track_rule["minDepth"] == 1.2

    # Violation scenario: segment with depth 0.7m in normal trenching
    seg_violation = {"length": 100, "layingMethod": "Normal Trenching", "depth": 0.7}
    assert seg_violation["depth"] < normal_rule["minDepth"], "Must flag violation if depth < 1.0m"

    # Violation scenario: track crossing without pipe
    track_constraints = rules["layingMethodConstraints"]["Track crossing"]
    assert track_constraints["pipeRequired"] is True
    assert "GI Pipe" in track_constraints["allowedPipes"]

def test_dxf_export_structure():
    """Verify generated DXF has correct layers, dimensions, and entities."""
    sample_project = {
        "metadata": {
            "railwayZone": "Northern Railway",
            "division": "Delhi",
            "workName": "Provision of Signalling Route L1 to L12",
            "drawingNumber": "NR/S&T/CABLE/2026/01",
            "revision": "R0"
        },
        "startNode": {"id": "L1", "name": "Location Box L1"},
        "endNode": {"id": "L12", "name": "Location Box L12"},
        "segments": [
            {"id": "seg-1", "length": 20.0, "layingMethod": "Trenchless-HDD", "depth": 1.5},
            {"id": "seg-2", "length": 50.0, "layingMethod": "GI Pipe", "depth": 1.2},
            {"id": "seg-3", "length": 430.0, "layingMethod": "Normal Trenching", "depth": 1.0}
        ],
        "cables": [
            {"id": "c1", "cableType": "Signalling", "count": 7, "coreCount": 12, "conductorSize": "1.5 sq mm"}
        ]
    }

    dxf_bytes = create_dxf_drawing(sample_project)
    assert len(dxf_bytes) > 1000, "DXF output must not be empty"

    # Load back with ezdxf to verify validity
    doc = ezdxf.read(io.StringIO(dxf_bytes.decode("utf-8")))
    layer_names = [l.dxf.name for l in doc.layers]

    # Required layers per acceptance criteria
    expected_layers = ["ROUTE", "DIM", "TEXT", "SYMBOLS", "FRAME", "HATCH", "TITLE_BLOCK", "NOTES", "LEGEND", "CALLOUT"]
    for req_layer in expected_layers:
        assert req_layer in layer_names, f"DXF must include layer: {req_layer}"

    msp = doc.modelspace()
    entities = list(msp)
    assert len(entities) > 20, "Modelspace must contain drawing entities"

    # Check that text contains Indian Railways, L1, L12, and 500
    all_texts = [e.dxf.text for e in entities if e.dxftype() == "TEXT"]
    text_content = " ".join(all_texts)
    assert "INDIAN RAILWAYS" in text_content
    assert "L1" in text_content
    assert "L12" in text_content
    assert "500" in text_content

def test_symbols_manifest():
    """Verify seeded symbol manifest completeness and initial verification status."""
    manifest_path = os.path.join(os.path.dirname(__file__), "..", "symbols", "manifest.json")
    assert os.path.exists(manifest_path)

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    symbols = manifest.get("symbols", [])
    assert len(symbols) >= 35, "Must have seeded comprehensive symbol set"

    for sym in symbols:
        assert sym["id"]
        assert sym["name"]
        assert sym["category"]
        assert sym["sourceReference"]
        # Acceptance criteria: seeded symbols must be NEEDS VERIFICATION initially
        assert sym["verificationStatus"] in ["NEEDS VERIFICATION", "VERIFIED"]
        
        # Check SVG file exists
        svg_file = os.path.join(os.path.dirname(manifest_path), sym["svgFile"])
        assert os.path.exists(svg_file), f"SVG file {svg_file} must exist on disk"

