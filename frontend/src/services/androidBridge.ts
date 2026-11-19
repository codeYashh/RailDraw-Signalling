// Native Android Bridge wrapper (window.AndroidBridge injected by MainActivity.java)

interface NativeAndroidBridge {
  saveImageToGallery: (base64Png: string, fileName: string) => string;
  savePdfToDownloads: (base64Pdf: string, fileName: string) => string;
  shareImage: (base64Png: string, fileName: string, shareText: string) => string;
  sharePdf: (base64Pdf: string, fileName: string, shareText: string) => string;
  startVoiceInput: (langTag: string) => void;
  setThemeMode: (isDark: boolean) => void;
  isNativeAndroid: () => boolean;
}

declare global {
  interface Window {
    AndroidBridge?: NativeAndroidBridge;
    __onAndroidVoiceResult?: (transcript: string) => void;
  }
}

export function isAndroidApp(): boolean {
  return typeof window !== 'undefined' && Boolean(window.AndroidBridge);
}

/**
 * Saves a PNG data URL to the phone's real Gallery (Pictures/RailDraw via Android MediaStore)
 * or triggers a proper binary PNG download in web browsers.
 */
export function savePngToPhone(
  pngDataUrl: string,
  filename: string
): { ok: boolean; location: string; error?: string } {
  const safeName = filename.endsWith('.png') ? filename : `${filename}.png`;

  if (window.AndroidBridge?.saveImageToGallery) {
    const res = window.AndroidBridge.saveImageToGallery(pngDataUrl, safeName);
    if (res && res.startsWith('OK:')) {
      return { ok: true, location: res.slice(3) };
    }
    return { ok: false, location: '', error: res || 'Android save failed' };
  }

  try {
    const link = document.createElement('a');
    link.href = pngDataUrl;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { ok: true, location: safeName };
  } catch (err: any) {
    return { ok: false, location: '', error: String(err) };
  }
}

/**
 * Saves a Base64 PDF payload into Android Download/RailDraw via MediaStore.
 */
export function savePdfNatively(
  pdfDataUriOrBase64: string,
  filename: string
): { handled: boolean; ok: boolean; location?: string; error?: string } {
  if (!window.AndroidBridge?.savePdfToDownloads) {
    return { handled: false, ok: false };
  }
  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const res = window.AndroidBridge.savePdfToDownloads(pdfDataUriOrBase64, safeName);
  if (res && res.startsWith('OK:')) {
    return { handled: true, ok: true, location: res.slice(3) };
  }
  return { handled: true, ok: false, error: res || 'Android PDF save failed' };
}

/**
 * Shares a PNG drawing via Android native Share Sheet (WhatsApp, Telegram, Gmail, etc.).
 */
export function sharePngNatively(
  pngDataUrl: string,
  filename: string,
  shareText: string
): boolean {
  if (!window.AndroidBridge?.shareImage) {
    return false;
  }
  const safeName = filename.endsWith('.png') ? filename : `${filename}.png`;
  const res = window.AndroidBridge.shareImage(pngDataUrl, safeName, shareText);
  return Boolean(res && res.startsWith('OK:'));
}

/**
 * Shares an A3 PDF drawing via Android native Share Sheet (WhatsApp, Email, Drive, etc.).
 */
export function sharePdfNatively(
  pdfDataUriOrBase64: string,
  filename: string,
  shareText: string
): boolean {
  if (!window.AndroidBridge?.sharePdf) {
    return false;
  }
  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const res = window.AndroidBridge.sharePdf(pdfDataUriOrBase64, safeName, shareText);
  return Boolean(res && res.startsWith('OK:'));
}

export function triggerAndroidVoice(langTag: string): boolean {
  if (!window.AndroidBridge?.startVoiceInput) {
    return false;
  }
  window.AndroidBridge.startVoiceInput(langTag);
  return true;
}

export function syncAndroidSystemBars(isDark: boolean): void {
  try {
    window.AndroidBridge?.setThemeMode?.(isDark);
  } catch {
    // Ignore when not in Android WebView
  }
}
