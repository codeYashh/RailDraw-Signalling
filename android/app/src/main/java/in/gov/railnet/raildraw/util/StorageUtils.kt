package `in`.gov.railnet.raildraw.util

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

object StorageUtils {

    /**
     * Saves drawing Bitmap as high-quality JPEG (.jpg) to Pictures/RailDraw.
     */
    fun saveBitmapToGallery(context: Context, bitmap: Bitmap, title: String): Uri? {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val safeTitle = title.replace(Regex("[^a-zA-Z0-9_-]"), "_").take(32)
        val fileName = "${safeTitle}_${timeStamp}.jpg"

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
                put(MediaStore.MediaColumns.RELATIVE_PATH, "${Environment.DIRECTORY_PICTURES}/RailDraw")
                put(MediaStore.MediaColumns.IS_PENDING, 1)
            }

            val resolver = context.contentResolver
            val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)

            if (uri != null) {
                resolver.openOutputStream(uri)?.use { stream ->
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 95, stream)
                }
                contentValues.clear()
                contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0)
                resolver.update(uri, contentValues, null, null)
            }
            uri
        } else {
            val dir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "RailDraw")
            if (!dir.exists()) dir.mkdirs()
            val file = File(dir, fileName)
            FileOutputStream(file).use { out ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, 95, out)
            }
            Uri.fromFile(file)
        }
    }

    /**
     * Generates a standard A4 landscape PDF (842 x 595 pt) and saves it to Download/RailDraw.
     */
    fun saveAsPdf(context: Context, bitmap: Bitmap, title: String): Uri? {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val safeTitle = title.replace(Regex("[^a-zA-Z0-9_-]"), "_").take(32)
        val fileName = "${safeTitle}_A4_${timeStamp}.pdf"

        val pdfDocument = createA4Pdf(bitmap)

        val uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
                put(MediaStore.MediaColumns.RELATIVE_PATH, "${Environment.DIRECTORY_DOWNLOADS}/RailDraw")
                put(MediaStore.MediaColumns.IS_PENDING, 1)
            }
            val resolver = context.contentResolver
            val docUri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
            if (docUri != null) {
                resolver.openOutputStream(docUri)?.use { stream ->
                    pdfDocument.writeTo(stream)
                }
                contentValues.clear()
                contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0)
                resolver.update(docUri, contentValues, null, null)
            }
            docUri
        } else {
            val dir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "RailDraw")
            if (!dir.exists()) dir.mkdirs()
            val file = File(dir, fileName)
            FileOutputStream(file).use { out ->
                pdfDocument.writeTo(out)
            }
            Uri.fromFile(file)
        }

        pdfDocument.close()
        return uri
    }

    private fun createA4Pdf(bitmap: Bitmap): PdfDocument {
        val pdfDocument = PdfDocument()
        // Standard A4 landscape at 72 DPI: 842 x 595 pt (rendered at 2x for crispness)
        val pageWidth = 842
        val pageHeight = 595
        val pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, 1).create()
        val page = pdfDocument.startPage(pageInfo)

        val canvas = page.canvas
        val scaledBitmap = Bitmap.createScaledBitmap(bitmap, pageWidth, pageHeight, true)
        canvas.drawBitmap(scaledBitmap, 0f, 0f, null)
        pdfDocument.finishPage(page)
        return pdfDocument
    }

    /**
     * Shares the drawing as JPEG via Android system share sheet.
     */
    fun shareDrawing(context: Context, bitmap: Bitmap, promptText: String) {
        try {
            val cachePath = File(context.cacheDir, "shared_drawings").apply { mkdirs() }
            val file = File(cachePath, "raildraw_share.jpg")
            FileOutputStream(file).use { out ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, 95, out)
            }

            val contentUri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                putExtra(Intent.EXTRA_STREAM, contentUri)
                putExtra(
                    Intent.EXTRA_TEXT,
                    "Indian Railways Signalling Drawing (JPG) generated by RailDraw:\n$promptText"
                )
                type = "image/jpeg"
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            context.startActivity(Intent.createChooser(shareIntent, "Share Drawing (JPG)"))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Shares the drawing as an A4 PDF via Android system share sheet.
     */
    fun shareDrawingAsPdf(context: Context, bitmap: Bitmap, promptText: String) {
        try {
            val cachePath = File(context.cacheDir, "shared_drawings").apply { mkdirs() }
            val file = File(cachePath, "raildraw_share_A4.pdf")
            val pdfDocument = createA4Pdf(bitmap)
            FileOutputStream(file).use { out ->
                pdfDocument.writeTo(out)
            }
            pdfDocument.close()

            val contentUri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                putExtra(Intent.EXTRA_STREAM, contentUri)
                putExtra(
                    Intent.EXTRA_TEXT,
                    "Indian Railways Signalling Drawing (A4 PDF) generated by RailDraw:\n$promptText"
                )
                type = "application/pdf"
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            context.startActivity(Intent.createChooser(shareIntent, "Share Drawing (A4 PDF)"))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
