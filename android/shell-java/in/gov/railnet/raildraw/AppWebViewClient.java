package in.gov.railnet.raildraw;

import android.content.res.AssetManager;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.InputStream;

public class AppWebViewClient extends WebViewClient {
    private static final String ASSET_HOST = "appassets.androidplatform.net";
    private final MainActivity activity;

    public AppWebViewClient(MainActivity activity) {
        this.activity = activity;
    }

    private String guessMimeType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html";
        if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".json") || lower.endsWith(".webmanifest")) return "application/json";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        if (request == null || request.getUrl() == null) return null;
        Uri url = request.getUrl();
        if (!ASSET_HOST.equalsIgnoreCase(url.getHost())) {
            return null;
        }
        String path = url.getPath();
        if (path == null) return null;
        if (path.startsWith("/assets/")) {
            path = path.substring("/assets/".length());
        } else if (path.startsWith("/")) {
            path = path.substring(1);
        }
        if (path.isEmpty()) {
            path = "main.html";
        }
        if (path.contains("..")) {
            return null;
        }
        try {
            AssetManager am = activity.getAssets();
            InputStream stream = am.open(path);
            String mime = guessMimeType(path);
            String encoding = (mime.startsWith("text/") || mime.equals("application/javascript") || mime.equals("application/json") || mime.equals("image/svg+xml"))
                ? "UTF-8"
                : null;
            return new WebResourceResponse(mime, encoding, stream);
        } catch (Throwable ignored) {
            return null;
        }
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        if (url != null && url.startsWith("https://" + ASSET_HOST + "/")) {
            return false;
        }
        if (url != null && url.startsWith("https://")) {
            activity.openUrl(url);
            return true;
        }
        return true;
    }
}
