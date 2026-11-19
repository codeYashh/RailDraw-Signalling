import re

NUMBER_WORD_REPLACEMENTS = [
    # Hundreds compounds
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
    # Hindi hundreds
    (r'पाँच\s*सौ|पांच\s*सौ', '500'),
    (r'चार\s*सौ\s*तीस', '430'),
    (r'चार\s*सौ', '400'),
    (r'एक\s*सौ\s*पचास', '150'),
    (r'एक\s*सौ|सौ', '100'),
    # Tens compounds
    (r'\btwenty[\s\-]four\b', '24'),
    (r'\btwenty\b', '20'),
    (r'\bthirty\b', '30'),
    (r'\bfifty\b', '50'),
    (r'\bseventy\b', '70'),
    (r'\bforty\b', '40'),
    (r'\bsixty\b', '60'),
    (r'\beighty\b', '80'),
    (r'\bninety\b', '90'),
    # Hindi tens
    (r'चौबीस', '24'),
    (r'बीस', '20'),
    (r'तीस', '30'),
    (r'पचास', '50'),
    (r'सत्तर', '70'),
    # Units / teens
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

def normalize_number_words(text: str) -> str:
    res = text
    for pat, rep in NUMBER_WORD_REPLACEMENTS:
        res = re.sub(pat, rep, res, flags=re.IGNORECASE)
    return res

test_prompts = [
    "Cable route from L1 to L12, 500 m: 20 m trenchless, 50 m GI pipe, 430 m normal trenching, 7 cables of 12 core",
    "Cable route from L1 to L12, 500 meters: 20 metres trenchless, 50 metres GI pipe, 430 metres normal trenching, 7 cables of 12 core",
    "Cable route from L1 to L12, 500 m: 430 m normal trenching, 20 m trenchless, 50 m GI pipe, 7 cables of 12 core",
    "Cable route from L1 to L12, five hundred meters: twenty meters trenchless, fifty meters GI pipe, four hundred thirty meters normal trenching, seven cables of twelve core",
    "Cable route from L1 to L12, 500 m: 20 m trenchless, 50 m GI pipe, 400 m normal trenching, 7 cables of 12 core",
    "Cable route from L1 to L12, 500 m: 20 m trenchless, 50 m GI pipe, 430 m normal trenching",
    "Cable route from L1 to L2, 100 m: 100 m normal trenching",
    "Cable route from L1 to L15, 600 m: 30 m road crossing, 50 m trenchless, 70 m GI pipe, 450 m normal trenching, 6 cables of 24 core",
    "",
    "Random unrelated text hello world",
]

for i, p in enumerate(test_prompts, 1):
    norm = normalize_number_words(p)
    print(f"Prompt {i}: {p[:40]}... -> {norm[:40]}...")
