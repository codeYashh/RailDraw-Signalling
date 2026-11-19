import {
  DrawingProject,
  LayingMethod,
  RouteSegment,
  CableDetail,
  PlacedSymbol,
} from '../types/drawing';
import { SAMPLE_PROJECT_REFERENCE } from '../constants/railwayData';

export interface DimensionProposal {
  specifiedTotal: number;
  segmentsSum: number;
  difference: number;
  issueSummary: string;
  adjustedProject: DrawingProject;
  adjustedExplanation: string;
  adjustedSegmentsSummary: string;
  sumMatchedProject: DrawingProject;
  sumMatchedExplanation: string;
  sumMatchedSegmentsSummary: string;
}

export interface ParseResult {
  project: DrawingProject;
  summary: string;
  hindiSummary: string;
  error?: string;
  dimensionProposal?: DimensionProposal;
}

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

function reconcileSegmentsToTotal(
  segments: RouteSegment[],
  targetTotal: number,
  customDepth?: number
): { segments: RouteSegment[]; explanation: string } {
  const cloned = segments.map((s) => ({ ...s }));
  const currentSum = round1(cloned.reduce((acc, s) => acc + s.length, 0));
  const diff = round1(targetTotal - currentSum);

  // Find longest Normal Trenching segment if any
  let normalIdx = -1;
  cloned.forEach((s, idx) => {
    if (s.layingMethod === 'Normal Trenching') {
      if (normalIdx === -1 || s.length > cloned[normalIdx].length) {
        normalIdx = idx;
      }
    }
  });

  if (diff > 0) {
    if (normalIdx >= 0) {
      const oldLen = cloned[normalIdx].length;
      const newLen = round1(oldLen + diff);
      cloned[normalIdx].length = newLen;
      return {
        segments: cloned,
        explanation: `Adjusted Normal Trenching from ${oldLen} m to ${newLen} m (+${diff} m) to match ${targetTotal} m total.`,
      };
    }
    if (cloned.length === 1 && diff >= 40) {
      const half1 = Math.round(diff / 2);
      const half2 = round1(diff - half1);
      return {
        segments: [
          makeSegment(1, half1, 'Normal Trenching', customDepth),
          cloned[0],
          makeSegment(3, half2, 'Normal Trenching', customDepth),
        ],
        explanation: `Added ${half1} m and ${half2} m of Normal Trenching around ${cloned[0].layingMethod} to match ${targetTotal} m total.`,
      };
    }
    cloned.push(makeSegment(cloned.length + 1, diff, 'Normal Trenching', customDepth));
    return {
      segments: cloned,
      explanation: `Added ${diff} m of Normal Trenching to fill the gap and match ${targetTotal} m total.`,
    };
  }

  // Overflow: segments sum > targetTotal
  const excess = Math.abs(diff);
  if (normalIdx >= 0 && cloned[normalIdx].length - excess >= 1) {
    const oldLen = cloned[normalIdx].length;
    const newLen = round1(oldLen - excess);
    cloned[normalIdx].length = newLen;
    return {
      segments: cloned,
      explanation: `Trimmed Normal Trenching from ${oldLen} m to ${newLen} m (−${excess} m) to match ${targetTotal} m total.`,
    };
  }

  let longestIdx = 0;
  cloned.forEach((s, idx) => {
    if (s.length > cloned[longestIdx].length) longestIdx = idx;
  });

  if (cloned[longestIdx].length - excess >= 1) {
    const oldLen = cloned[longestIdx].length;
    const newLen = round1(oldLen - excess);
    cloned[longestIdx].length = newLen;
    return {
      segments: cloned,
      explanation: `Trimmed ${cloned[longestIdx].layingMethod} from ${oldLen} m to ${newLen} m (−${excess} m) to match ${targetTotal} m total.`,
    };
  }

  // Proportional scaling fallback
  const ratio = targetTotal / currentSum;
  let running = 0;
  const scaled = cloned.map((s, idx) => {
    if (idx === cloned.length - 1) {
      const lastLen = Math.max(1, round1(targetTotal - running));
      return { ...s, length: lastLen };
    }
    const nextLen = Math.max(1, round1(s.length * ratio));
    running = round1(running + nextLen);
    return { ...s, length: nextLen };
  });

  return {
    segments: scaled,
    explanation: `Scaled all ${scaled.length} segments proportionally from ${currentSum} m down to ${targetTotal} m.`,
  };
}

// Map Devanagari Hindi digits to Arabic digits (०-९ -> 0-9)
function normalizeDevanagariDigits(text: string): string {
  const devanagariMap: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };
  return text.replace(/[०-९]/g, (char) => devanagariMap[char] || char);
}

