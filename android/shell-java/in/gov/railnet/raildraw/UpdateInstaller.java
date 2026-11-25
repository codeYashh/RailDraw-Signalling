package in.gov.railnet.raildraw;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.webkit.WebView;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;

class UpdateInstaller {
    static void dispatchProgress(MainActivity activity, WebView webView, int percent, String status, boolean done, boolean error) {
        activity.runOnUiThread(new ProgressRunnable(webView, percent, status, done, error));
    }

    static void startDownload(MainActivity activity, WebView webView, String apkUrl) {
        new Thread(new DownloadRunnable(activity, webView, apkUrl), "RailDraw-OTA-Downloader").start();
    }

    static void installApk(MainActivity activity, WebView webView, File apkFile) {
        activity.runOnUiThread(new InstallRunnable(activity, webView, apkFile));
    }

    private static class ProgressRunnable implements Runnable {
        private final WebView webView;
        private final int percent;
        private final String status;
        private final boolean done;
        private final boolean error;

        ProgressRunnable(WebView webView, int percent, String status, boolean done, boolean error) {
            this.webView = webView;
            this.percent = percent;
            this.status = status;
            this.done = done;
            this.error = error;
        }

        @Override
        public void run() {
            if (webView == null) return;
            String safeStatus = (status == null ? "" : status)
                .replace("\\", "\\\\")
                .replace("'", "\\'")
                .replace("\n", " ")
                .replace("\r", " ");
            String js = "if(window.__onUpdateDownloadProgress){window.__onUpdateDownloadProgress("
                + percent + ",'" + safeStatus + "'," + done + "," + error + ");}";
            webView.evaluateJavascript(js, null);
        }
    }

    private static class InstallRunnable implements Runnable {
        private final MainActivity activity;
        private final WebView webView;
        private final File apkFile;

        InstallRunnable(MainActivity activity, WebView webView, File apkFile) {
            this.activity = activity;
            this.webView = webView;
            this.apkFile = apkFile;
        }

        @Override
        public void run() {
            if (apkFile == null || !apkFile.exists()) {
                dispatchProgress(activity, webView, 0, "Downloaded APK file is missing.", true, true);
                return;
            }
            try {
                if (Build.VERSION.SDK_INT >= 26 && !activity.getPackageManager().canRequestPackageInstalls()) {
                    activity.setPendingInstallApk(apkFile);
                    dispatchProgress(
                        activity,
                        webView,
                        100,
                        "Allow 'Install unknown apps' for RailDraw, then return to install.",
                        false,
                        false
                    );
                    Intent permIntent = new Intent(
                        "android.settings.MANAGE_UNKNOWN_APP_SOURCES",
                        Uri.parse("package:" + activity.getPackageName())
                    );
                    permIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    activity.startActivity(permIntent);
                    return;
                }
                activity.setPendingInstallApk(null);
                Uri contentUri = Uri.parse("content://com.raildraw.app.apkprovider/" + apkFile.getName());
                Intent installIntent = new Intent(Intent.ACTION_VIEW);
                installIntent.setDataAndType(contentUri, "application/vnd.android.package-archive");
                installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | 1);
                activity.startActivity(installIntent);
                dispatchProgress(activity, webView, 100, "Installer opened! Tap Install to update.", true, false);
            } catch (Throwable t) {
                dispatchProgress(activity, webView, 0, "Could not launch installer: " + t.getMessage(), true, true);
            }
        }
    }

    private static class DownloadRunnable implements Runnable {
        private final MainActivity activity;
        private final WebView webView;
        private final String apkUrl;

        DownloadRunnable(MainActivity activity, WebView webView, String apkUrl) {
            this.activity = activity;
            this.webView = webView;
            this.apkUrl = apkUrl;
        }

        @Override
        public void run() {
            HttpURLConnection conn = null;
            InputStream in = null;
            FileOutputStream out = null;
            try {
                dispatchProgress(activity, webView, 2, "Connecting to update server...", false, false);
                String currentUrl = apkUrl.trim();
                int redirects = 0;
                while (redirects < 6) {
                    URL url = new URL(currentUrl);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setInstanceFollowRedirects(false);
                    conn.setConnectTimeout(15000);
                    conn.setReadTimeout(30000);
                    conn.setRequestProperty("User-Agent", "RailDraw-Android-OTA/1.6");
                    int code = conn.getResponseCode();
                    if (code == 301 || code == 302 || code == 303 || code == 307 || code == 308) {
                        String next = conn.getHeaderField("Location");
                        conn.disconnect();
                        if (next == null || next.trim().isEmpty()) {
                            throw new Exception("Empty redirect location");
                        }
                        currentUrl = next;
                        redirects++;
                        continue;
                    }
                    if (code < 200 || code >= 300) {
                        throw new Exception("Server returned HTTP " + code);
                    }
                    break;
                }

                long totalBytes = conn.getContentLengthLong();
                File updatesDir = new File(activity.getCacheDir(), "updates");
                if (!updatesDir.exists()) updatesDir.mkdirs();
                File tmpFile = new File(updatesDir, "RailDraw-update.apk.part");
                File outFile = new File(updatesDir, "RailDraw-update.apk");
                if (tmpFile.exists()) tmpFile.delete();

                in = conn.getInputStream();
                out = new FileOutputStream(tmpFile);
                byte[] buf = new byte[16384];
                long downloaded = 0;
                int lastPercent = -1;
                long lastEmitMs = 0;
                int read;
                while ((read = in.read(buf)) != -1) {
                    out.write(buf, 0, read);
                    downloaded += read;
                    long now = System.currentTimeMillis();
                    int pct = totalBytes > 0
                        ? (int) Math.min(99L, (downloaded * 100L) / totalBytes)
                        : (int) Math.min(95L, 10L + (downloaded / (200L * 1024L)));
                    if (pct != lastPercent && (now - lastEmitMs >= 150 || pct >= 99)) {
                        lastPercent = pct;
                        lastEmitMs = now;
                        String mbDone = String.format(Locale.US, "%.1f", downloaded / (1024.0 * 1024.0));
                        String status = totalBytes > 0
                            ? "Downloading update... " + pct + "% (" + mbDone + " / " + String.format(Locale.US, "%.1f", totalBytes / (1024.0 * 1024.0)) + " MB)"
                            : "Downloading update... " + mbDone + " MB";
                        dispatchProgress(activity, webView, pct, status, false, false);
                    }
                }
                out.flush();
                out.close();
                out = null;
                in.close();
                in = null;

                if (tmpFile.length() < 100 * 1024) {
                    throw new Exception("Downloaded file is too small to be a valid APK");
                }
                if (outFile.exists()) outFile.delete();
                if (!tmpFile.renameTo(outFile)) {
                    throw new Exception("Could not finalize update APK file");
                }

                dispatchProgress(activity, webView, 100, "Verifying package & opening installer...", false, false);
                installApk(activity, webView, outFile);
            } catch (Throwable t) {
                dispatchProgress(
                    activity,
                    webView,
                    0,
                    "Update download failed: " + (t.getMessage() != null ? t.getMessage() : "Network error"),
                    true,
                    true
                );
            } finally {
                if (out != null) { try { out.close(); } catch (Throwable ignored) {} }
                if (in != null) { try { in.close(); } catch (Throwable ignored) {} }
                if (conn != null) { try { conn.disconnect(); } catch (Throwable ignored) {} }
            }
        }
    }
}
