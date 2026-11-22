import { PaperSize } from '../types/drawing';

export const STORAGE_KEYS = {
  THEME_MODE: 'raildraw_theme_mode',
  PROJECTS: 'raildraw_projects',
  SAVED_DRAWINGS: 'raildraw_mobile_saved_drawings',
  CACHED_MANIFEST: 'cached_manifest',
} as const;

export const UI_LIMITS = {
  MAX_UNDO_HISTORY: 30,
  MAX_SAVED_DRAWINGS: 30,
  TOAST_DURATION_MS: 3600,
  SPLASH_FADE_MS: 450,
  SPLASH_FINISH_MS: 650,
  THUMBNAIL_CAPTURE_DELAY_MS: 200,
  HEALTH_CHECK_TIMEOUT_MS: 1500,
  MAX_COMPOSER_HEIGHT_PX: 136,
  MAX_SYMBOL_LABEL_LENGTH: 12,
} as const;

export const CANVAS_CONFIG = {
  VIEWBOX_WIDTH: 960,
  VIEWBOX_HEIGHT: 600,
  MIN_ZOOM: 0.6,
  MAX_ZOOM: 3.0,
  ZOOM_STEP: 0.2,
  SYMBOL_MIN_SCALE: 0.6,
  SYMBOL_MAX_SCALE: 2.2,
  SYMBOL_SCALE_STEP: 0.15,
  SYMBOL_ROTATION_STEP: 45,
  PNG_EXPORT_WIDTH: 2800,
  PNG_EXPORT_HEIGHT: 1800,
  DESKTOP_PNG_WIDTH: 2400,
  DESKTOP_PNG_HEIGHT: 1696,
  THUMBNAIL_WIDTH: 640,
  THUMBNAIL_HEIGHT: 420,
} as const;

export const PAPER_SIZES: { size: PaperSize; label: string; recommended?: boolean }[] = [
  { size: 'A3', label: 'A3 (IRSEM Standard)', recommended: true },
  { size: 'A4', label: 'A4' },
  { size: 'A2', label: 'A2' },
  { size: 'A1', label: 'A1' },
];

export const ROUTE_PROMPT_EXAMPLES = [
  {
    id: 's12-p4',
    label: 'Signal S12 to PM P4 — 800 m (Bridge, Culvert, Trough)',
    hindiLabel: 'सिग्नल S12 से पॉइंट मशीन P4 — 800 मी (पुल, कल्वर्ट, ट्रफ)',
    en: 'Signalling cable route from Signal S12 to Point Machine P4, 800 m: 120 m along bridge, 30 m culvert crossing, 650 m cable trough, 3x4 core signalling cables',
    hi: 'सिग्नल S12 से पॉइंट मशीन P4 तक 800 मीटर केबल रूट, 120 मीटर ब्रिज, 30 मीटर कल्वर्ट और बाकी 650 मीटर केबल ट्रफ, 3x4 कोर सिग्नलिंग केबल',
  },
  {
    id: 'l1-l12',
    label: 'L1 to L12 — 500 m mixed',
    hindiLabel: 'L1 से L12 — 500 मी',
    en: 'Cable route from L1 to L12, 500 m: 20 m trenchless HDD, 50 m GI pipe, 430 m normal trenching, 7x12 core signalling cables',
    hi: 'एल 1 से एल 12 तक 500 मीटर केबल रूट, 20 मीटर ट्रेंचलेस, 50 मीटर जीआई पाइप और 430 मीटर नॉर्मल ट्रेंचिंग 7x12 कोर',
  },
  {
    id: 'relay-lc34',
    label: 'Relay Hut to LC-34 — 800 m',
    hindiLabel: 'स्टेशन से एलसी गेट — 800 मी',
    en: 'Cable route from Relay Hut to LC Gate 34, 800 m: 80 m track crossing RCC pipe, 120 m GI pipe, 600 m normal trenching, 4x24 core signalling cables',
    hi: 'स्टेशन से एलसी गेट तक 800 मीटर केबल रूट, 80 मीटर ट्रैक क्रॉसिंग आरसीसी पाइप, 120 मीटर जीआई पाइप और 600 मीटर ट्रेंचिंग 4x24 कोर',
  },
  {
    id: 's2-s4',
    label: 'Signal S2 to S4 — 1000 m',
    hindiLabel: 'सिग्नल S2 से S4 — 1000 मी',
    en: 'Cable route from Signal S2 to Signal S4, 1000 m: 100 m HDD, 900 m normal trenching, 6x12 core signalling cables',
    hi: 'सिग्नल एस 2 से सिग्नल एस 4 तक 1000 मीटर रूट, 100 मीटर एचडीडी और 900 मीटर नॉर्मल ट्रेंचिंग 6x12 कोर',
  },
] as const;

export const SYMBOL_PICKER_CATEGORIES = [
  'All',
  'Signals',
  'Track & Points',
  'Housing',
  'Markers',
  'Boards & Signs',
  'Power & Telecom',
] as const;
