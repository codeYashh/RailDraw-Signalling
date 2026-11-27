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
    private static final String APP_ENTRY_URL = "https://appassets.androidplatform.net/assets/main.html";
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
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(1);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebViewClient(new AppWebViewClient(this));
        webView.setWebChromeClient(new WebChromeClient());
        webView.setDownloadListener(this);
        webView.addJavascriptInterface(new RailDrawBridge(this), "AndroidBridge");

        webView.loadUrl(APP_ENTRY_URL);
    }

    public void openUrl(String url) {
        if (url == null) return;
        String trimmed = url.trim();
        if (!trimmed.startsWith("https://")) return;
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(trimmed));
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

    public WebView getWebViewInstance() {
        return this.webView;
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
