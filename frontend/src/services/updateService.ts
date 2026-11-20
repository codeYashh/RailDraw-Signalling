import {
  APP_VERSION,
  GITHUB_API_LATEST_RELEASE,
  GITHUB_API_RELEASES,
  GITHUB_REPO_URL,
  GITHUB_RAW_APK_URL,
  GITHUB_RAW_VERSION_JSON,
} from '../constants/version';

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
  checkedVia: 'raw_json' | 'release' | 'tag' | 'mock';
  networkError?: boolean;
}

const STORAGE_KEY_UPDATE = 'raildraw_latest_update_info';
const STORAGE_KEY_LAST_CHECK = 'raildraw_update_last_check_time';

export function compareSemver(v1: string, v2: string): number {
  const clean1 = v1.replace(/^v/, '').trim();
  const clean2 = v2.replace(/^v/, '').trim();

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

export async function checkForGitHubUpdates(force: boolean = false): Promise<UpdateInfo> {
  const now = new Date().toISOString();

  // Helper with 6-second timeout to avoid any freezing
  const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const resp = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return resp;
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  };

  // 1. Primary: Direct raw version.json check from GitHub main branch
  // (Always reflects git push instantly with no GitHub API rate limits or auth keys)
  try {
    const rawUrl = `${GITHUB_RAW_VERSION_JSON}?_cb=${Date.now()}`;
    const rawResp = await fetchWithTimeout(rawUrl, {
      cache: force ? 'no-cache' : 'default',
    });

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
    console.warn('Raw version check skipped:', err);
  }

  // 2. Secondary: GitHub Releases API
  try {
    const response = await fetchWithTimeout(GITHUB_API_LATEST_RELEASE, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
      cache: force ? 'no-cache' : 'default',
    });

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

  // 3. Fallback / Offline response
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
