from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnchorPoint(BaseModel):
    x: float
    y: float

class Size(BaseModel):
    width: float
    height: float

class SymbolManifestEntry(BaseModel):
    id: str
    name: str
    category: str
    description: str
    sourceReference: str
    defaultSize: Size
    anchorPoint: AnchorPoint
    version: str = "1.0.0"
    verificationStatus: str = "NEEDS VERIFICATION" # "NEEDS VERIFICATION" or "VERIFIED"
    verifiedBy: Optional[str] = None
    verificationDate: Optional[str] = None
    verificationNotes: Optional[str] = None
    tags: List[str] = []
    svgFile: str
    svgContent: Optional[str] = None

class ProjectMetadata(BaseModel):
    railwayZone: str = "Northern Railway"
    division: str = "Delhi"
    stationSection: str = "New Delhi - Anand Vihar Section"
    workName: str = "Provision of 4-Aspect Auto Signalling & Cable Route L1 to L12"
    drawingNumber: str = "NR/S&T/SIG/CR/2026/042"
    revision: str = "R0"
    scale: str = "N.T.S."
    date: str = "15-11-2026"
    preparedBy: str = "R. K. Sharma"
    preparedByDesig: str = "JE (Signal) / Drg"
    checkedBy: str = "A. K. Verma"
    checkedByDesig: str = "SSE (Signal) / Drg"
    approvedBy: str = "S. N. Singh"
    approvedByDesig: str = "Dy. CSTE (Project)"
    sheetNo: str = "01"
    totalSheets: str = "01"
    isBilingual: bool = True

class LocationNode(BaseModel):
    id: str
    name: str
    type: str = "location_box_single"
    chainageKm: Optional[float] = 124.0
    chainageM: Optional[float] = 0.0
    remarks: Optional[str] = ""
    x: Optional[float] = None
    y: Optional[float] = None

class RouteSegment(BaseModel):
    id: str
    length: float # in metres
    layingMethod: str = "Normal Trenching"
    depth: float = 1.0 # in metres
    coverType: str = "Class II Bricks"
    remarks: Optional[str] = ""

class CableDetail(BaseModel):
    id: str
    cableType: str = "Signalling"
    count: int = 7
    coreCount: int = 12
    conductorSize: str = "1.5 sq mm"
    isArmoured: bool = True
    cableTag: str = "C1-C7"
    function: str = "Signal Aspects, Point Detection & Track Repeating"

class CalloutPosition(BaseModel):
    x: float = 650.0
    y: float = 380.0
    sourceIndex: int = 1 # Segment index for callout reference

class DrawingSettings(BaseModel):
    paperSize: str = "A3"
    orientation: str = "landscape"
    showGrid: bool = False
    showNorthArrow: bool = True
    showScaleBar: bool = True
    showLegend: bool = True
    showNotes: bool = True
    showCallout: bool = True
    calloutPosition: CalloutPosition = Field(default_factory=CalloutPosition)
    customNotes: List[str] = []
    customNotesHindi: List[str] = []

class RevisionRecord(BaseModel):
    revision: str
    date: str
    description: str
    preparedBy: str
    approvedBy: str

class DrawingProject(BaseModel):
    id: str = "proj-default-01"
    name: str = "Cable Route L1 to L12 (500m)"
    metadata: ProjectMetadata = Field(default_factory=ProjectMetadata)
    startNode: LocationNode = Field(default_factory=lambda: LocationNode(id="L1", name="Location Box L1", type="location_box_single", chainageKm=124.0, chainageM=100.0))
    endNode: LocationNode = Field(default_factory=lambda: LocationNode(id="L12", name="Location Box L12", type="location_box_single", chainageKm=124.0, chainageM=600.0))
    intermediateNodes: List[LocationNode] = []
    segments: List[RouteSegment] = Field(default_factory=list)
    cables: List[CableDetail] = Field(default_factory=list)
    settings: DrawingSettings = Field(default_factory=DrawingSettings)
    revisionHistory: List[RevisionRecord] = []
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

