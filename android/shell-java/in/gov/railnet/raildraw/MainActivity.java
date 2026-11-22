package in.gov.railnet.raildraw;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.DownloadListener;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import java.util.ArrayList;

public class MainActivity extends Activity implements DownloadListener {
    public static final int REQ_VOICE_INPUT = 4012;
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        boolean isDark = false;
        try {
            isDark = getSharedPreferences("raildraw_prefs", 0).getBoolean("is_dark", false);
        } catch (Throwable ignored) {}

        applySystemBarTheme(isDark);

        webView = new WebView(this);
        webView.setBackgroundColor(isDark ? 0xFF07111F : 0xFFF8FAFC);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebViewClient(new AppWebViewClient(this));
        webView.setWebChromeClient(new WebChromeClient());
        webView.setDownloadListener(this);
        webView.addJavascriptInterface(new RailDrawBridge(this), "AndroidBridge");

        webView.loadUrl("file:///android_asset/main.html");
    }

    public void openUrl(String url) {
        if (url == null || url.trim().isEmpty()) return;
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (Throwable ignored) {
        }
    }

    @Override
    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
        openUrl(url);
    }

    public void applySystemBarTheme(boolean isDark) {
        runOnUiThread(new UiAction(UiAction.MODE_THEME, this, webView, isDark, null, null, null));
    }

    public void dispatchVoiceResult(String text) {
        runOnUiThread(new UiAction(UiAction.MODE_VOICE_RESULT, this, webView, false, text, null, null));
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_VOICE_INPUT && resultCode == Activity.RESULT_OK && data != null) {
            ArrayList<String> results = data.getStringArrayListExtra("android.speech.extra.RESULTS");
            if (results != null && !results.isEmpty()) {
                dispatchVoiceResult(results.get(0));
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            // Safely evaluate back hook without navigating WebView or loading about:blank
            webView.evaluateJavascript("if(window.__onHardwareBack){window.__onHardwareBack();}", null);
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }
}