// Convert spoken English & Hindi number words & letter names into digits and standard codes (for voice input!)
function normalizeNumberWords(text: string): string {
  const replacements: [RegExp, string][] = [
    // Spoken letters in Hindi (e.g. "एस 12" -> "S12", "पी 4" -> "P4")
    [/एस\s*(\d+)/gi, 'S$1'],
    [/पी\s*(\d+)/gi, 'P$1'],
    [/एल\s*(\d+)/gi, 'L$1'],
    [/एच\s*(\d+)/gi, 'H$1'],
    [/सी\s*(\d+)/gi, 'C$1'],

    // Compound hundreds (English)
    [/\bnine\s+hundred\s*(?:and\s*)?fifty\b/gi, '950'],
    [/\beight\s+hundred\s*(?:and\s*)?fifty\b/gi, '850'],
    [/\bseven\s+hundred\s*(?:and\s*)?fifty\b/gi, '750'],
    [/\bsix\s+hundred\s*(?:and\s*)?fifty\b/gi, '650'],
    [/\bfive\s+hundred\s*(?:and\s*)?fifty\b/gi, '550'],
    [/\bfour\s+hundred\s*(?:and\s*)?fifty\b/gi, '450'],
    [/\bfour\s+hundred\s*(?:and\s*)?thirty\b/gi, '430'],
    [/\bthree\s+hundred\s*(?:and\s*)?fifty\b/gi, '350'],
    [/\btwo\s+hundred\s*(?:and\s*)?fifty\b/gi, '250'],
    [/\bone\s+hundred\s*(?:and\s*)?fifty\b/gi, '150'],
    [/\bone\s+hundred\s*(?:and\s*)?twenty\b/gi, '120'],
    // Plain hundreds (English)
    [/\bone\s+thousand\b/gi, '1000'],
    [/\btwo\s+thousand\b/gi, '2000'],
    [/\bnine\s+hundred\b/gi, '900'],
    [/\beight\s+hundred\b/gi, '800'],
    [/\bseven\s+hundred\b/gi, '700'],
    [/\bsix\s+hundred\b/gi, '600'],
    [/\bfive\s+hundred\b/gi, '500'],
    [/\bfour\s+hundred\b/gi, '400'],
    [/\bthree\s+hundred\b/gi, '300'],
    [/\btwo\s+hundred\b/gi, '200'],
    [/\bone\s+hundred\b/gi, '100'],

    // Hindi thousands & compound hundreds (Spoken Hindi)
    [/एक\s*हजार|एक\s*हज़ार/gi, '1000'],
    [/दो\s*हजार|दो\s*हज़ार/gi, '2000'],
    [/नौ\s*सौ\s*पचास/gi, '950'],
    [/नौ\s*सौ/gi, '900'],
    [/आठ\s*सौ\s*पचास/gi, '850'],
    [/आठ\s*सौ/gi, '800'],
    [/सात\s*सौ\s*पचास/gi, '750'],
    [/सात\s*सौ/gi, '700'],
    [/छह\s*सौ\s*पचास|छः\s*सौ\s*पचास/gi, '650'],
    [/छह\s*सौ|छः\s*सौ/gi, '600'],
    [/पाँच\s*सौ\s*पचास|पांच\s*सौ\s*पचास/gi, '550'],
    [/पाँच\s*सौ|पांच\s*सौ/gi, '500'],
    [/चार\s*सौ\s*तीस/gi, '430'],
    [/चार\s*सौ\s*पचास/gi, '450'],
    [/चार\s*सौ/gi, '400'],
    [/तीन\s*सौ\s*पचास/gi, '350'],
    [/तीन\s*सौ/gi, '300'],
    [/दो\s*सौ\s*पचास/gi, '250'],
    [/दो\s*सौ/gi, '200'],
    [/एक\s*सौ\s*पचास|डेढ़\s*सौ/gi, '150'],
    [/एक\s*सौ\s*बीस/gi, '120'],
    [/एक\s*सौ/gi, '100'],

    // Tens & common numbers (English)
    [/\bseventy[\s-]five\b/gi, '75'],
    [/\btwenty[\s-]five\b/gi, '25'],
    [/\btwenty[\s-]four\b/gi, '24'],
    [/\bthirty[\s-]six\b/gi, '36'],
    [/\bforty[\s-]eight\b/gi, '48'],
    [/\bninety\b/gi, '90'],
    [/\beighty\b/gi, '80'],
    [/\bseventy\b/gi, '70'],
    [/\bsixty\b/gi, '60'],
    [/\bfifty\b/gi, '50'],
    [/\bforty\b/gi, '40'],
    [/\bthirty\b/gi, '30'],
    [/\btwenty\b/gi, '20'],
    [/\bfifteen\b/gi, '15'],
    [/\bfourteen\b/gi, '14'],
    [/\btwelve\b/gi, '12'],
    [/\beleven\b/gi, '11'],
    [/\bten\b/gi, '10'],
    [/\bnine\b/gi, '9'],
    [/\beight\b/gi, '8'],
    [/\bseven\b/gi, '7'],
    [/\bsix\b/gi, '6'],
    [/\bfive\b/gi, '5'],
    [/\bfour\b/gi, '4'],
    [/\bthree\b/gi, '3'],
    [/\btwo\b/gi, '2'],
    [/\bone\b/gi, '1'],

    // Hindi tens & units
    [/नब्बे/gi, '90'],
    [/अस्सी/gi, '80'],
    [/सत्तर/gi, '70'],
    [/पैंसठ/gi, '65'],
    [/साठ/gi, '60'],
    [/पचपन/gi, '55'],
    [/पचास/gi, '50'],
    [/पैंतालीस/gi, '45'],
    [/चालीस/gi, '40'],
    [/पैंतीस/gi, '35'],
    [/तीस/gi, '30'],
    [/पच्चीस/gi, '25'],
    [/चौबीस/gi, '24'],
    [/बीस/gi, '20'],
    [/पंद्रह/gi, '15'],
    [/चौदह/gi, '14'],
    [/तेरह/gi, '13'],
    [/बारह/gi, '12'],
    [/ग्यारह/gi, '11'],
    [/दस/gi, '10'],
    [/नौ/gi, '9'],
    [/आठ/gi, '8'],
    [/सात/gi, '7'],
    [/छह|छः/gi, '6'],
    [/पाँच|पांच/gi, '5'],
    [/चार/gi, '4'],
    [/तीन/gi, '3'],
    [/दो/gi, '2'],
    [/एक/gi, '1'],
  ];

  let out = text;
  for (const [pattern, rep] of replacements) {
    out = out.replace(pattern, rep);
  }
  return out;
}

// Convert common Hindi & English railway location names to clean standard IDs
function cleanLocationName(raw: string): string {
  let cleaned = raw
    .replace(/^(?:cable\s+route|signalling\s+route|route|drawing|plan|cable|draw|make|create|generate|show|a|the|केबल\s*का\s*नक्शा|केबल\s*रूट|नक्शा|बनाओ|दिखाओ)\s+/i, '')
    // Strip patri/track preambles e.g. "पटरी के पास सिग्नल S12" -> "सिग्नल S12"
    .replace(/^(?:पटरी\s*के\s*(?:पास|साथ|किनारे|निकट|समानांतर)|रेलवे\s*पटरी\s*के\s*(?:पास|साथ|किनारे|निकट)|ट्रैक\s*के\s*(?:पास|साथ|किनारे))\s*/gi, '')
    .trim();

  // Normalize Hindi location names
  cleaned = cleaned.replace(/एल\s*(\d+)/gi, 'L$1');
  cleaned = cleaned.replace(/एलसी\s*गेट\s*(\d+)/gi, 'LC Gate $1');
  cleaned = cleaned.replace(/सिग्नल\s*(?:नंबर\s*|नं\s*)?([a-z0-9_-]+)/gi, 'Signal $1');
  cleaned = cleaned.replace(/पॉइंट\s*मशीन\s*(?:नंबर\s*|नं\s*)?([a-z0-9_-]+)/gi, 'Point Machine $1');
  cleaned = cleaned.replace(/पॉइंट\s*([a-z0-9_-]+)/gi, 'Point Machine $1');
  cleaned = cleaned.replace(/रिले\s*रूम/gi, 'Relay Room');
  cleaned = cleaned.replace(/रिले\s*हट/gi, 'Relay Hut');
  cleaned = cleaned.replace(/स्टेशन\s*केबिन/gi, 'Station Cabin');
  cleaned = cleaned.replace(/स्टेशन/gi, 'Station');
  cleaned = cleaned.replace(/केबिन/gi, 'Cabin');
  cleaned = cleaned.replace(/लोकेशन\s*बॉक्स\s*([a-z0-9_-]+)/gi, 'Location Box $1');
  cleaned = cleaned.replace(/लोकेशन\s*बॉक्स/gi, 'Location Box');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  // Trim trailing length/conjunction noise if captured
  cleaned = cleaned.replace(/\s+\d+\s*(?:m|meter|meters|metre|metres|km|मीटर|मी)\b.*$/i, '').trim();
  return cleaned;
}

