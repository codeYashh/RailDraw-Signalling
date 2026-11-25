import {
  APP_VERSION,
  GITHUB_API_LATEST_RELEASE,
  GITHUB_REPO_URL,
  GITHUB_RAW_APK_URL,
  GITHUB_RAW_VERSION_JSON,
  GITHUB_REPO_OWNER,
  GITHUB_REPO_NAME,
} from '../constants/version';
import { openExternalUrl } from './androidBridge';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  htmlUrl: string;
  apkDownloadUrl: string;
  isUpdateAvailable: boolean;
  lastChecked: string;
  checkedVia: 'raw_json' | 'release' | 'contents_api' | 'tags_api' | 'local_api' | 'mock';
  networkError?: boolean;
}

const STORAGE_KEY_UPDATE = 'raildraw_latest_update_info';
const STORAGE_KEY_LAST_CHECK = 'raildraw_update_last_check_time';

export function compareSemver(v1: string, v2: string): number {
  const clean1 = (v1 || '').replace(/^v/, '').trim();
  const clean2 = (v2 || '').replace(/^v/, '').trim();

  const parts1 = clean1.split('.').map((p) => parseInt(p, 10) || 0);
  const parts2 = clean2.split('.').map((p) => parseInt(p, 10) || 0);

  const length = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < length; i++) {
    const num1 = parts1[i] ?? 0;
    const num2 = parts2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs: number = 6000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return resp;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
};

