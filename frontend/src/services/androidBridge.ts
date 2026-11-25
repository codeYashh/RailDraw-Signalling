// Native Android Bridge wrapper (window.AndroidBridge injected by MainActivity.java)

interface NativeAndroidBridge {
  saveImageToGallery: (base64Png: string, fileName: string) => string;
  savePdfToDownloads: (base64Pdf: string, fileName: string) => string;
  shareImage: (base64Png: string, fileName: string, shareText: string) => string;
  sharePdf: (base64Pdf: string, fileName: string, shareText: string) => string;
  startVoiceInput: (langTag: string) => void;
  setThemeMode: (isDark: boolean) => void;
  isNativeAndroid: () => boolean;
  exitApp?: () => void;
  handleAppExit?: () => void;
  openExternalUrl?: (url: string) => void;
  downloadAndInstallApk?: (apkUrl: string) => string;
}

declare global {
  interface Window {
    AndroidBridge?: NativeAndroidBridge;
    __onAndroidVoiceResult?: (transcript: string) => void;
    __onUpdateDownloadProgress?: (
      percent: number,
      status: string,
      done: boolean,
      error: boolean
    ) => void;
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

export function notifyAppExit(): void {
  try {
    if (window.AndroidBridge?.handleAppExit) {
      window.AndroidBridge.handleAppExit();
      return;
    }
  } catch {}
}

export function openExternalUrl(url: string): void {
  if (!url) return;
  try {
    if (window.AndroidBridge?.openExternalUrl) {
      window.AndroidBridge.openExternalUrl(url);
      return;
    }
  } catch {}

  try {
    window.open(url, '_blank');
  } catch {
    window.location.href = url;
  }
}

/**
 * Closes the entire application via native Android finishAffinity/System.exit,
 * or browser window.close/navigator.app.exitApp.
 */
export function closeApplication(): void {
  try {
    if (window.AndroidBridge?.exitApp) {
      window.AndroidBridge.exitApp();
      return;
    }
  } catch {}

  try {
    (navigator as any).app?.exitApp?.();
  } catch {}

  try {
    window.close();
  } catch {}

  // Fallback for desktop browsers where script cannot close window directly
  try {
    document.body.innerHTML = `
      <div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0A111A;color:#E2E8F0;font-family:sans-serif;text-align:center;padding:24px;">
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px;">App Closed</h2>
        <p style="font-size:14px;color:#94A3B8;max-width:320px;">RailDraw has exited. You can safely close this window or return to your desktop.</p>
      </div>
    `;
  } catch {}
}

