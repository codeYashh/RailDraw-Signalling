package in.gov.railnet.raildraw;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class RailDrawBridge {
    private final MainActivity activity;

    public RailDrawBridge(MainActivity activity) {
        this.activity = activity;
    }

    private byte[] decodeBase64Payload(String base64Input) {
        if (base64Input == null) return new byte[0];
        String clean = base64Input;
        int comma = clean.indexOf(',');
        if (comma >= 0) {
            clean = clean.substring(comma + 1);
        }
        return Base64.decode(clean, Base64.DEFAULT);
    }

    private String sanitizeFileName(String name, String defaultExt) {
        if (name == null || name.trim().isEmpty()) {
            return "RailDraw_" + System.currentTimeMillis() + defaultExt;
        }
        String safe = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (!safe.toLowerCase().endsWith(defaultExt)) {
            safe = safe + defaultExt;
        }
        return safe;
    }

    private void showToast(String message) {
        activity.runOnUiThread(new UiAction(UiAction.MODE_TOAST, activity, null, false, message, null, null));
    }

    private Uri writePngToGallery(byte[] bytes, String fileName) throws Exception {
        if (Build.VERSION.SDK_INT >= 29) {
            ContentResolver resolver = activity.getContentResolver();
            ContentValues values = new ContentValues();
            values.put("_display_name", fileName);
            values.put("mime_type", "image/png");
            values.put("relative_path", "Pictures/RailDraw");
            values.put("is_pending", Integer.valueOf(1));

            Uri uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
            if (uri == null) {
                throw new Exception("MediaStore insert returned null");
            }
            OutputStream out = null;
            try {
                out = resolver.openOutputStream(uri);
                if (out == null) {
                    throw new Exception("Unable to open output stream");
                }
                out.write(bytes);
                out.flush();
            } catch (Exception e) {
                try { resolver.delete(uri, null, null); } catch (Throwable ignored) {}
                throw e;
            } finally {
                if (out != null) {
                    try { out.close(); } catch (Throwable ignored) {}
                }
            }

            ContentValues publish = new ContentValues();
            publish.put("is_pending", Integer.valueOf(0));
            resolver.update(uri, publish, null, null);
            return uri;
        } else {
            File picDir = Environment.getExternalStoragePublicDirectory("Pictures");
            File railDir = new File(picDir, "RailDraw");
            if (!railDir.exists()) railDir.mkdirs();
            File outFile = new File(railDir, fileName);
            FileOutputStream fos = new FileOutputStream(outFile);
            try {
                fos.write(bytes);
                fos.flush();
            } finally {
                fos.close();
            }
            MediaScannerConnection.scanFile(
                activity,
                new String[] { outFile.getAbsolutePath() },
                new String[] { "image/png" },
                null
            );
            return Uri.fromFile(outFile);
        }
    }

    private Uri writePdfToDownloads(byte[] bytes, String fileName) throws Exception {
        if (Build.VERSION.SDK_INT >= 29) {
            ContentResolver resolver = activity.getContentResolver();
            ContentValues values = new ContentValues();
            values.put("_display_name", fileName);
            values.put("mime_type", "application/pdf");
            values.put("relative_path", "Download/RailDraw");
            values.put("is_pending", Integer.valueOf(1));

            Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (uri == null) {
                throw new Exception("MediaStore Downloads insert returned null");
            }
            OutputStream out = null;
            try {
                out = resolver.openOutputStream(uri);
                if (out == null) {
                    throw new Exception("Unable to open PDF output stream");
                }
                out.write(bytes);
                out.flush();
            } catch (Exception e) {
                try { resolver.delete(uri, null, null); } catch (Throwable ignored) {}
                throw e;
            } finally {
                if (out != null) {
                    try { out.close(); } catch (Throwable ignored) {}
                }
            }

            ContentValues publish = new ContentValues();
            publish.put("is_pending", Integer.valueOf(0));
            resolver.update(uri, publish, null, null);
            return uri;
        } else {
            File dlDir = Environment.getExternalStoragePublicDirectory("Download");
            File railDir = new File(dlDir, "RailDraw");
            if (!railDir.exists()) railDir.mkdirs();
            File outFile = new File(railDir, fileName);
            FileOutputStream fos = new FileOutputStream(outFile);
            try {
                fos.write(bytes);
                fos.flush();
            } finally {
                fos.close();
            }
            MediaScannerConnection.scanFile(
                activity,
                new String[] { outFile.getAbsolutePath() },
                new String[] { "application/pdf" },
                null
            );
            return Uri.fromFile(outFile);
        }
    }

    @JavascriptInterface
    public String saveImageToGallery(String base64Png, String fileName) {
        try {
            byte[] bytes = decodeBase64Payload(base64Png);
            if (bytes.length == 0) return "ERR:Empty image data";
            String safeName = sanitizeFileName(fileName, ".png");
            writePngToGallery(bytes, safeName);
            showToast("Saved Image to Pictures/RailDraw");
            return "OK:Pictures/RailDraw/" + safeName;
        } catch (Throwable t) {
            showToast("Save error: " + t.getMessage());
            return "ERR:" + t.getMessage();
        }
    }

    @JavascriptInterface
    public String savePdfToDownloads(String base64Pdf, String fileName) {
        try {
            byte[] bytes = decodeBase64Payload(base64Pdf);
            if (bytes.length == 0) return "ERR:Empty PDF data";
            String safeName = sanitizeFileName(fileName, ".pdf");
            writePdfToDownloads(bytes, safeName);
            showToast("Saved PDF to Download/RailDraw");
            return "OK:Download/RailDraw/" + safeName;
        } catch (Throwable t) {
            showToast("PDF save error: " + t.getMessage());
            return "ERR:" + t.getMessage();
        }
    }

    @JavascriptInterface
    public String shareImage(String base64Png, String fileName, String shareText) {
        try {
            byte[] bytes = decodeBase64Payload(base64Png);
            if (bytes.length == 0) return "ERR:Empty image data";
            String safeName = sanitizeFileName(fileName, ".png");
            Uri imageUri = writePngToGallery(bytes, safeName);
            String caption = shareText != null ? shareText : "RailDraw Signalling Drawing";
            activity.runOnUiThread(
                new UiAction(UiAction.MODE_SHARE, activity, null, false, caption, "image/png", imageUri)
            );
            return "OK:SharedImage";
        } catch (Throwable t) {
            showToast("Share image error: " + t.getMessage());
            return "ERR:" + t.getMessage();
        }
    }

    @JavascriptInterface
    public String sharePdf(String base64Pdf, String fileName, String shareText) {
        try {
            byte[] bytes = decodeBase64Payload(base64Pdf);
            if (bytes.length == 0) return "ERR:Empty PDF data";
            String safeName = sanitizeFileName(fileName, ".pdf");
            Uri pdfUri = writePdfToDownloads(bytes, safeName);
            String caption = shareText != null ? shareText : "RailDraw Signalling Drawing (A3 PDF)";
            activity.runOnUiThread(
                new UiAction(UiAction.MODE_SHARE, activity, null, false, caption, "application/pdf", pdfUri)
            );
            return "OK:SharedPdf";
        } catch (Throwable t) {
            showToast("Share PDF error: " + t.getMessage());
            return "ERR:" + t.getMessage();
        }
    }

    @JavascriptInterface
    public void startVoiceInput(String langTag) {
        activity.runOnUiThread(new UiAction(UiAction.MODE_START_VOICE, activity, null, false, langTag, null, null));
    }

    @JavascriptInterface
    public void setThemeMode(boolean isDark) {
        activity.applySystemBarTheme(isDark);
    }

    @JavascriptInterface
    public boolean isNativeAndroid() {
        return true;
    }

    @JavascriptInterface
    public void handleAppExit() {
        activity.runOnUiThread(new UiAction(UiAction.MODE_HANDLE_BACK, activity, null, false, null, null, null));
    }

    @JavascriptInterface
    public void exitApp() {
        activity.runOnUiThread(new UiAction(UiAction.MODE_EXIT, activity, null, false, null, null, null));
    }
}
