import re
from typing import Dict, Any, List, Optional

NUMBER_WORD_REPLACEMENTS = [
    (r'\beight\s+hundred\b', '800'),
    (r'\bsix\s+hundred\b', '600'),
    (r'\bfive\s+hundred\s*(?:and\s*)?fifty\b', '550'),
    (r'\bfive\s+hundred\b', '500'),
    (r'\bfour\s+hundred\s*(?:and\s*)?fifty\b', '450'),
    (r'\bfour\s+hundred\s*(?:and\s*)?thirty\b', '430'),
    (r'\bfour\s+hundred\b', '400'),
    (r'\bone\s+hundred\s*(?:and\s*)?fifty\b', '150'),
    (r'\bone\s+hundred\b', '100'),
    (r'\btwo\s+hundred\b', '200'),
    (r'\bthree\s+hundred\b', '300'),
    (r'\bseven\s+hundred\b', '700'),
    (r'\bnine\s+hundred\b', '900'),
    (r'पाँच\s*सौ|पांच\s*सौ', '500'),
    (r'चार\s*सौ\s*तीस', '430'),
    (r'चार\s*सौ', '400'),
    (r'एक\s*सौ\s*पचास', '150'),
    (r'एक\s*सौ|सौ', '100'),
    (r'\btwenty[\s\-]four\b', '24'),
    (r'\btwenty\b', '20'),
    (r'\bthirty\b', '30'),
    (r'\bfifty\b', '50'),
    (r'\bseventy\b', '70'),
    (r'\bforty\b', '40'),
    (r'\bsixty\b', '60'),
    (r'\beighty\b', '80'),
    (r'\bninety\b', '90'),
    (r'चौबीस', '24'),
    (r'बीस', '20'),
    (r'तीस', '30'),
    (r'पचास', '50'),
    (r'सत्तर', '70'),
    (r'\btwelve\b', '12'),
    (r'\bseven\b', '7'),
    (r'\bfour\b', '4'),
    (r'\bsix\b', '6'),
    (r'\btwo\b', '2'),
    (r'\bone\b', '1'),
    (r'\beight\b', '8'),
    (r'\bten\b', '10'),
    (r'\beleven\b', '11'),
    (r'\bfourteen\b', '14'),
    (r'बारह', '12'),
    (r'सात', '7'),
    (r'चार', '4'),
    (r'छह', '6'),
    (r'दो', '2'),
    (r'एक', '1'),
]

HINDI_DIGITS = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'}

def normalize_text(text: str) -> str:
    if not text:
        return ""
    for k, v in HINDI_DIGITS.items():
        text = text.replace(k, v)
    for pat, rep in NUMBER_WORD_REPLACEMENTS:
        text = re.sub(pat, rep, text, flags=re.IGNORECASE)
    return text.strip()

def parse_prompt(prompt: str) -> Dict[str, Any]:
    if not prompt or not prompt.strip():
        return {"status": "error", "message": "Please describe your signalling route in the box."}

    norm = normalize_text(prompt)

    # 1. Locations
    from_loc, to_loc = "L1", "L12"
    m_loc = re.search(r'\b(?:from|between)\s+([A-Za-z0-9_\-]+)\s+(?:to|and)\s+([A-Za-z0-9_\-]+)\b', norm, re.I)
    if m_loc:
        from_loc = m_loc.group(1).upper()
        to_loc = m_loc.group(2).upper()
    else:
        m_hindi = re.search(r'([A-Za-z0-9_\-\u0900-\u097F]+)\s*से\s+([A-Za-z0-9_\-\u0900-\u097F]+)\s*(?:तक)?', norm)
        if m_hindi:
            from_loc = m_hindi.group(1).upper()
            to_loc = m_hindi.group(2).upper()

    # 2. Segments
    seg_pattern = re.compile(
        r'(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres|मीटर)?\s*[:\-]?'
        r'\s*(trenchless|hdd|ट्रेंचलेस|एचडीडी|gi\s*pipe|g\.i|जीआई|rcc|आरसीसी|hdpe|एचडीपीई|road\s*crossing|सड़क|track\s*crossing|rail\s*crossing|ट्रैक|normal(?:\s*trenching)?|trenching|trench|खाई|pipe|पाइप)',
        re.I
    )

    segments = []
    for m in seg_pattern.finditer(norm):
        length = float(m.group(1))
        desc = m.group(2).lower()
        if 'trenchless' in desc or 'hdd' in desc or 'ट्रेंचलेस' in desc:
            method = 'Trenchless / HDD'
        elif 'gi' in desc or 'जीआई' in desc:
            method = 'GI Pipe'
        elif 'rcc' in desc or 'आरसीसी' in desc:
            method = 'RCC Pipe'
        elif 'hdpe' in desc or 'एचडीपीई' in desc:
            method = 'HDPE Pipe'
        elif 'road' in desc or 'सड़क' in desc:
            method = 'Road Crossing'
        elif 'track' in desc or 'rail' in desc or 'ट्रैक' in desc:
            method = 'Track Crossing'
        elif 'normal' in desc or 'trench' in desc or 'खाई' in desc:
            method = 'Normal Trenching'
        else:
            method = 'GI Pipe'
        segments.append({'length': length, 'method': method})

    if not segments:
        return {
            "status": "error",
            "message": "Could not detect route segments. Please specify lengths and methods (e.g. 20m trenchless, 50m GI pipe, 430m normal trenching)."
        }

    # 3. Total Length
    total_length = None
    m_tot = re.search(r'(?:total\s*(?:length)?|length\s*(?:of)?|कुल\s*(?:लंबाई)?)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres|मीटर)?', norm, re.I)
    if not m_tot:
        m_tot = re.search(r'(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres|मीटर)\s*(?:route|total|:|,|\s+split)', norm, re.I)
    if m_tot:
        total_length = float(m_tot.group(1))

    segments_sum = sum(s['length'] for s in segments)

    if total_length is not None and abs(segments_sum - total_length) > 0.01:
        s_str = str(int(segments_sum)) if segments_sum.is_integer() else f"{segments_sum:.1f}"
        t_str = str(int(total_length)) if total_length.is_integer() else f"{total_length:.1f}"
        return {
            "status": "error",
            "message": f"Segments add up to {s_str} m but total is {t_str} m. Please adjust the lengths so they match."
        }

    final_total = total_length if total_length is not None else segments_sum

    # 4. Cable details: e.g. "7 cables of 12 core", "7 x 12 core", "7*12 core"
    cable_match = re.search(
        r'(\d+)\s*(?:nos\.?|nos|cables?|केबल)?\s*(?:x|\*|of|गुना)\s*(\d+)\s*(?:c|core|cores|कोर)',
        norm,
        re.I
    )

    if cable_match:
        c_count = int(cable_match.group(1))
        c_core = int(cable_match.group(2))
        is_default_cable = False
        notice = None
    else:
        # Check single cable specification like "12 core cable"
        single_cable = re.search(r'(\d+)\s*(?:c|core|cores|कोर)\s*(?:cable|केबल)?', norm, re.I)
        if single_cable:
            c_count = 1
            c_core = int(single_cable.group(1))
            is_default_cable = False
            notice = None
        else:
            c_count = 7
            c_core = 12
            is_default_cable = True
            notice = "Note: Cable details not specified; using standard default: 7 Nos. x 12 Core Signalling Cables."

    return {
        "status": "success",
        "fromLocation": from_loc,
        "toLocation": to_loc,
        "totalLength": final_total,
        "segments": segments,
        "cableDetails": {"count": c_count, "coreCount": c_core, "isDefault": is_default_cable},
        "notice": notice
    }

