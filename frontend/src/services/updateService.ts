import {
  APP_VERSION,
  GITHUB_API_LATEST_RELEASE,
  GITHUB_API_RELEASES,
  GITHUB_REPO_URL,
} from '../constants/version';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  htmlUrl: string;
  apkDownloadUrl: string | null;
  isUpdateAvailable: boolean;
  lastChecked: string;
  checkedVia: 'release' | 'tag' | 'mock';
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

  try {
    // 1. Fetch latest release from GitHub API
    const response = await fetch(GITHUB_API_LATEST_RELEASE, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
      cache: force ? 'no-cache' : 'default',
    });

    if (response.ok) {
      const data = await response.json();
      const tagName: string = data.tag_name || data.name || '1.0.0';
      const cleanTag = tagName.replace(/^v/, '');
      const isNewer = compareSemver(cleanTag, APP_VERSION) > 0;

      // Locate APK asset if present
      let apkAssetUrl: string | null = null;
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
        releaseNotes: data.body || 'No release notes provided for this version.',
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
      } catch {
        // Storage fail-safe
      }

      return updateInfo;
    }

    // 2. If 404 (no releases published yet), check all releases or tags endpoint
    if (response.status === 404) {
      const releasesResp = await fetch(GITHUB_API_RELEASES);
      if (releasesResp.ok) {
        const releases = await releasesResp.json();
        if (Array.isArray(releases) && releases.length > 0) {
          const latest = releases[0];
          const cleanTag = (latest.tag_name || '1.0.0').replace(/^v/, '');
          const isNewer = compareSemver(cleanTag, APP_VERSION) > 0;
          return {
            currentVersion: APP_VERSION,
            latestVersion: cleanTag,
            releaseName: latest.name || `Release ${cleanTag}`,
            releaseNotes: latest.body || 'New enhancements for RailDraw Signalling.',
            publishedAt: latest.published_at || now,
            htmlUrl: latest.html_url || GITHUB_REPO_URL,
            apkDownloadUrl: null,
            isUpdateAvailable: isNewer,
            lastChecked: now,
            checkedVia: 'release',
          };
        }
      }
    }
  } catch (err) {
    console.warn('Network error checking GitHub updates:', err);
  }

  // Fallback / Up-to-date response
  const fallbackInfo: UpdateInfo = {
    currentVersion: APP_VERSION,
    latestVersion: APP_VERSION,
    releaseName: `RailDraw Signalling v${APP_VERSION}`,
    releaseNotes: 'You are on the latest production release.',
    publishedAt: now,
    htmlUrl: GITHUB_REPO_URL,
    apkDownloadUrl: null,
    isUpdateAvailable: false,
    lastChecked: now,
    checkedVia: 'mock',
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
