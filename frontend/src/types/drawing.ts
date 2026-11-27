export type PaperSize = 'A4' | 'A3' | 'A2' | 'A1';
export type DrawingVariant = 'standard' | 'schematic' | 'detailed' | 'blueprint';
export type UserRole = 'Admin' | 'Engineer' | 'Reviewer';
export type VerificationStatus = 'NEEDS VERIFICATION' | 'VERIFIED';

export type LayingMethod =
  | 'Normal Trenching'
  | 'Trenchless-HDD'
  | 'GI Pipe'
  | 'RCC Pipe'
  | 'HDPE Pipe'
  | 'Cable Trough'
  | 'Cable Tray'
  | 'Along Bridge'
  | 'Culvert crossing'
  | 'Road crossing'
  | 'Track crossing'
  | 'Rail crossing';

export interface ProjectMetadata {
  railwayZone: string;
  division: string;
  stationSection: string;
  workName: string;
  drawingNumber: string;
  revision: string;
  scale: string;
  date: string;
  preparedBy: string;
  preparedByDesig: string;
  checkedBy: string;
  checkedByDesig: string;
  approvedBy: string;
  approvedByDesig: string;
  sheetNo: string;
  totalSheets: string;
  isBilingual: boolean;
}

export interface LocationNode {
  id: string;
  name: string;
  type: string; // symbol id, e.g. "location_box_single"
  chainageKm?: number;
  chainageM?: number;
  remarks?: string;
  x?: number;
  y?: number;
}

export interface RouteSegment {
  id: string;
  length: number; // in metres
  layingMethod: LayingMethod;
  depth: number; // in metres
  coverType: string;
  remarks?: string;
}

export interface CableDetail {
  id: string;
  cableType: 'Signalling' | 'Power' | 'Telecom' | 'Optical Fibre' | 'Axle Counter' | 'Block';
  count: number;
  coreCount: number;
  conductorSize: string;
  isArmoured: boolean;
  cableTag: string;
  function: string;
}

export interface CalloutPosition {
  x: number;
  y: number;
  sourceIndex: number;
}

export interface DrawingSettings {
  paperSize: PaperSize;
  orientation: 'landscape';
  drawingVariant?: DrawingVariant;
  showGrid: boolean;
  showNorthArrow: boolean;
  showScaleBar: boolean;
  showLegend: boolean;
  showNotes: boolean;
  showCallout: boolean;
  calloutPosition: CalloutPosition;
  customNotes: string[];
  customNotesHindi: string[];
}

export interface RevisionRecord {
  revision: string;
  date: string;
  description: string;
  preparedBy: string;
  approvedBy: string;
}

export interface PlacedSymbol {
  id: string;
  symbolType: string;
  label: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface DrawingProject {
  id: string;
  name: string;
  metadata: ProjectMetadata;
  startNode: LocationNode;
  endNode: LocationNode;
  intermediateNodes: LocationNode[];
  segments: RouteSegment[];
  cables: CableDetail[];
  settings: DrawingSettings;
  revisionHistory: RevisionRecord[];
  placedSymbols?: PlacedSymbol[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AnchorPoint {
  x: number;
  y: number;
}

export interface SymbolItem {
  id: string;
  name: string;
  category: string;
  description: string;
  sourceReference: string;
  defaultSize: { width: number; height: number };
  anchorPoint: AnchorPoint;
  version: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string | null;
  verificationDate?: string | null;
  verificationNotes?: string | null;
  tags: string[];
  svgFile: string;
  svgContent?: string;
}

export interface SymbolManifest {
  standard: string;
  version: string;
  updatedAt: string;
  totalSymbols: number;
  symbols: SymbolItem[];
}

export interface ValidationResult {
  isValid: boolean;
  totalLength: number;
  errors: string[];
  warnings: string[];
}

export interface DepthRule {
  method: string;
  minDepth: number;
  recommendedDepth: number;
  reference: string;
  description: string;
}

export interface RulePack {
  name: string;
  code: string;
  version: string;
  authority: string;
  depthRules: DepthRule[];
  layingMethodConstraints: Record<string, {
    pipeRequired: boolean;
    allowedPipes: string[];
    message: string;
  }>;
  protectionSpecs: {
    sandBeddingThicknessMm: number;
    sandCoverThicknessMm: number;
    protectiveCoverType: string;
    markerIntervalMetres: number;
    powerSeparationMetres: number;
  };
  defaultNotes: string[];
  defaultNotesHindi: string[];
}