function inferNodeSymbolType(nodeLabel: string): string {
  const u = nodeLabel.toLowerCase();
  if (u.includes('cabin') || u.includes('station') || u.includes('relay') || u.includes('asm') || u.includes('room') || u.includes('hut')) {
    return 'signal_cabin';
  }
  if (u.includes('gate') || u.includes('lc')) {
    return 'lc_gate';
  }
  if (u.includes('signal') || u.includes('home') || u.includes('starter') || u.includes('distant') || u.includes('outer') || u.includes('cls') || /^s\d+$/i.test(u)) {
    return 'cls_4aspect';
  }
  if (u.includes('point') || /^pm\d*/i.test(u)) {
    return 'point_machine';
  }
  return 'location_box_single';
}

function detectRailwayZone(lower: string): { zone: string; code: string } | null {
  const zones: [string[], string, string][] = [
    [['northern railway', 'northern', 'उत्तर रेलवे', ' nr '], 'Northern Railway (NR)', 'NR'],
    [['western railway', 'western', 'पश्चिम रेलवे', ' wr '], 'Western Railway (WR)', 'WR'],
    [['central railway', 'central', 'मध्य रेलवे', ' cr '], 'Central Railway (CR)', 'CR'],
    [['southern railway', 'southern', 'दक्षिण रेलवे', ' sr '], 'Southern Railway (SR)', 'SR'],
    [['eastern railway', 'eastern', 'पूर्व रेलवे', ' er '], 'Eastern Railway (ER)', 'ER'],
    [['east central', 'ecr'], 'East Central Railway (ECR)', 'ECR'],
    [['south central', 'scr'], 'South Central Railway (SCR)', 'SCR'],
    [['south eastern', 'ser'], 'South Eastern Railway (SER)', 'SER'],
    [['north western', 'nwr'], 'North Western Railway (NWR)', 'NWR'],
    [['north central', 'ncr'], 'North Central Railway (NCR)', 'NCR'],
    [['north eastern', 'ner'], 'North Eastern Railway (NER)', 'NER'],
    [['northeast frontier', 'nfr'], 'Northeast Frontier Railway (NFR)', 'NFR'],
    [['west central', 'wcr'], 'West Central Railway (WCR)', 'WCR'],
    [['south western', 'swr'], 'South Western Railway (SWR)', 'SWR'],
    [['east coast', 'ecor'], 'East Coast Railway (ECoR)', 'ECoR'],
    [['konkan', 'krcl'], 'Konkan Railway (KR)', 'KR'],
  ];
  const padded = ` ${lower} `;
  for (const [keys, zone, code] of zones) {
    if (keys.some((k) => padded.includes(k))) {
      return { zone, code };
    }
  }
  return null;
}

function makeSegment(
  idx: number,
  length: number,
  method: LayingMethod,
  customDepth?: number
): RouteSegment {
  let depth = 1.0;
  let cover = 'Class II Bricks laid flat';

  switch (method) {
    case 'Trenchless-HDD':
      depth = 1.5;
      cover = 'HDPE Casing Pipe (HDD)';
      break;
    case 'GI Pipe':
      depth = 1.2;
      cover = '100mm GI Pipe Class B';
      break;
    case 'RCC Pipe':
      depth = 1.2;
      cover = '150mm RCC Pipe NP-2';
      break;
    case 'HDPE Pipe':
      depth = 1.0;
      cover = '110mm DWC HDPE Pipe';
      break;
    case 'Track crossing':
    case 'Rail crossing':
      depth = 1.2;
      cover = '150mm RCC Pipe under Track';
      break;
    case 'Road crossing':
      depth = 1.2;
      cover = '100mm GI Pipe / HDD under Road';
      break;
    case 'Along Bridge':
      depth = 0.0;
      cover = 'Perforated GI Cable Tray';
      break;
    case 'Culvert crossing':
      depth = 1.0;
      cover = 'GI Pipe on Steel Brackets';
      break;
    case 'Cable Trough':
      depth = 0.6;
      cover = 'Precast RCC Cable Trough';
      break;
    case 'Cable Tray':
      depth = 0.0;
      cover = 'Hot-Dip Galvanized Cable Tray';
      break;
    default:
      depth = 1.0;
      cover = 'Class II Bricks laid flat';
  }

  return {
    id: `seg-${Date.now()}-${idx}`,
    length: Math.round(length * 10) / 10,
    layingMethod: method,
    depth: customDepth !== undefined ? customDepth : depth,
    coverType: cover,
    remarks: `Segment ${idx} (${method})`,
  };
}

