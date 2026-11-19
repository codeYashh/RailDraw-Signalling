import jsPDF from 'jspdf';
import { PaperSize } from '../types/drawing';
import { savePdfNatively } from './androidBridge';

/**
 * Clones the CAD SVG and strips editor-only selection halos ([data-editor-ui="true"])
 * so exported PNGs and PDFs are 100% clean engineering drawings.
 */
export function serializeCleanSvg(svgElement: SVGSVGElement): string {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll('[data-editor-ui="true"]').forEach((el) => el.remove());
  return new XMLSerializer().serializeToString(clone);
}

/**
 * Generates an A3/A4/A2/A1 landscape PDF from the CAD SVG and returns both
 * the jsPDF instance and its Base64 data URI.
 */
export async function buildPdfFromSvg(
  svgElement: SVGSVGElement,
  paperSize: PaperSize = 'A3'
): Promise<{ pdf: jsPDF; dataUri: string; blob: Blob }> {
  const paperDimensions: Record<PaperSize, { width: number; height: number }> = {
    A4: { width: 297, height: 210 },
    A3: { width: 420, height: 297 },
    A2: { width: 594, height: 420 },
    A1: { width: 841, height: 594 },
  };

  const { width, height } = paperDimensions[paperSize] || paperDimensions.A3;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [width, height],
    compress: true,
  });

  const svgString = serializeCleanSvg(svgElement);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const urlApi = window.URL || window.webkitURL || window;
  const blobURL = urlApi.createObjectURL(svgBlob);

  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = (e) => reject(e);
      image.src = blobURL;
    });

    // Crisp 2400x1697 raster inside A3 PDF (high-quality JPEG keeps PDF fast & ~350KB on mobile)
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = Math.round((2400 * height) / width);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context unavailable');
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Maintain CAD 960x600 aspect ratio centered with clean print margins
    const marginX = Math.round(canvas.width * 0.02);
    const marginY = Math.round(canvas.height * 0.02);
    const drawW = canvas.width - marginX * 2;
    const drawH = canvas.height - marginY * 2;
    const svgAspect = 960 / 600;
    let targetW = drawW;
    let targetH = Math.round(drawW / svgAspect);
    if (targetH > drawH) {
      targetH = drawH;
      targetW = Math.round(drawH * svgAspect);
    }
    const offsetX = Math.round((canvas.width - targetW) / 2);
    const offsetY = Math.round((canvas.height - targetH) / 2);

    ctx.drawImage(image, offsetX, offsetY, targetW, targetH);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, width, height, undefined, 'FAST');

    const dataUri = pdf.output('datauristring');
    const blob = pdf.output('blob');
    return { pdf, dataUri, blob };
  } finally {
    urlApi.revokeObjectURL(blobURL);
  }
}

/**
 * Exports SVG CAD drawing to printable PDF and stores it on the phone (Download/RailDraw)
 * via AndroidBridge MediaStore, or downloads in web browser.
 */
export async function exportSvgToPdf(
  svgElement: SVGSVGElement,
  paperSize: PaperSize = 'A3',
  filename: string = 'RailDraw_Signalling_Plan.pdf'
): Promise<{ ok: boolean; location: string }> {
  const { pdf, dataUri } = await buildPdfFromSvg(svgElement, paperSize);
  const nativeRes = savePdfNatively(dataUri, filename);

  if (nativeRes.handled) {
    if (!nativeRes.ok) {
      throw new Error(nativeRes.error || 'Failed to save PDF on Android');
    }
    return { ok: true, location: nativeRes.location || `Download/RailDraw/${filename}` };
  }

  pdf.save(filename);
  return { ok: true, location: filename };
}

/**
 * Downloads text content (such as DXF, SVG, or JSON) as a file in browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