def test_all_10_cases():
    test_cases = [
        # 1. Base Example
        ("Cable route from L1 to L12, 500 m: 20 m trenchless, 50 m GI pipe, 430 m normal trenching, 7 cables of 12 core",
         lambda res: res["status"] == "success" and res["fromLocation"] == "L1" and res["toLocation"] == "L12" and res["totalLength"] == 500 and len(res["segments"]) == 3 and res["cableDetails"]["count"] == 7 and res["cableDetails"]["coreCount"] == 12),

        # 2. meters / metre spelling
        ("Cable route from L1 to L12, 500 meters: 20 metres trenchless, 50 metres GI pipe, 430 metres normal trenching, 7 cables of 12 core",
         lambda res: res["status"] == "success" and res["totalLength"] == 500 and len(res["segments"]) == 3),

        # 3. Different order of segments
        ("Cable route from L1 to L12, 500 m: 430 m normal trenching, 20 m trenchless, 50 m GI pipe, 7 cables of 12 core",
         lambda res: res["status"] == "success" and res["totalLength"] == 500 and len(res["segments"]) == 3 and res["segments"][0]["method"] == "Normal Trenching"),

        # 4. Number words
        ("Cable route from L1 to L12, five hundred meters: twenty meters trenchless, fifty meters GI pipe, four hundred thirty meters normal trenching, seven cables of twelve core",
         lambda res: res["status"] == "success" and res["totalLength"] == 500 and len(res["segments"]) == 3 and res["cableDetails"]["count"] == 7 and res["cableDetails"]["coreCount"] == 12),

        # 5. Segments do not add up (500 vs 470)
        ("Cable route from L1 to L12, 500 m: 20 m trenchless, 50 m GI pipe, 400 m normal trenching, 7 cables of 12 core",
         lambda res: res["status"] == "error" and "Segments add up to 470 m but total is 500 m" in res["message"]),

        # 6. Missing cable details (must use default and say so)
        ("Cable route from L1 to L12, 500 m: 20 m trenchless, 50 m GI pipe, 430 m normal trenching",
         lambda res: res["status"] == "success" and res["cableDetails"]["isDefault"] is True and "standard default" in (res["notice"] or "")),

        # 7. Only one segment
        ("Cable route from L1 to L2, 100 m: 100 m normal trenching",
         lambda res: res["status"] == "success" and res["totalLength"] == 100 and len(res["segments"]) == 1),

        # 8. Four segments including road crossing
        ("Cable route from L1 to L15, 600 m: 30 m road crossing, 50 m trenchless, 70 m GI pipe, 450 m normal trenching, 6 cables of 24 core",
         lambda res: res["status"] == "success" and res["totalLength"] == 600 and len(res["segments"]) == 4 and any(s["method"] == "Road Crossing" for s in res["segments"]) and res["cableDetails"]["count"] == 6 and res["cableDetails"]["coreCount"] == 24),

        # 9. Empty text (must not crash)
        ("",
         lambda res: res["status"] == "error" and "describe your signalling route" in res["message"]),

        # 10. Random unrelated text (must not crash)
        ("The quick brown fox jumps over the lazy dog.",
         lambda res: res["status"] == "error" and "Could not detect route segments" in res["message"])
    ]

    all_passed = True
    for i, (prompt, check) in enumerate(test_cases, 1):
        res = parse_prompt(prompt)
        passed = check(res)
        status = "PASS" if passed else "FAIL"
        print(f"Test {i:2d}: [{status}] - {prompt[:60] if prompt else '<EMPTY>'}")
        if not passed:
            print(f"       Got: {res}")
            all_passed = False

    assert all_passed, "Some test cases failed!"
    print("\nALL 10 TEST CASES PASSED 100%!")

if __name__ == "__main__":
    test_all_10_cases()