function extractAutoPlacedSymbols(lower: string, segments: RouteSegment[]): PlacedSymbol[] {
  const placed: PlacedSymbol[] = [];
  const usedPositions: number[] = [];

  const nextX = (preferred?: number): number => {
    let x = preferred !== undefined ? preferred : 210 + placed.length * 95;
    while (usedPositions.some((ux) => Math.abs(ux - x) < 52)) {
      x += 58;
    }
    if (x > 780) x = 180 + ((placed.length * 73) % 580);
    usedPositions.push(x);
    return Math.round(x);
  };

  const addBatch = (
    symbolType: string,
    prefix: string,
    count: number,
    yBase: number,
    explicitLabels?: string[]
  ) => {
    const capped = Math.min(Math.max(count, 1), 4);
    for (let i = 0; i < capped; i++) {
      const label =
        explicitLabels && explicitLabels[i]
          ? explicitLabels[i]
          : prefix.length >= 3 && capped === 1
          ? prefix
          : `${prefix}${i + 1}`;
      placed.push({
        id: `auto-sym-${Date.now()}-${placed.length + 1}`,
        symbolType,
        label,
        x: nextX(),
        y: yBase,
        scale: 0.92,
        rotation: 0,
      });
    }
  };

  // Detect explicit signal types & counts
  const matchCount = (pattern: RegExp): number => {
    const m = lower.match(pattern);
    if (!m) return 0;
    return m[1] ? Math.min(parseInt(m[1], 10) || 1, 4) : 1;
  };

  const c4 = matchCount(/(?:(\d+)\s+)?(?:4[\s-]?aspect|four[\s-]?aspect|home\s+signal|starter\s+signal|main\s+signal)/i);
  if (c4 > 0) addBatch('cls_4aspect', lower.includes('home') ? 'H' : lower.includes('starter') ? 'ST' : 'S', c4, 124);

  const c3 = matchCount(/(?:(\d+)\s+)?(?:3[\s-]?aspect|three[\s-]?aspect|distant\s+signal|ib\s+signal)/i);
  if (c3 > 0) addBatch('cls_3aspect', lower.includes('distant') ? 'D' : 'S', c3, 124);

  const c2 = matchCount(/(?:(\d+)\s+)?(?:2[\s-]?aspect|two[\s-]?aspect|gate\s+signal|calling[\s-]?on)/i);
  if (c2 > 0) addBatch('cls_2aspect', 'G', c2, 124);

  const cShunt = matchCount(/(?:(\d+)\s+)?shunt(?:\s+signal)?/i);
  if (cShunt > 0) addBatch('shunt_signal', 'SH', cShunt, 128);

  // Generic "signal" / "signals" if no specific aspect matched
  if (c4 === 0 && c3 === 0 && c2 === 0 && cShunt === 0) {
    const cGenSig = matchCount(/(?:(\d+)\s+)?(?:cls\s+)?signals?\b(?!\s*(?:cabin|cable|route|room|engineering|department|ling))/i);
    if (cGenSig > 0) addBatch('cls_4aspect', 'S', cGenSig, 124);
  }

  const cPm = matchCount(/(?:(\d+)\s+)?(?:electric\s+)?point\s*machines?|(\d+)\s+points?\b/i);
  if (cPm > 0) addBatch('point_machine', 'PM', cPm, 134);

  const cAc = matchCount(/(?:(\d+)\s+)?(?:axle\s*counters?|ssdac|msdac)/i);
  if (cAc > 0) addBatch('axle_counter', 'AC', cAc, 130);

  const cGj = matchCount(/(?:(\d+)\s+)?(?:glued\s*(?:insulated\s*)?joints?|track\s*circuits?)/i);
  if (cGj > 0) addBatch('glued_joint', 'GJ', cGj, 132);

  const cEp = matchCount(/(?:(\d+)\s+)?(?:earth\s*pits?|earthing)/i);
  if (cEp > 0) addBatch('earth_pit', 'EP', cEp, 208);

  const cLc = matchCount(/(?:(\d+)\s+)?(?:lc\s*gates?|level\s*crossings?)/i);
  if (cLc > 0) addBatch('lc_gate', 'LC', cLc, 128);

  const cBox = matchCount(/(?:(\d+)\s+)?(?:intermediate\s+location\s*box(?:es)?|apparatus\s*cases?|double\s+location\s*box(?:es)?)/i);
  if (cBox > 0) {
    const isDouble = lower.includes('double');
    addBatch(isDouble ? 'location_box_double' : 'location_box', isDouble ? 'DL' : 'LB', cBox, 132);
  }

  const cHut = matchCount(/(?:(\d+)\s+)?(?:relay\s*huts?|signal\s*cabins?)/i);
  if (cHut > 0 && !lower.includes('from relay') && !lower.includes('from station') && !lower.includes('from cabin')) {
    addBatch('signal_cabin', 'RH', cHut, 128);
  }

  const cCjm = matchCount(/(?:(\d+)\s+)?(?:cable\s*joint\s*markers?|joint\s*markers?|cable\s*joints?)/i);
  if (cCjm > 0) addBatch('cjm', 'CJM', cCjm, 206);

  // Auto-add a Track Crossing Marker (TCM) when a Track crossing segment exists
  const hasTrackCross = segments.some((s) => s.layingMethod === 'Track crossing' || s.layingMethod === 'Rail crossing');
  if (hasTrackCross && placed.length < 6) {
    placed.push({
      id: `auto-sym-tcm-${Date.now()}`,
      symbolType: 'tcm',
      label: 'TCM',
      x: nextX(340),
      y: 208,
      scale: 0.9,
      rotation: 0,
    });
  }

  return placed;
}

