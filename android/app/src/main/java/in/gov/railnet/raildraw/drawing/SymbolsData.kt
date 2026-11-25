package `in`.gov.railnet.raildraw.drawing

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF

/**
 * Indian Railways Signalling Symbol Library
 *
 * NOTE: All symbols defined in this file are structured as interchangeable data-driven definitions
 * to be verified against official Railway standards (IRSEM Part II / RDSO Standard Signalling Drawings).
 * They can be swapped with official SVG vector drawables or official CAD blocks without modifying
 * the core rendering pipeline.
 */
object SymbolsData {

    data class SymbolDefinition(
        val id: String,
        val name: String,
        val rdsoReference: String,
        val category: String,
        val verificationStatus: String = "to be verified against official Railway standards",
        val defaultWidth: Float = 48f,
        val defaultHeight: Float = 48f,
        val draw: (Canvas, Float, Float, Float, Paint) -> Unit
    )

    // Location Box (Apparatus Case) - Indian Railways Standard
    val LOCATION_BOX = SymbolDefinition(
        id = "location_box_single",
        name = "Single Location Box",
        rdsoReference = "RDSO/SIG/SK/LB-01 (IRSEM II 15.6)",
        category = "Enclosures",
        draw = { canvas, cx, cy, size, paint ->
            val w = size * 0.9f
            val h = size * 1.1f
            val left = cx - w / 2f
            val top = cy - h / 2f
            val right = cx + w / 2f
            val bottom = cy + h / 2f

            // Fill Box Body
            val fillPaint = Paint(paint).apply {
                style = Paint.Style.FILL
                color = Color.parseColor("#E2E8F0")
            }
            canvas.drawRect(left, top, right, bottom, fillPaint)

            // Outline Box Body
            val strokePaint = Paint(paint).apply {
                style = Paint.Style.STROKE
                strokeWidth = 3f
                color = Color.parseColor("#0F172A")
            }
            canvas.drawRect(left, top, right, bottom, strokePaint)

            // Slanted Railway Roof
            val roofPaint = Paint(strokePaint).apply { strokeWidth = 4f }
            canvas.drawLine(left - 4f, top, right + 4f, top, roofPaint)

            // Inner cross indicating apparatus compartment
            val crossPaint = Paint(strokePaint).apply { strokeWidth = 1.5f; color = Color.parseColor("#64748B") }
            canvas.drawLine(left, top, right, bottom, crossPaint)
            canvas.drawLine(left, bottom, right, top, crossPaint)

            // Concrete Foundation Pad
            val padPaint = Paint(strokePaint).apply { strokeWidth = 4f; color = Color.parseColor("#475569") }
            canvas.drawLine(left - 6f, bottom + 3f, right + 6f, bottom + 3f, padPaint)
        }
    )

    // Route Cable Marker Post
    val CABLE_MARKER = SymbolDefinition(
        id = "cable_marker_route",
        name = "Cable Route Marker Post",
        rdsoReference = "RDSO/SIG/SK/CMP-01 (IRSEM II 15.7)",
        category = "Route",
        draw = { canvas, cx, cy, size, paint ->
            val stroke = Paint(paint).apply {
                style = Paint.Style.STROKE
                strokeWidth = 3f
                color = Color.parseColor("#0F172A")
            }
            // Triangular Marker Post
            val path = android.graphics.Path().apply {
                moveTo(cx, cy - size / 2f)
                lineTo(cx + size / 2f, cy + size / 2f)
                lineTo(cx - size / 2f, cy + size / 2f)
                close()
            }
            val fill = Paint(paint).apply {
                style = Paint.Style.FILL
                color = Color.parseColor("#F1A208")
            }
            canvas.drawPath(path, fill)
            canvas.drawPath(path, stroke)
        }
    )

    // Earth Pit
    val EARTH_PIT = SymbolDefinition(
        id = "earth_pit",
        name = "Maintenance Free Earth Pit",
        rdsoReference = "RDSO/SPN/197/2008 (IRSEM 19)",
        category = "Surge & Earth",
        draw = { canvas, cx, cy, size, paint ->
            val stroke = Paint(paint).apply {
                style = Paint.Style.STROKE
                strokeWidth = 3f
                color = Color.parseColor("#0F172A")
            }
            // Vertical rod
            canvas.drawLine(cx, cy - size / 2f, cx, cy + size / 6f, stroke)
            // 3 horizontal earth lines
            canvas.drawLine(cx - size / 2f, cy + size / 6f, cx + size / 2f, cy + size / 6f, stroke)
            canvas.drawLine(cx - size / 3f, cy + size / 3f, cx + size / 3f, cy + size / 3f, stroke)
            canvas.drawLine(cx - size / 6f, cy + size / 2f, cx + size / 6f, cy + size / 2f, stroke)
        }
    )
}
