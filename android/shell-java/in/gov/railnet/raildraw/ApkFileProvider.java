package in.gov.railnet.raildraw;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import java.io.File;
import java.io.FileNotFoundException;

public class ApkFileProvider extends ContentProvider {
    @Override
    public boolean onCreate() {
        return true;
    }

    private File resolveApkFile(Uri uri) {
        Context ctx = getContext();
        if (ctx == null || uri == null) return null;
        String name = uri.getLastPathSegment();
        if (name == null || name.trim().isEmpty()) return null;
        String safe = new File(name).getName();
        File updatesDir = new File(ctx.getCacheDir(), "updates");
        return new File(updatesDir, safe);
    }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        File file = resolveApkFile(uri);
        if (file == null || !file.exists()) {
            throw new FileNotFoundException("Update APK not found: " + uri);
        }
        return ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override
    public String getType(Uri uri) {
        return "application/vnd.android.package-archive";
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
        File file = resolveApkFile(uri);
        String[] cols = new String[] { "_display_name", "_size" };
        MatrixCursor cursor = new MatrixCursor(cols);
        if (file != null && file.exists()) {
            cursor.addRow(new Object[] { file.getName(), Long.valueOf(file.length()) });
        }
        return cursor;
    }

    @Override
    public Uri insert(Uri uri, ContentValues values) {
        return null;
    }

    @Override
    public int delete(Uri uri, String selection, String[] selectionArgs) {
        return 0;
    }

    @Override
    public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) {
        return 0;
    }
}
