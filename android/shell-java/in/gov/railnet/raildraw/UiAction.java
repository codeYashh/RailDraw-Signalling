package in.gov.railnet.raildraw;

import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.view.Window;
import android.webkit.WebView;
import android.widget.Toast;

class UiAction implements Runnable {
    static final int MODE_THEME = 1;
    static final int MODE_VOICE_RESULT = 2;
    static final int MODE_TOAST = 3;
    static final int MODE_SHARE = 4;
    static final int MODE_START_VOICE = 5;
    static final int MODE_EXIT = 6;
    static final int MODE_HANDLE_BACK = 7;
    private static long lastBackPressTime = 0;

    private final int mode;
    private final MainActivity activity;
    private final WebView webView;
    private final boolean flag;
    private final String text;
    private final String extra;
    private final Uri uri;

    UiAction(int mode, MainActivity activity, WebView webView, boolean flag, String text, String extra, Uri uri) {
        this.mode = mode;
        this.activity = activity;
        this.webView = webView;
        this.flag = flag;
        this.text = text;
        this.extra = extra;
        this.uri = uri;
    }

    @Override
    public void run() {
        try {
            if (mode == MODE_THEME) {
                if (webView != null) {
                    webView.setBackgroundColor(flag ? 0xFF07111F : 0xFFF8FAFC);
                }
                Window w = activity.getWindow();
                if (w == null) return;
                if (flag) {
                    w.setStatusBarColor(0xFF07111F);
                    w.setNavigationBarColor(0xFF07111F);
                    View decor = w.getDecorView();
                    if (decor != null) decor.setSystemUiVisibility(0);
                } else {
                    w.setStatusBarColor(0xFFF4F6FA);
                    w.setNavigationBarColor(0xFFF4F6FA);
                    View decor = w.getDecorView();
                    if (decor != null) decor.setSystemUiVisibility(0x00002010);
                }
            } else if (mode == MODE_VOICE_RESULT) {
                if (webView == null || text == null) return;
                String escaped = text
                    .replace("\\", "\\\\")
                    .replace("'", "\\'")
                    .replace("\n", " ")
                    .replace("\r", " ");
                webView.evaluateJavascript(
                    "if (window.__onAndroidVoiceResult) { window.__onAndroidVoiceResult('" + escaped + "'); }",
                    null
                );
            } else if (mode == MODE_TOAST) {
                Toast.makeText(activity, text, Toast.LENGTH_SHORT).show();
            } else if (mode == MODE_SHARE) {
                String mimeType = (extra != null && !extra.isEmpty()) ? extra : "image/png";
                Intent shareIntent = new Intent("android.intent.action.SEND");
                shareIntent.setType(mimeType);
                shareIntent.putExtra("android.intent.extra.STREAM", uri);
                if (text != null && !text.isEmpty()) {
                    shareIntent.putExtra("android.intent.extra.TEXT", text);
                }
                if (uri != null) {
                    shareIntent.setClipData(ClipData.newRawUri("", uri));
                }
                shareIntent.addFlags(1); // FLAG_GRANT_READ_URI_PERMISSION
                String chooserTitle = "application/pdf".equals(mimeType)
                    ? "Share RailDraw PDF"
                    : "Share RailDraw Image";
                Intent chooser = Intent.createChooser(shareIntent, chooserTitle);
                chooser.addFlags(1); // FLAG_GRANT_READ_URI_PERMISSION
                activity.startActivity(chooser);
            } else if (mode == MODE_START_VOICE) {
                Intent intent = new Intent("android.speech.action.RECOGNIZE_SPEECH");
                intent.putExtra("android.speech.extra.LANGUAGE_MODEL", "free_form");
                intent.putExtra("android.speech.extra.LANGUAGE", (text != null && !text.isEmpty()) ? text : "en-IN");
                intent.putExtra("android.speech.extra.PROMPT", "Speak your signalling cable route...");
                activity.startActivityForResult(intent, MainActivity.REQ_VOICE_INPUT);
            } else if (mode == MODE_EXIT) {
                if (activity != null) {
                    activity.finishAffinity();
                }
            } else if (mode == MODE_HANDLE_BACK) {
                if (activity != null) {
                    long now = System.currentTimeMillis();
                    if (now - lastBackPressTime < 2000) {
                        activity.finishAffinity();
                    } else {
                        lastBackPressTime = now;
                        Toast.makeText(activity, "Press back again to exit", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        } catch (Throwable t) {
            if (mode == MODE_START_VOICE) {
                try {
                    Toast.makeText(activity, "Voice input unavailable on this device", Toast.LENGTH_SHORT).show();
                } catch (Throwable ignored2) {
                }
            } else if (mode == MODE_SHARE) {
                try {
                    Toast.makeText(activity, "Could not open share sheet: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                } catch (Throwable ignored2) {
                }
            }
        }
    }
}