export function parseNaturalLanguagePrompt(
  prompt: string,
  _currentProject?: DrawingProject
): ParseResult {
  const step1 = normalizeDevanagariDigits(prompt.trim());
  const normalized = normalizeNumberWords(step1);
  const lower = normalized.toLowerCase();

  // Always start from a FRESH clean project template so old drawings NEVER leak into new prompts!
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '-');
  const project: DrawingProject = JSON.parse(JSON.stringify(SAMPLE_PROJECT_REFERENCE));
  project.id = `proj-${Date.now()}`;
  project.segments = [];
  project.placedSymbols = [];
  project.intermediateNodes = [];
  project.metadata.date = dateStr;
  project.metadata.revision = 'R0';

  const detectedParts: string[] = [];
  const detectedHindiParts: string[] = [];

  // 1. Detect From & To Locations (Hindi & English)
  let foundLocations = false;
  const hindiFromTo = normalized.match(
    /([a-zA-Z0-9\u0900-\u097F\s_-]+?)\s*से\s+([a-zA-Z0-9\u0900-\u097F\s_-]+?)\s*तक/i
  );

  if (hindiFromTo && hindiFromTo[1] && hindiFromTo[2]) {
    const fromClean = cleanLocationName(hindiFromTo[1]);
    const toClean = cleanLocationName(hindiFromTo[2]);
    if (fromClean && toClean) {
      project.startNode.id = fromClean.toUpperCase();
      project.startNode.name = fromClean.toUpperCase();
      project.startNode.type = inferNodeSymbolType(fromClean);
      project.endNode.id = toClean.toUpperCase();
      project.endNode.name = toClean.toUpperCase();
      project.endNode.type = inferNodeSymbolType(toClean);
      foundLocations = true;
      detectedParts.push(`${project.startNode.id} → ${project.endNode.id}`);
      detectedHindiParts.push(`${project.startNode.id} से ${project.endNode.id}`);
    }
  } else {
    // English: "from X to Y", "between X and Y", "X to Y", "X -> Y"
    const pairMatch =
      normalized.match(
        /(?:from|between)\s+([a-zA-Z0-9][a-zA-Z0-9\s./-]{0,28}?)\s+(?:to|and|->|–)\s+([a-zA-Z0-9][a-zA-Z0-9\s./-]{0,28}?)(?=\s*(?:,|;|\.|with\b|for\b|having\b|total\b|length\b|\d+\s*(?:m|meter|meters|metre|metres|km)\b|$))/i
      ) ||
      normalized.match(
        /^([a-zA-Z0-9][a-zA-Z0-9\s-]{0,18}?)\s+(?:to|->)\s+([a-zA-Z0-9][a-zA-Z0-9\s-]{0,22}?)(?=\s*(?:,|;|\.|with\b|for\b|\d+\s*(?:m|meter|meters|metre|metres|km)\b|$))/i
      );

    if (pairMatch && pairMatch[1] && pairMatch[2]) {
      const fromClean = cleanLocationName(pairMatch[1]);
      const toClean = cleanLocationName(pairMatch[2]);
      if (fromClean && toClean && fromClean.length <= 26 && toClean.length <= 26) {
        project.startNode.id = fromClean.toUpperCase();
        project.startNode.name = fromClean.toUpperCase();
        project.startNode.type = inferNodeSymbolType(fromClean);
        project.endNode.id = toClean.toUpperCase();
        project.endNode.name = toClean.toUpperCase();
        project.endNode.type = inferNodeSymbolType(toClean);
        foundLocations = true;
        detectedParts.push(`${project.startNode.id} → ${project.endNode.id}`);
      }
    }
  }

  // If user didn't name start/end explicitly, derive sensible domain labels from keywords (not always L1/L12!)
  if (!foundLocations) {
    if (lower.includes('yard')) {
      project.startNode.id = 'RELAY ROOM';
      project.startNode.type = 'signal_cabin';
      project.endNode.id = 'YARD END';
      project.endNode.type = 'location_box_single';
    } else if (lower.includes('gate') || lower.includes('lc')) {
      project.startNode.id = 'STATION CABIN';
      project.startNode.type = 'signal_cabin';
      project.endNode.id = 'LC GATE';
      project.endNode.type = 'lc_gate';
    } else if (lower.includes('home') || lower.includes('signal')) {
      project.startNode.id = 'RELAY ROOM';
      project.startNode.type = 'signal_cabin';
      project.endNode.id = 'HOME SIGNAL';
      project.endNode.type = 'cls_4aspect';
    } else if (lower.includes('bridge')) {
      project.startNode.id = 'ABUTMENT A';
      project.startNode.type = 'location_box_single';
      project.endNode.id = 'ABUTMENT B';
      project.endNode.type = 'location_box_single';
    } else if (lower.includes('ofc') || lower.includes('telecom')) {
      project.startNode.id = 'OFC HUT-1';
      project.startNode.type = 'signal_cabin';
      project.endNode.id = 'OFC HUT-2';
      project.endNode.type = 'signal_cabin';
    } else {
      project.startNode.id = 'LOC-A';
      project.startNode.type = 'location_box_single';
      project.endNode.id = 'LOC-B';
      project.endNode.type = 'location_box_single';
    }
    project.startNode.name = project.startNode.id;
    project.endNode.name = project.endNode.id;
  }

  // Detect optional explicit depth (e.g. "depth 1.2m", "1.5m deep", "1.5m depth")
  const depthMatch = lower.match(
    /(?:depth\s*(?:of|is|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres)|(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres)\s*(?:deep|depth))/i
  );
  const customDepth = depthMatch ? parseFloat(depthMatch[1] || depthMatch[2]) : undefined;

  // 2. Detect Explicit Route Segments (supports m & km, English & Hindi)
  const segmentRegex =
    /(\d+(?:\.\d+)?)\s*(km|kilometer|kilometers|kilometre|kilometres|m|meter|meters|metre|metres|मीटर|मी)?\s*(?:of|in|via|by|का|पर|में)?\s*(trenchless(?:\s*-\s*hdd|\s*hdd)?|hdd|ट्रेंचलेस|एचडीडी|gi\s*pipes?|जीआई\s*पाइप|rcc\s*pipes?|आरसीसी\s*पाइप|hdpe(?:\s*pipes?)?|dwc(?:\s*pipes?)?|एचडीपीई|normal\s*trenching|open\s*trenching|soil\s*trenching|trenching|trench|नॉर्मल\s*ट्रेंचिंग|ट्रेंचिंग|ट्रेंच|खाई|मिट्टी\s*में|जमीन\s*में|track\s*crossings?|rail\s*crossings?|ट्रैक\s*क्रॉसिंग|रेल\s*क्रॉसिंग|पटरी\s*क्रॉसिंग|road\s*crossings?|सड़क\s*क्रॉसिंग|रोड\s*क्रॉसिंग|along\s*bridge|bridge(?:\s*crossing)?|पुल|ब्रिज|culvert(?:\s*crossings?)?|कल्वर्ट(?:\s*क्रॉसिंग)?|नाला|cable\s*trays?|केबल\s*ट्रे|ट्रे|cable\s*troughs?|केबल\s*ट्रफ|ट्रफ)/gi;

  const parsedSegments: RouteSegment[] = [];
  let segMatch: RegExpExecArray | null;

  while ((segMatch = segmentRegex.exec(lower)) !== null) {
    let length = parseFloat(segMatch[1]);
    const unit = (segMatch[2] || 'm').toLowerCase();
    if (unit.startsWith('km') || unit.startsWith('kilo')) {
      length = length * 1000;
    }
    const methodRaw = segMatch[3].toLowerCase();

    let method: LayingMethod = 'Normal Trenching';
    if (methodRaw.includes('trenchless') || methodRaw.includes('hdd') || methodRaw.includes('ट्रेंचलेस') || methodRaw.includes('एचडीडी')) {
      method = 'Trenchless-HDD';
    } else if (methodRaw.includes('gi') || methodRaw.includes('जीआई')) {
      method = 'GI Pipe';
    } else if (methodRaw.includes('rcc') || methodRaw.includes('आरसीसी')) {
      method = 'RCC Pipe';
    } else if (methodRaw.includes('hdpe') || methodRaw.includes('dwc') || methodRaw.includes('एचडीपीई')) {
      method = 'HDPE Pipe';
    } else if (methodRaw.includes('track') || methodRaw.includes('rail') || methodRaw.includes('ट्रैक') || methodRaw.includes('रेल') || methodRaw.includes('पटरी')) {
      method = 'Track crossing';
    } else if (methodRaw.includes('road') || methodRaw.includes('सड़क') || methodRaw.includes('रोड')) {
      method = 'Road crossing';
    } else if (methodRaw.includes('bridge') || methodRaw.includes('पुल') || methodRaw.includes('ब्रिज')) {
      method = 'Along Bridge';
    } else if (methodRaw.includes('culvert') || methodRaw.includes('कल्वर्ट') || methodRaw.includes('नाला')) {
      method = 'Culvert crossing';
    } else if (methodRaw.includes('trough') || methodRaw.includes('ट्रफ')) {
      method = 'Cable Trough';
    } else if (methodRaw.includes('tray') || methodRaw.includes('ट्रे')) {
      method = 'Cable Tray';
    } else {
      method = 'Normal Trenching';
    }

    if (length > 0) {
      parsedSegments.push(makeSegment(parsedSegments.length + 1, length, method, customDepth));
    }
  }

  // 3. Detect Specified Total Length (supports m & km)
  const totalLengthMatch =
    lower.match(/(?:total\s*(?:length)?|length\s*(?:of)?|कुल\s*(?:लंबाई)?)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)\s*(km|kilometer|kilometers|m|meter|meters|metre|metres|मीटर)?/i) ||
    lower.match(/(\d+(?:\.\d+)?)\s*(km|kilometer|kilometers|m|meter|meters|metre|metres|मीटर)\s*(?:cable\s*route|signalling\s*route|route|total|:|,|\s+split|\s+from|\s+between)/i) ||
    lower.match(/(?:route|cable|trench|length)\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(km|m|meter|meters|metre|metres|मीटर)\b/i);

  let specifiedTotal: number | null = null;
  if (totalLengthMatch && totalLengthMatch[1]) {
    let val = parseFloat(totalLengthMatch[1]);
    const unit = (totalLengthMatch[2] || 'm').toLowerCase();
    if (unit.startsWith('km') || unit.startsWith('kilo')) val *= 1000;
    if (val > 0) specifiedTotal = val;
  }

  // 3b. Detect Remainder Clause in Hindi or English (e.g. "बाकी केबल ट्रफ में", "बाकी ट्रफ में", "rest in cable trough")
  const remainderMatch = lower.match(
    /(?:बाकी|शेष|बचा\s*हुआ|rest|remaining)\s*(?:\d+\s*(?:m|meter|मीटर)\s*)?(?:का\s*भाग|का\s*हिस्सा|लंबाई)?\s*(?:में|in|पर|on)?\s*(cable\s*troughs?|केबल\s*ट्रफ|ट्रफ|cable\s*trays?|केबल\s*ट्रे|ट्रे|normal\s*trenching|ट्रेंचिंग|trench|along\s*bridge|ब्रिज|पुल|culvert|कल्वर्ट|gi\s*pipe|rcc\s*pipe|hdpe\s*pipe|trenchless|hdd)/i
  );
  if (remainderMatch && specifiedTotal !== null) {
    const remRaw = remainderMatch[1].toLowerCase();
    let remMethod: LayingMethod = 'Cable Trough';
    if (remRaw.includes('trough') || remRaw.includes('ट्रफ')) remMethod = 'Cable Trough';
    else if (remRaw.includes('tray') || remRaw.includes('ट्रे')) remMethod = 'Cable Tray';
    else if (remRaw.includes('bridge') || remRaw.includes('ब्रिज') || remRaw.includes('पुल')) remMethod = 'Along Bridge';
    else if (remRaw.includes('culvert') || remRaw.includes('कल्वर्ट')) remMethod = 'Culvert crossing';
    else if (remRaw.includes('gi')) remMethod = 'GI Pipe';
    else if (remRaw.includes('rcc')) remMethod = 'RCC Pipe';
    else if (remRaw.includes('hdpe')) remMethod = 'HDPE Pipe';
    else if (remRaw.includes('hdd') || remRaw.includes('trenchless')) remMethod = 'Trenchless-HDD';
    else remMethod = 'Normal Trenching';

    const currentParsedSum = parsedSegments.reduce((acc, s) => acc + s.length, 0);
    const remainderLength = round1(specifiedTotal - currentParsedSum);
    if (remainderLength > 0) {
      parsedSegments.push(makeSegment(parsedSegments.length + 1, remainderLength, remMethod, customDepth));
    }
  }

  // 4. Assemble Segments & Detect Any Dimension Mismatch for User Approval
  let mismatchMeta: {
    specifiedTotal: number;
    segmentsSum: number;
    originalSegments: RouteSegment[];
    adjustedSegments: RouteSegment[];
    adjustedExplanation: string;
  } | null = null;

  if (parsedSegments.length > 0) {
    const sumParsed = round1(parsedSegments.reduce((acc, s) => acc + s.length, 0));

    if (specifiedTotal !== null && Math.abs(sumParsed - specifiedTotal) > 0.01) {
      const reconciled = reconcileSegmentsToTotal(parsedSegments, specifiedTotal, customDepth);
      project.segments = reconciled.segments;
      mismatchMeta = {
        specifiedTotal,
        segmentsSum: sumParsed,
        originalSegments: parsedSegments,
        adjustedSegments: reconciled.segments,
        adjustedExplanation: reconciled.explanation,
      };
    } else {
      project.segments = parsedSegments;
    }
  } else {
    // No explicit per-segment breakdown — synthesize an authentic route matching the prompt's total length & keywords!
    const fallbackAnyLen = lower.match(/\b(\d+(?:\.\d+)?)\s*(km|m|meter|meters|metre|metres|मीटर)\b/i);
    let routeTotal = specifiedTotal;
    if (routeTotal === null && fallbackAnyLen) {
      let v = parseFloat(fallbackAnyLen[1]);
      if ((fallbackAnyLen[2] || '').toLowerCase().startsWith('km')) v *= 1000;
      // Ignore small depth numbers like 1.0m or 1.5m when looking for route length
      if (v >= 10) routeTotal = v;
    }
    if (routeTotal === null) {
      // Pick a realistic default based on prompt type
      routeTotal = lower.includes('yard') ? 800 : lower.includes('bridge') ? 300 : lower.includes('gate') ? 450 : 250;
    }

    // Detect any qualitative laying methods mentioned without explicit sub-lengths
    const mentionedMethods: LayingMethod[] = [];
    if (lower.includes('track crossing') || lower.includes('rail crossing') || lower.includes('ट्रैक क्रॉसिंग')) mentionedMethods.push('Track crossing');
    if (lower.includes('road crossing') || lower.includes('सड़क क्रॉसिंग')) mentionedMethods.push('Road crossing');
    if (lower.includes('trenchless') || lower.includes('hdd') || lower.includes('ट्रेंचलेस')) mentionedMethods.push('Trenchless-HDD');
    if (lower.includes('bridge') || lower.includes('पुल')) mentionedMethods.push('Along Bridge');
    if (lower.includes('culvert') || lower.includes('कल्वर्ट')) mentionedMethods.push('Culvert crossing');
    if (lower.includes('rcc')) mentionedMethods.push('RCC Pipe');
    if (lower.includes('hdpe') || lower.includes('dwc')) mentionedMethods.push('HDPE Pipe');
    if (lower.includes('gi pipe') || lower.includes('जीआई पाइप')) mentionedMethods.push('GI Pipe');
    if (lower.includes('trough')) mentionedMethods.push('Cable Trough');
    if (lower.includes('tray')) mentionedMethods.push('Cable Tray');

    if (mentionedMethods.length === 0) {
      // Pure single-method normal trenching of exact requested length
      project.segments = [makeSegment(1, routeTotal, 'Normal Trenching', customDepth)];
    } else if (mentionedMethods.length === 1 && !lower.includes('trench')) {
      const m = mentionedMethods[0];
      if (['Track crossing', 'Road crossing', 'Culvert crossing', 'Trenchless-HDD'].includes(m) && routeTotal > 60) {
        const crossLen = Math.min(Math.max(Math.round(routeTotal * 0.15), 20), 80);
        const rem = routeTotal - crossLen;
        const left = Math.round(rem / 2);
        const right = rem - left;
        project.segments = [
          makeSegment(1, left, 'Normal Trenching', customDepth),
          makeSegment(2, crossLen, m, customDepth),
          makeSegment(3, right, 'Normal Trenching', customDepth),
        ];
      } else {
        project.segments = [makeSegment(1, routeTotal, m, customDepth)];
      }
    } else {
      // Split proportionally across mentioned methods + normal trenching
      const specialShare = Math.min(0.45, mentionedMethods.length * 0.15);
      const eachSpecial = Math.max(10, Math.round((routeTotal * specialShare) / mentionedMethods.length));
      const specialTotal = eachSpecial * mentionedMethods.length;
      const trenchLen = Math.max(10, routeTotal - specialTotal);
      const built: RouteSegment[] = [];
      mentionedMethods.forEach((m, i) => {
        built.push(makeSegment(i + 1, eachSpecial, m, customDepth));
      });
      if (trenchLen > 0) {
        built.push(makeSegment(built.length + 1, trenchLen, 'Normal Trenching', customDepth));
      }
      project.segments = built;
    }
  }

  // 5. Detect Cables (flexible English + Hindi, Signalling / Power / Telecom / OFC / Axle Counter)
  const cablePairRegex =
    /(\d+)\s*(?:nos?\.?|cables?|runs?|केबल|संख्या)?\s*(?:x|\*|of|का|गुना)\s*(\d+)\s*(?:c|core|cores|fibre|fiber|quad|कोर)(?:\s*(signalling|signaling|power|telecom|ofc|optical\s*fibre|axle\s*counter|सिगनलिंग|पावर))?/i;
  const singleCoreRegex = /(\d+)\s*(?:core|cores|fibre|fiber|quad|कोर)\s*(signalling|signaling|power|telecom|ofc|optical\s*fibre|cable)?/i;

  const cableMatch = lower.match(cablePairRegex);
  const singleCoreMatch = !cableMatch ? lower.match(singleCoreRegex) : null;

  let cableCount = 4;
  let coreCount = 12;
  let cableType: CableDetail['cableType'] = 'Signalling';
  let conductorSize = '1.5 sq mm';

  if (lower.includes('power') || lower.includes('पावर')) {
    cableType = 'Power';
    conductorSize = '10 sq mm / 25 sq mm';
    coreCount = 2;
    cableCount = 2;
  } else if (lower.includes('ofc') || lower.includes('optical') || lower.includes('fibre') || lower.includes('fiber')) {
    cableType = 'Optical Fibre';
    conductorSize = 'SM G.652D';
    coreCount = 24;
    cableCount = 1;
  } else if (lower.includes('telecom') || lower.includes('quad') || lower.includes('दूरसंचार')) {
    cableType = 'Telecom';
    conductorSize = '0.9 mm dia Quad';
    coreCount = 6;
    cableCount = 2;
  } else if (lower.includes('axle counter') || lower.includes('ssdac')) {
    cableType = 'Axle Counter';
    conductorSize = '0.9 mm Quad';
    coreCount = 4;
    cableCount = 2;
  }

  if (cableMatch) {
    cableCount = Math.max(1, parseInt(cableMatch[1], 10) || 4);
    coreCount = Math.max(1, parseInt(cableMatch[2], 10) || 12);
    const typeRaw = (cableMatch[3] || '').toLowerCase();
    if (typeRaw.includes('power') || typeRaw.includes('पावर')) {
      cableType = 'Power';
      conductorSize = '10 sq mm';
    } else if (typeRaw.includes('telecom')) {
      cableType = 'Telecom';
      conductorSize = '0.9 mm Quad';
    } else if (typeRaw.includes('ofc') || typeRaw.includes('optical')) {
      cableType = 'Optical Fibre';
      conductorSize = 'SM G.652D';
    }
  } else if (singleCoreMatch) {
    coreCount = Math.max(1, parseInt(singleCoreMatch[1], 10) || 12);
    cableCount = 2;
  }

  project.cables = [
    {
      id: `cab-${Date.now()}-1`,
      cableType,
      count: cableCount,
      coreCount,
      conductorSize,
      isArmoured: true,
      cableTag: `${cableType.slice(0, 3).toUpperCase()}/C01-${cableCount}`,
      function:
        cableType === 'Power'
          ? '110V/230V Signalling Power Supply'
          : cableType === 'Optical Fibre'
          ? 'High-Speed S&T Telecom & Block Backbone'
          : cableType === 'Telecom'
          ? 'Quad Telecom & Control Circuits'
          : 'Signal Aspects, Points & Track Circuits',
    },
  ];
  detectedParts.push(`${cableCount}×${coreCount}C ${cableType}`);

  // 6. Auto-Place Mentioned S&T Symbols on Canvas (all editable & draggable by hand!)
  project.placedSymbols = extractAutoPlacedSymbols(lower, project.segments);
  if (project.placedSymbols.length > 0) {
    detectedParts.push(`${project.placedSymbols.length} S&T symbols placed`);
  }

  // 7. Railway Zone, Division & Unique Drawing Number
  const zoneInfo = detectRailwayZone(lower);
  const zoneCode = zoneInfo ? zoneInfo.code : 'IR';
  project.metadata.railwayZone = zoneInfo ? zoneInfo.zone : 'Indian Railways';

  const divisions = ['Delhi', 'Mumbai', 'Howrah', 'Chennai', 'Secunderabad', 'Lucknow', 'Jaipur', 'Bhopal', 'Nagpur', 'Pune', 'Bengaluru', 'Ahmedabad', 'Prayagraj', 'Vadodara', 'Ambala', 'Firozpur', 'Moradabad'];
  const matchedDiv = divisions.find((d) => lower.includes(d.toLowerCase()));
  project.metadata.division = matchedDiv || 'S&T Division';

  const totalLength = project.segments.reduce((a, b) => a + (Number(b.length) || 0), 0);
  const shortFrom = project.startNode.id.replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'LOCA';
  const shortTo = project.endNode.id.replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'LOCB';
  project.metadata.drawingNumber = `${zoneCode}/S&T/${shortFrom}-${shortTo}/${now.getFullYear()}/${String(now.getMinutes()).padStart(2, '0')}`;
  project.metadata.workName = `PROVISION OF ${cableType.toUpperCase()} CABLE ROUTE BETWEEN ${project.startNode.id} AND ${project.endNode.id}`;
  project.metadata.isBilingual = /[\u0900-\u097F]/.test(prompt);
  project.name = `${project.startNode.id} to ${project.endNode.id} (${totalLength}m)`;

  // Validate that the prompt actually contains meaningful railway/drawing intent (reject pure gibberish like "hello world")
  const hasAnySignalKeyword =
    foundLocations ||
    parsedSegments.length > 0 ||
    specifiedTotal !== null ||
    Boolean(cableMatch || singleCoreMatch) ||
    project.placedSymbols.length > 0 ||
    /\b(cable|route|signal|trench|pipe|hdd|track|road|bridge|culvert|point|axle|earth|location|loc|cabin|station|gate|yard|ofc|core|meter|metre|km|drawing|plan|केबल|रूट|सिग्नल|ट्रेंच|पाइप|मीटर)\b/i.test(lower);

  if (!hasAnySignalKeyword) {
    return {
      project,
      summary: '',
      hindiSummary: '',
      error: 'Please describe a railway route, length, laying method, or S&T symbols (for example: locations, meters, pipe/trenching, signals, or point machines).',
    };
  }

  const segSummary = project.segments.map((s) => `${s.length}m ${s.layingMethod}`).join(' + ');
  detectedParts.push(segSummary);

  const summary = detectedParts.join(' • ');
  const hindiSummary = `${project.startNode.id} से ${project.endNode.id} • कुल लम्बाई: ${totalLength} मीटर`;

  if (mismatchMeta) {
    const adjustedProject: DrawingProject = JSON.parse(JSON.stringify(project));
    adjustedProject.segments = mismatchMeta.adjustedSegments;
    adjustedProject.name = `${adjustedProject.startNode.id} to ${adjustedProject.endNode.id} (${mismatchMeta.specifiedTotal}m)`;

    const sumMatchedProject: DrawingProject = JSON.parse(JSON.stringify(project));
    sumMatchedProject.segments = mismatchMeta.originalSegments;
    sumMatchedProject.name = `${sumMatchedProject.startNode.id} to ${sumMatchedProject.endNode.id} (${mismatchMeta.segmentsSum}m)`;

    const diff = round1(mismatchMeta.specifiedTotal - mismatchMeta.segmentsSum);
    const adjustedSegmentsSummary = mismatchMeta.adjustedSegments
      .map((s) => `${s.length} m ${s.layingMethod}`)
      .join(' + ');
    const sumMatchedSegmentsSummary = mismatchMeta.originalSegments
      .map((s) => `${s.length} m ${s.layingMethod}`)
      .join(' + ');

    const dimensionProposal: DimensionProposal = {
      specifiedTotal: mismatchMeta.specifiedTotal,
      segmentsSum: mismatchMeta.segmentsSum,
      difference: diff,
      issueSummary:
        diff > 0
          ? `Entered segments sum to ${mismatchMeta.segmentsSum} m, which is ${diff} m short of the stated ${mismatchMeta.specifiedTotal} m total.`
          : `Entered segments sum to ${mismatchMeta.segmentsSum} m, which exceeds the stated ${mismatchMeta.specifiedTotal} m total by ${Math.abs(diff)} m.`,
      adjustedProject,
      adjustedExplanation: mismatchMeta.adjustedExplanation,
      adjustedSegmentsSummary,
      sumMatchedProject,
      sumMatchedExplanation: `Keep your exact segment lengths and update total route length to ${mismatchMeta.segmentsSum} m.`,
      sumMatchedSegmentsSummary,
    };

    return {
      project: adjustedProject,
      summary,
      hindiSummary,
      dimensionProposal,
    };
  }

  return { project, summary, hindiSummary };
}
