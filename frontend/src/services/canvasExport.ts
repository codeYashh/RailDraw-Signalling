import { serializeCleanSvg } from './pdfExport';

export function renderSvgToDataUrl(
  svg: SVGSVGElement,
  width: number,
  height: number,
  mime: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.95
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const svgData = serializeCleanSvg(svg);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      const img = new window.Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const urlApi = window.URL || window.webkitURL || window;
      const blobUrl = urlApi.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        urlApi.revokeObjectURL(blobUrl);
        resolve(canvas.toDataURL(mime, quality));
      };

      img.onerror = () => {
        urlApi.revokeObjectURL(blobUrl);
        reject(new Error('Failed to rasterize SVG drawing'));
      };

      img.src = blobUrl;
    } catch (err) {
      reject(err instanceof Error ? err : new Error('Failed to render drawing'));
    }
  });
}

export function triggerDataUrlDownload(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function sanitizeFilenameSegment(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
}
