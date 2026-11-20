package in.gov.railnet.raildraw;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.ArrayList;

public class MainActivity extends Activity {
    public static final int REQ_VOICE_INPUT = 4012;
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        applySystemBarTheme(true);

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF07111F);
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

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new RailDrawBridge(this), "AndroidBridge");

        webView.loadUrl("file:///android_asset/main.html");
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
            webView.loadUrl("javascript:if(window.__onHardwareBack){window.__onHardwareBack();}else{window.history.back();}");
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }
}
