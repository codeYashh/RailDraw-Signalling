import os
import shutil
import subprocess
import tempfile

STUBS = {
    "android/os/Parcelable.java": """
package android.os;
public interface Parcelable {}
""",
    "android/os/Bundle.java": """
package android.os;
public class Bundle {}
""",
    "android/os/Build.java": """
package android.os;
public class Build {
    public static class VERSION {
        public static final int SDK_INT;
        static { SDK_INT = 0; }
    }
}
""",
    "android/os/Environment.java": """
package android.os;
import java.io.File;
public class Environment {
    public static File getExternalStoragePublicDirectory(String type) { return null; }
}
""",
    "android/net/Uri.java": """
package android.net;
import android.os.Parcelable;
import java.io.File;
public abstract class Uri implements Parcelable {
    public static Uri fromFile(File file) { return null; }
    public static Uri parse(String uriString) { return null; }
}
""",
    "android/content/Context.java": """
package android.content;
public class Context {
    public ContentResolver getContentResolver() { return null; }
    public SharedPreferences getSharedPreferences(String name, int mode) { return null; }
}
""",
    "android/content/SharedPreferences.java": """
package android.content;
public interface SharedPreferences {
    public interface Editor {
        Editor putBoolean(String key, boolean value);
        void apply();
    }
    Editor edit();
    boolean getBoolean(String key, boolean defValue);
}
""",
    "android/content/ContentValues.java": """
package android.content;
public final class ContentValues {
    public ContentValues() {}
    public void put(String key, String value) {}
    public void put(String key, Integer value) {}
}
""",
    "android/content/ContentResolver.java": """
package android.content;
import android.net.Uri;
import java.io.FileNotFoundException;
import java.io.OutputStream;
public abstract class ContentResolver {
    public final Uri insert(Uri url, ContentValues values) { return null; }
    public final OutputStream openOutputStream(Uri uri) throws FileNotFoundException { return null; }
    public final int update(Uri uri, ContentValues values, String where, String[] selectionArgs) { return 0; }
    public final int delete(Uri url, String where, String[] selectionArgs) { return 0; }
}
""",
    "android/content/ClipData.java": """
package android.content;
import android.net.Uri;
public class ClipData {
    public static ClipData newRawUri(CharSequence label, Uri uri) { return null; }
}
""",
    "android/content/Intent.java": """
package android.content;
import android.net.Uri;
import android.os.Parcelable;
import java.util.ArrayList;
public class Intent {
    public static final String ACTION_VIEW = "android.intent.action.VIEW";
    public static final int FLAG_ACTIVITY_NEW_TASK = 0x10000000;
    public Intent(String action) {}
    public Intent(String action, Uri uri) {}
    public Intent setType(String type) { return this; }
    public Intent putExtra(String name, String value) { return this; }
    public Intent putExtra(String name, Parcelable value) { return this; }
    public void setClipData(ClipData clip) {}
    public Intent addFlags(int flags) { return this; }
    public ArrayList<String> getStringArrayListExtra(String name) { return null; }
    public static Intent createChooser(Intent target, CharSequence title) { return null; }
}
""",
    "android/provider/MediaStore.java": """
package android.provider;
import android.net.Uri;
public final class MediaStore {
    public static final class Images {
        public static final class Media {
            public static final Uri EXTERNAL_CONTENT_URI;
            static { EXTERNAL_CONTENT_URI = null; }
        }
    }
    public static final class Downloads {
        public static final Uri EXTERNAL_CONTENT_URI;
        static { EXTERNAL_CONTENT_URI = null; }
    }
}
""",
    "android/media/MediaScannerConnection.java": """
package android.media;
import android.content.Context;
import android.net.Uri;
public class MediaScannerConnection {
    public interface OnScanCompletedListener {
        void onScanCompleted(String path, Uri uri);
    }
    public static void scanFile(Context context, String[] paths, String[] mimeTypes, OnScanCompletedListener callback) {}
}
""",
    "android/util/Base64.java": """
package android.util;
public class Base64 {
    public static final int DEFAULT = 0;
    public static byte[] decode(String str, int flags) { return null; }
}
""",
    "android/view/View.java": """
package android.view;
import android.content.Context;
public class View {
    public View(Context context) {}
    public void setBackgroundColor(int color) {}
    public void setSystemUiVisibility(int visibility) {}
}
""",
    "android/view/Window.java": """
package android.view;
public abstract class Window {
    public abstract void setStatusBarColor(int color);
    public abstract void setNavigationBarColor(int color);
    public abstract View getDecorView();
}
""",
    "android/app/Activity.java": """
package android.app;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
public class Activity extends Context {
    public static final int RESULT_OK = -1;
    protected void onCreate(Bundle savedInstanceState) {}
    public void setContentView(View view) {}
    public void finishAffinity() {}
    public void finish() {}
    public void onBackPressed() {}
    protected void onDestroy() {}
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {}
    public void startActivity(Intent intent) {}
    public void startActivityForResult(Intent intent, int requestCode) {}
    public final void runOnUiThread(Runnable action) {}
    public Window getWindow() { return null; }
}
""",
    "android/widget/Toast.java": """
package android.widget;
import android.content.Context;
public class Toast {
    public static final int LENGTH_SHORT = 0;
    public static final int LENGTH_LONG = 1;
    public static Toast makeText(Context context, CharSequence text, int duration) { return null; }
    public void show() {}
}
""",
    "android/webkit/ValueCallback.java": """
package android.webkit;
public interface ValueCallback<T> {
    void onReceiveValue(T value);
}
""",
    "android/webkit/JavascriptInterface.java": """
package android.webkit;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface JavascriptInterface {}
""",
    "android/webkit/WebSettings.java": """
package android.webkit;
public abstract class WebSettings {
    public abstract void setJavaScriptEnabled(boolean flag);
    public abstract void setDomStorageEnabled(boolean flag);
    public abstract void setDatabaseEnabled(boolean flag);
    public abstract void setAllowFileAccess(boolean allow);
    public abstract void setAllowContentAccess(boolean allow);
    public abstract void setAllowFileAccessFromFileURLs(boolean flag);
    public abstract void setAllowUniversalAccessFromFileURLs(boolean flag);
    public abstract void setMediaPlaybackRequiresUserGesture(boolean require);
}
""",
    "android/webkit/DownloadListener.java": """
package android.webkit;
public interface DownloadListener {
    void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength);
}
""",
    "android/webkit/WebViewClient.java": """
package android.webkit;
public class WebViewClient {
    public WebViewClient() {}
    public boolean shouldOverrideUrlLoading(WebView view, String url) { return false; }
}
""",
    "android/webkit/WebChromeClient.java": """
package android.webkit;
public class WebChromeClient {
    public WebChromeClient() {}
}
""",
    "android/webkit/WebView.java": """
package android.webkit;
import android.content.Context;
import android.view.View;
public class WebView extends View {
    public WebView(Context context) { super(context); }
    public WebSettings getSettings() { return null; }
    public void setWebViewClient(WebViewClient client) {}
    public void setWebChromeClient(WebChromeClient client) {}
    public void setDownloadListener(DownloadListener listener) {}
    public void addJavascriptInterface(Object object, String name) {}
    public void loadUrl(String url) {}
    public void evaluateJavascript(String script, ValueCallback<String> resultCallback) {}
    public boolean canGoBack() { return false; }
    public void goBack() {}
}
""",
}