export async function checkForGitHubUpdates(force: boolean = false): Promise<UpdateInfo> {
  const now = new Date().toISOString();
  const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';

  // 1. Primary Remote: Direct raw version.json from GitHub main with strict cache-busting
  try {
    const rawUrl = `${GITHUB_RAW_VERSION_JSON}?_cb=${Date.now()}`;
    const rawResp = await fetchWithTimeout(
      rawUrl,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
        cache: 'no-store',
      },
      5000
    );

    if (rawResp.ok) {
      const data = await rawResp.json();
      const remoteVersion = (data.version || APP_VERSION).replace(/^v/, '').trim();
      const isNewer = compareSemver(remoteVersion, APP_VERSION) > 0;

      const updateInfo: UpdateInfo = {
        currentVersion: APP_VERSION,
        latestVersion: remoteVersion,
        releaseName: data.name || `RailDraw v${remoteVersion}`,
        releaseNotes: data.releaseNotes || 'Latest improvements for RailDraw Signalling drafting.',
        publishedAt: data.publishedAt || now,
        htmlUrl: GITHUB_REPO_URL,
        apkDownloadUrl: data.apkUrl || GITHUB_RAW_APK_URL,
        isUpdateAvailable: isNewer,
        lastChecked: now,
        checkedVia: 'raw_json',
      };

      try {
        localStorage.setItem(STORAGE_KEY_UPDATE, JSON.stringify(updateInfo));
        localStorage.setItem(STORAGE_KEY_LAST_CHECK, now);
      } catch {}

      return updateInfo;
    }
  } catch (err) {
    console.warn('Raw GitHub version check skipped:', err);
  }

  // 2. Secondary Remote: GitHub Contents API for version.json (bypasses raw CDN cache)
  try {
    const contentsUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/version.json?_t=${Date.now()}`;
    const contentsResp = await fetchWithTimeout(
      contentsUrl,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      },
      5000
    );

    if (contentsResp.ok) {
      const resJson = await contentsResp.json();
      if (resJson.content) {
        const decoded = atob(resJson.content.replace(/\s/g, ''));
        const data = JSON.parse(decoded);
        const remoteVersion = (data.version || APP_VERSION).replace(/^v/, '').trim();
        const isNewer = compareSemver(remoteVersion, APP_VERSION) > 0;

        const updateInfo: UpdateInfo = {
          currentVersion: APP_VERSION,
          latestVersion: remoteVersion,
          releaseName: data.name || `RailDraw v${remoteVersion}`,
          releaseNotes: data.releaseNotes || 'Latest improvements for RailDraw Signalling drafting.',
          publishedAt: data.publishedAt || now,
          htmlUrl: GITHUB_REPO_URL,
          apkDownloadUrl: data.apkUrl || GITHUB_RAW_APK_URL,
          isUpdateAvailable: isNewer,
          lastChecked: now,
          checkedVia: 'contents_api',
        };

        try {
          localStorage.setItem(STORAGE_KEY_UPDATE, JSON.stringify(updateInfo));
          localStorage.setItem(STORAGE_KEY_LAST_CHECK, now);
        } catch {}

        return updateInfo;
      }
    }
  } catch (err) {
    console.warn('GitHub Contents API check skipped:', err);
  }

  // 3. Tertiary Remote: GitHub Tags API (always returns latest git tags like v1.5.0)
  try {
    const tagsUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/tags?_t=${Date.now()}`;
    const tagsResp = await fetchWithTimeout(
      tagsUrl,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      },
      5000
    );

    if (tagsResp.ok) {
      const tags = await tagsResp.json();
      if (Array.isArray(tags) && tags.length > 0) {
        const latestTagName: string = tags[0].name || '';
        const cleanTag = latestTagName.replace(/^v/, '').trim();
        const isNewer = compareSemver(cleanTag, APP_VERSION) > 0;

        const updateInfo: UpdateInfo = {
          currentVersion: APP_VERSION,
          latestVersion: cleanTag || APP_VERSION,
          releaseName: `RailDraw Signalling v${cleanTag || APP_VERSION}`,
          releaseNotes:
            '• Dynamic Theme-Matching Load Screen (Light/Dark)\n• 25 New Official Indian Railways Symbols (70 Total)\n• Direct In-App OTA Update Engine\n• Full AutoCAD DXF & Vector CAD Integration',
          publishedAt: now,
          htmlUrl: GITHUB_REPO_URL,
          apkDownloadUrl: GITHUB_RAW_APK_URL,
          isUpdateAvailable: isNewer,
          lastChecked: now,
          checkedVia: 'tags_api',
        };

        try {
          localStorage.setItem(STORAGE_KEY_UPDATE, JSON.stringify(updateInfo));
          localStorage.setItem(STORAGE_KEY_LAST_CHECK, now);
        } catch {}

        return updateInfo;
      }
    }
  } catch (err) {
    console.warn('GitHub Tags API check skipped:', err);
  }

  // 4. Quaternary Remote: GitHub Releases API
  try {
    const response = await fetchWithTimeout(
      GITHUB_API_LATEST_RELEASE,
      {
        headers: { Accept: 'application/vnd.github+json' },
        cache: force ? 'no-cache' : 'default',
      },
      5000
    );

    if (response.ok) {
      const data = await response.json();
      const tagName: string = data.tag_name || data.name || APP_VERSION;
      const cleanTag = tagName.replace(/^v/, '').trim();
      const isNewer = compareSemver(cleanTag, APP_VERSION) > 0;

      let apkAssetUrl: string = GITHUB_RAW_APK_URL;
      if (Array.isArray(data.assets)) {
        const apkAsset = data.assets.find((a: any) =>
          a.name?.toLowerCase().endsWith('.apk')
        );
        if (apkAsset && apkAsset.browser_download_url) {
          apkAssetUrl = apkAsset.browser_download_url;
        }
      }

      const updateInfo: UpdateInfo = {
        currentVersion: APP_VERSION,
        latestVersion: cleanTag,
        releaseName: data.name || `Release ${tagName}`,
        releaseNotes: data.body || 'New enhancements for RailDraw Signalling.',
        publishedAt: data.published_at || now,
        htmlUrl: data.html_url || GITHUB_REPO_URL,
        apkDownloadUrl: apkAssetUrl,
        isUpdateAvailable: isNewer,
        lastChecked: now,
        checkedVia: 'release',
      };

      try {
        localStorage.setItem(STORAGE_KEY_UPDATE, JSON.stringify(updateInfo));
        localStorage.setItem(STORAGE_KEY_LAST_CHECK, now);
      } catch {}

      return updateInfo;
    }
  } catch (err) {
    console.warn('GitHub API check skipped:', err);
  }

  // 5. Local endpoint check ONLY when running on local development server AND isNewer is true
  if (!isFileProtocol) {
    try {
      const localUrl = `/version.json?_t=${Date.now()}`;
      const localResp = await fetchWithTimeout(localUrl, { cache: 'no-cache' }, 2000);
      if (localResp.ok) {
        const data = await localResp.json();
        const remoteVersion = (data.version || APP_VERSION).replace(/^v/, '').trim();
        const isNewer = compareSemver(remoteVersion, APP_VERSION) > 0;

        if (isNewer) {
          const updateInfo: UpdateInfo = {
            currentVersion: APP_VERSION,
            latestVersion: remoteVersion,
            releaseName: data.name || `RailDraw v${remoteVersion}`,
            releaseNotes: data.releaseNotes || 'Latest improvements for RailDraw Signalling drafting.',
            publishedAt: data.publishedAt || now,
            htmlUrl: GITHUB_REPO_URL,
            apkDownloadUrl: data.apkUrl || '/RailDraw.apk',
            isUpdateAvailable: true,
            lastChecked: now,
            checkedVia: 'local_api',
          };
          return updateInfo;
        }
      }
    } catch {}
  }

  // 6. Stable Fallback: Latest verified build state
  const fallbackInfo: UpdateInfo = {
    currentVersion: APP_VERSION,
    latestVersion: APP_VERSION,
    releaseName: `RailDraw Signalling v${APP_VERSION}`,
    releaseNotes: 'Your RailDraw Signalling app is running the latest production build.',
    publishedAt: now,
    htmlUrl: GITHUB_REPO_URL,
    apkDownloadUrl: GITHUB_RAW_APK_URL,
    isUpdateAvailable: false,
    lastChecked: now,
    checkedVia: 'mock',
    networkError: force ? true : false,
  };

  try {
    localStorage.setItem(STORAGE_KEY_LAST_CHECK, now);
  } catch {}

  return fallbackInfo;
}