def build_dex(output_dex_path: str):
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    src_root = os.path.join(root, "android", "shell-java")
    d8_jar = os.path.join(root, "tools", "android-14", "lib", "d8.jar")

    tmp = tempfile.mkdtemp(prefix="raildraw_dex_")
    try:
        stub_src_dir = os.path.join(tmp, "stub_src")
        stub_cls_dir = os.path.join(tmp, "stub_cls")
        app_cls_dir = os.path.join(tmp, "app_cls")
        dex_out_dir = os.path.join(tmp, "dex_out")
        os.makedirs(stub_cls_dir, exist_ok=True)
        os.makedirs(app_cls_dir, exist_ok=True)
        os.makedirs(dex_out_dir, exist_ok=True)

        # 1. Write & compile compile-time Android SDK stubs
        stub_files = []
        for rel, code in STUBS.items():
            fpath = os.path.join(stub_src_dir, rel)
            os.makedirs(os.path.dirname(fpath), exist_ok=True)
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(code.strip() + "\n")
            stub_files.append(fpath)

        subprocess.run(
            ["javac", "--release", "8", "-d", stub_cls_dir] + stub_files,
            check=True,
        )

        # 2. Compile our actual Android shell Java sources
        app_java = [
            os.path.join(src_root, "in", "gov", "railnet", "raildraw", "UiAction.java"),
            os.path.join(src_root, "in", "gov", "railnet", "raildraw", "AppWebViewClient.java"),
            os.path.join(src_root, "in", "gov", "railnet", "raildraw", "MainActivity.java"),
            os.path.join(src_root, "in", "gov", "railnet", "raildraw", "RailDrawBridge.java"),
        ]
        subprocess.run(
            ["javac", "--release", "8", "-cp", stub_cls_dir, "-d", app_cls_dir] + app_java,
            check=True,
        )

        # Collect compiled app .class files (including inner Runnable classes)
        app_classes = []
        for r, _, files in os.walk(app_cls_dir):
            for fn in files:
                if fn.endswith(".class"):
                    app_classes.append(os.path.join(r, fn))
        assert app_classes, "No .class files compiled!"

        # 3. Run Android 14 D8 to produce classes.dex
        subprocess.run(
            [
                "java", "-cp", d8_jar, "com.android.tools.r8.D8",
                "--release",
                "--no-desugaring",
                "--min-api", "24",
                "--output", dex_out_dir,
            ] + app_classes,
            check=True,
        )

        built_dex = os.path.join(dex_out_dir, "classes.dex")
        os.makedirs(os.path.dirname(os.path.abspath(output_dex_path)), exist_ok=True)
        shutil.copy2(built_dex, output_dex_path)
        print(f"OK: Built clean native classes.dex ({os.path.getsize(output_dex_path):,} bytes) from {len(app_classes)} class files!")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

if __name__ == "__main__":
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    build_dex(os.path.join(root, "android", "shell-java", "classes.dex"))