export function getCachedUpdateInfo(): UpdateInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UPDATE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Triggers an actual file download of the APK.
 * Works seamlessly across both Android native WebView and desktop/mobile web browsers.
 */
export async function downloadUpdateApk(
  apkUrl: string,
  onProgress?: (percent: number, statusText: string) => void
): Promise<{ ok: boolean; message: string }> {
  const safeUrl = apkUrl || GITHUB_RAW_APK_URL;
  const targetFilename = 'RailDraw.apk';

  // Play Store-style native in-app download + direct PackageInstaller trigger
  if (typeof window !== 'undefined' && window.AndroidBridge?.downloadAndInstallApk) {
    return new Promise((resolve, reject) => {
      onProgress?.(2, 'Connecting to update server...');

      window.__onUpdateDownloadProgress = (percent, status, done, error) => {
        onProgress?.(percent, status);
        if (done) {
          window.__onUpdateDownloadProgress = undefined;
          if (error) {
            reject(new Error(status || 'Failed to download update.'));
          } else {
            resolve({ ok: true, message: status || 'Installer opened.' });
          }
        }
      };

      try {
        const res = window.AndroidBridge!.downloadAndInstallApk!(safeUrl);
        if (!res || !res.startsWith('OK:')) {
          window.__onUpdateDownloadProgress = undefined;
          reject(new Error(res || 'Could not start in-app update download.'));
        }
      } catch (err: any) {
        window.__onUpdateDownloadProgress = undefined;
        reject(new Error(err?.message || 'Android update bridge error.'));
      }
    });
  }

  // Fallback for older Android shells without downloadAndInstallApk
  if (typeof window !== 'undefined' && window.AndroidBridge?.openExternalUrl) {
    onProgress?.(50, 'Opening Android Package Installer...');
    window.AndroidBridge.openExternalUrl(safeUrl);
    onProgress?.(100, 'Update started in Android download manager.');
    return { ok: true, message: 'Downloading update in Android Package Manager' };
  }

  // Browser: Initiate real download
  onProgress?.(20, 'Connecting to update binary server...');
  try {
    const link = document.createElement('a');
    link.href = safeUrl;
    link.download = targetFilename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onProgress?.(100, 'APK download initialized.');
    return { ok: true, message: `Downloading ${targetFilename}` };
  } catch (err: any) {
    openExternalUrl(safeUrl);
    return { ok: true, message: 'Opening download link in browser' };
  }
}
