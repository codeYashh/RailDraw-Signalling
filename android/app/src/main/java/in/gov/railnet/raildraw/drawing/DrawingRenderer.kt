package in.gov.railnet.raildraw.drawing

import android.graphics.*
import in.gov.railnet.raildraw.model.*

/**
 * High-precision Indian Railways S&T Signalling CAD Drawing Generator.
 * Renders print-ready engineering drawings using android.graphics.Canvas to high-resolution Bitmaps (2800 x 1800 px).
 */
class DrawingRenderer {

    companion object {
        const val CANVAS_WIDTH = 2800f
        const val CANVAS_HEIGHT = 1800f

        // Border Margins (Indian Railways: 20 mm left binding margin, 10 mm others)
        const val MARGIN_LEFT = 140f
        const val MARGIN_TOP = 80f
        const val MARGIN_RIGHT = 80f
        const val MARGIN_BOTTOM = 80f
    }

    /**
     * Renders the complete SignallingDrawing to a 2800x1800 300-DPI-equivalent Bitmap.
     */
    fun renderToBitmap(drawing: SignallingDrawing): Bitmap {
        val bitmap = Bitmap.createBitmap(
            CANVAS_WIDTH.toInt(),
            CANVAS_HEIGHT.toInt(),
            Bitmap.Config.ARGB_8888
        )
        val canvas = Canvas(bitmap)

        // 1. Crisp White Background
        canvas.drawColor(Color.WHITE)

        val defaultPaint = Paint(Paint.ANTI_ALIAS_FLAG)

        // 2. Standard Indian Railways Drawing Frame & Border
        drawDrawingBorder(canvas, defaultPaint)

        // 3. Clean Top Header
        drawTopHeader(canvas, drawing, defaultPaint)

        // 4. Main Route Layout (Location Boxes, Segments, Dimensions)
        drawRouteDiagram(canvas, drawing, defaultPaint)

        // 5. Zoom Detail 'A' Callout (Cable Bundle Cross-Section)
        drawDetailCallout(canvas, drawing, defaultPaint)

        // 6. Bottom Engineering Stamp
        drawBottomStamp(canvas, drawing, defaultPaint)

        return bitmap
    }

    private fun drawDrawingBorder(canvas: Canvas, paint: Paint) {
        val outerBorder = Paint(paint).apply {
            style = Paint.Style.STROKE
            strokeWidth = 6f
            color = Color.parseColor("#0F172A")
        }
        val innerBorder = Paint(paint).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2f
            color = Color.parseColor("#334155")
        }

        // Outer margin boundary
        canvas.drawRect(MARGIN_LEFT, MARGIN_TOP, CANVAS_WIDTH - MARGIN_RIGHT, CANVAS_HEIGHT - MARGIN_BOTTOM, outerBorder)
        // 8px inner decorative border
        canvas.drawRect(MARGIN_LEFT + 8f, MARGIN_TOP + 8f, CANVAS_WIDTH - MARGIN_RIGHT - 8f, CANVAS_HEIGHT - MARGIN_BOTTOM - 8f, innerBorder)
    }

    private fun drawTopHeader(canvas: Canvas, drawing: SignallingDrawing, paint: Paint) {
        val titlePaint = Paint(paint).apply {
            color = Color.parseColor("#0C2340")
            textSize = 38f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }
        val subPaint = Paint(paint).apply {
            color = Color.parseColor("#475569")
            textSize = 24f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }
        val linePaint = Paint(paint).apply {
            color = Color.parseColor("#CBD2DC")
            strokeWidth = 2.5f
        }

        val startX = MARGIN_LEFT + 40f
        val endX = CANVAS_WIDTH - MARGIN_RIGHT - 40f
        canvas.drawText("RAILDRAW — SIGNALLING CABLE ROUTE PLAN", startX, MARGIN_TOP + 65f, titlePaint)
        canvas.drawText(
            "ROUTE: ${drawing.fromLocation} TO ${drawing.toLocation}   |   TOTAL LENGTH: ${drawing.totalLengthMeters.toInt()} m   |   DATE: ${drawing.date}",
            startX,
            MARGIN_TOP + 110f,
            subPaint
        )
        canvas.drawLine(startX, MARGIN_TOP + 135f, endX, MARGIN_TOP + 135f, linePaint)
    }

    private fun drawBottomStamp(canvas: Canvas, drawing: SignallingDrawing, paint: Paint) {
        val textPaint = Paint(paint).apply {
            color = Color.parseColor("#64748B")
            textSize = 22f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }
        val linePaint = Paint(paint).apply {
            color = Color.parseColor("#CBD2DC")
            strokeWidth = 2.5f
        }
        val y = CANVAS_HEIGHT - MARGIN_BOTTOM - 30f
        val startX = MARGIN_LEFT + 40f
        val endX = CANVAS_WIDTH - MARGIN_RIGHT - 40f
        canvas.drawLine(startX, y - 30f, endX, y - 30f, linePaint)
        canvas.drawText(
            "DRG NO: RDSO/SIG/CR-${drawing.fromLocation}-${drawing.toLocation}   |   INDIAN RAILWAYS SIGNAL & TELECOM DEPARTMENT   |   SCALE: 1:1000",
            startX,
            y,
            textPaint
        )
    }

    private fun drawNotesBlock(canvas: Canvas, drawing: SignallingDrawing, paint: Paint) {
        val nbWidth = 720f
        val nbHeight = 220f
        val right = CANVAS_WIDTH - MARGIN_RIGHT - 8f
        val top = MARGIN_TOP + 8f
        val left = right - nbWidth
        val bottom = top + nbHeight

        val bgPaint = Paint(paint).apply {
            style = Paint.Style.FILL
            color = Color.parseColor("#F8FAFC")
        }
        canvas.drawRect(left, top, right, bottom, bgPaint)

        val borderPaint = Paint(paint).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2.5f
            color = Color.parseColor("#0F172A")
        }
        canvas.drawRect(left, top, right, bottom, borderPaint)

        val headerPaint = Paint(paint).apply {
            color = Color.parseColor("#0D2B45")
            textSize = 20f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }
        canvas.drawText("GENERAL NOTES (IRSEM CHAPTER 15):", left + 20f, top + 35f, headerPaint)
        canvas.drawLine(left, top + 48f, right, top + 48f, borderPaint)

        val noteTextPaint = Paint(paint).apply {
            color = Color.parseColor("#1E293B")
            textSize = 16f
        }
        var y = top + 80f
        for (note in drawing.notes) {
            canvas.drawText(note, left + 20f, y, noteTextPaint)
            y += 35f
        }
    }

    private fun drawLegend(canvas: Canvas, drawing: SignallingDrawing, paint: Paint) {
        val lgWidth = 650f
        val lgHeight = 280f
        val left = MARGIN_LEFT + 8f
        val bottom = CANVAS_HEIGHT - MARGIN_BOTTOM - 8f
        val right = left + lgWidth
        val top = bottom - lgHeight

        val bgPaint = Paint(paint).apply {
            style = Paint.Style.FILL
            color = Color.parseColor("#F8FAFC")
        }
        canvas.drawRect(left, top, right, bottom, bgPaint)

        val borderPaint = Paint(paint).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2.5f
            color = Color.parseColor("#0F172A")
        }
        canvas.drawRect(left, top, right, bottom, borderPaint)

        val titlePaint = Paint(paint).apply {
            color = Color.parseColor("#0D2B45")
            textSize = 20f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }
        canvas.drawText("SIGNALLING LEGEND / SYMBOLS:", left + 20f, top + 35f, titlePaint)
        canvas.drawLine(left, top + 48f, right, top + 48f, borderPaint)

        val textPaint = Paint(paint).apply {
            color = Color.parseColor("#0F172A")
            textSize = 17f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }

        // Legend Items
        var itemY = top + 85f

        // 1. Normal Trenching
        val trenchPaint = Paint(paint).apply {
            color = Color.parseColor("#DC2626")
            strokeWidth = 6f
            style = Paint.Style.STROKE
        }
        canvas.drawLine(left + 25f, itemY, left + 110f, itemY, trenchPaint)
        canvas.drawText("Normal Trench Line (1.0m Depth)", left + 130f, itemY + 6f, textPaint)
        itemY += 45f

        // 2. GI Pipe
        val pipePaint = Paint(paint).apply {
            color = Color.parseColor("#2563EB")
            strokeWidth = 4f
            style = Paint.Style.STROKE
        }
        canvas.drawLine(left + 25f, itemY - 4f, left + 110f, itemY - 4f, pipePaint)
        canvas.drawLine(left + 25f, itemY + 4f, left + 110f, itemY + 4f, pipePaint)
        canvas.drawText("GI Pipe Encasement (Double Line)", left + 130f, itemY + 6f, textPaint)
        itemY += 45f

        // 3. Trenchless HDD
        val hatchPaint = Paint(paint).apply {
            color = Color.parseColor("#D97706")
            strokeWidth = 3f
        }
        canvas.drawRect(left + 25f, itemY - 10f, left + 110f, itemY + 10f, Paint(paint).apply { style = Paint.Style.STROKE; strokeWidth = 2.5f; color = Color.parseColor("#D97706") })
        for (hx in (left + 30f).toInt()..(left + 105f).toInt() step 12) {
            canvas.drawLine(hx.toFloat(), itemY + 9f, (hx + 10).toFloat(), itemY - 9f, hatchPaint)
        }
        canvas.drawText("Trenchless / HDD (Hatched Block)", left + 130f, itemY + 6f, textPaint)
        itemY += 45f

        // 4. Location Box
        SymbolsData.LOCATION_BOX.draw(canvas, left + 65f, itemY, 32f, paint)
        canvas.drawText("Location Box / Apparatus Case", left + 130f, itemY + 6f, textPaint)
    }

    private fun drawRouteDiagram(canvas: Canvas, drawing: SignallingDrawing, paint: Paint) {
        val totalLength = drawing.totalLengthMeters
        val segments = drawing.segments

        // Coordinate space for route
        val startX = MARGIN_LEFT + 220f
        val endX = CANVAS_WIDTH - MARGIN_RIGHT - 220f
        val availableWidth = endX - startX
        val routeY = 720f

        // 1. Draw Location Box at Start (From)
        SymbolsData.LOCATION_BOX.draw(canvas, startX, routeY, 70f, paint)
        val locTextPaint = Paint(paint).apply {
            color = Color.parseColor("#0D2B45")
            textSize = 26f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText(drawing.fromLocation, startX, routeY - 55f, locTextPaint)
        canvas.drawText("CH: 0.00m", startX, routeY + 65f, Paint(paint).apply { color = Color.parseColor("#64748B"); textSize = 18f; textAlign = Paint.Align.CENTER })

        // 2. Draw Location Box at End (To)
        SymbolsData.LOCATION_BOX.draw(canvas, endX, routeY, 70f, paint)
        canvas.drawText(drawing.toLocation, endX, routeY - 55f, locTextPaint)
        canvas.drawText("CH: ${totalLength.toInt()}m", endX, routeY + 65f, Paint(paint).apply { color = Color.parseColor("#64748B"); textSize = 18f; textAlign = Paint.Align.CENTER })

        // 3. Draw Route Segments
        val routeStartX = startX + 35f
        val routeEndX = endX - 35f
        val routeSpan = routeEndX - routeStartX

        var currX = routeStartX
        val segDimY = routeY + 140f
        val overallDimY = routeY + 260f

        val dimWitnessPaint = Paint(paint).apply {
            color = Color.parseColor("#64748B")
            strokeWidth = 2f
            style = Paint.Style.STROKE
        }
        val dimLinePaint = Paint(paint).apply {
            color = Color.parseColor("#0F172A")
            strokeWidth = 3f
        }
        val dimTextPaint = Paint(paint).apply {
            color = Color.parseColor("#0F172A")
            textSize = 22f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            textAlign = Paint.Align.CENTER
        }

        // Extension line at start
        canvas.drawLine(routeStartX, routeY + 20f, routeStartX, overallDimY + 30f, dimWitnessPaint)

        segments.forEachIndexed { index, seg ->
            val segWidth = (seg.lengthMeters / totalLength * routeSpan).toFloat().coerceAtLeast(100f)
            val segEndX = (currX + segWidth).coerceAtMost(routeEndX)

            // Draw segment line/pattern
            when (seg.method) {
                LayingMethod.TRENCHLESS_HDD -> {
                    // Hatched block
                    val hRect = RectF(currX, routeY - 14f, segEndX, routeY + 14f)
                    val bgHatch = Paint(paint).apply { style = Paint.Style.STROKE; strokeWidth = 3f; color = Color.parseColor("#D97706") }
                    canvas.drawRect(hRect, bgHatch)
                    val hatchLine = Paint(paint).apply { strokeWidth = 2.5f; color = Color.parseColor("#D97706") }
                    var hx = currX + 6f
                    while (hx < segEndX) {
                        canvas.drawLine(hx, routeY + 13f, (hx + 14f).coerceAtMost(segEndX), routeY - 13f, hatchLine)
                        hx += 16f
                    }
                }
                LayingMethod.GI_PIPE, LayingMethod.RCC_PIPE, LayingMethod.HDPE_PIPE -> {
                    // Double Line Pipe
                    val pColor = if (seg.method == LayingMethod.GI_PIPE) Color.parseColor("#2563EB") else Color.parseColor("#0284C7")
                    val pipePaint = Paint(paint).apply { color = pColor; strokeWidth = 5f }
                    canvas.drawLine(currX, routeY - 8f, segEndX, routeY - 8f, pipePaint)
                    canvas.drawLine(currX, routeY + 8f, segEndX, routeY + 8f, pipePaint)
                    // Pipe ends
                    canvas.drawLine(currX, routeY - 12f, currX, routeY + 12f, pipePaint)
                    canvas.drawLine(segEndX, routeY - 12f, segEndX, routeY + 12f, pipePaint)
                }
                else -> {
                    // Single Solid Trench Line
                    val trenchPaint = Paint(paint).apply {
                        color = Color.parseColor("#DC2626")
                        strokeWidth = 6f
                    }
                    canvas.drawLine(currX, routeY, segEndX, routeY, trenchPaint)
                }
            }

            // Segment Label Above
            val midX = (currX + segEndX) / 2f
            val segLabelPaint = Paint(paint).apply {
                color = Color.parseColor("#1E293B")
                textSize = 20f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textAlign = Paint.Align.CENTER
            }
            canvas.drawText("${seg.lengthMeters.toInt()}m ${seg.method.displayName}", midX, routeY - 32f, segLabelPaint)

            // Segment Dimension Witness line
            canvas.drawLine(segEndX, routeY + 20f, segEndX, segDimY + 30f, dimWitnessPaint)

            // Segment Dimension line with 3:1 closed arrowheads
            drawDimensionLineWithArrows(canvas, currX, segEndX, segDimY, "${seg.lengthMeters.toInt()} m", dimLinePaint, dimTextPaint)

            currX = segEndX
        }

        // Extension line at end
        canvas.drawLine(routeEndX, routeY + 20f, routeEndX, overallDimY + 30f, dimWitnessPaint)

        // Overall Dimension Line (Total Length)
        val overallTextPaint = Paint(dimTextPaint).apply {
            color = Color.parseColor("#0D2B45")
            textSize = 26f
        }
        val overallLinePaint = Paint(dimLinePaint).apply {
            strokeWidth = 4f
            color = Color.parseColor("#0D2B45")
        }
        drawDimensionLineWithArrows(canvas, routeStartX, routeEndX, overallDimY, "TOTAL ROUTE: ${totalLength.toInt()} METRES", overallLinePaint, overallTextPaint)
    }

    private fun drawDimensionLineWithArrows(
        canvas: Canvas,
        x1: Float,
        x2: Float,
        y: Float,
        text: String,
        linePaint: Paint,
        textPaint: Paint
    ) {
        val arrowLength = 16f
        val arrowHalfWidth = 5f

        // Dimension horizontal line
        canvas.drawLine(x1, y, x2, y, linePaint)

        // Left 3:1 Closed Arrowhead
        val leftArrow = android.graphics.Path().apply {
            moveTo(x1, y)
            lineTo(x1 + arrowLength, y - arrowHalfWidth)
            lineTo(x1 + arrowLength, y + arrowHalfWidth)
            close()
        }
        canvas.drawPath(leftArrow, Paint(linePaint).apply { style = Paint.Style.FILL })

        // Right 3:1 Closed Arrowhead
        val rightArrow = android.graphics.Path().apply {
            moveTo(x2, y)
            lineTo(x2 - arrowLength, y - arrowHalfWidth)
            lineTo(x2 - arrowLength, y + arrowHalfWidth)
            close()
        }
        canvas.drawPath(rightArrow, Paint(linePaint).apply { style = Paint.Style.FILL })

        // Dimension Text (centered)
        val midX = (x1 + x2) / 2f
        canvas.drawText(text, midX, y - 10f, textPaint)
    }

    private fun drawDetailCallout(canvas: Canvas, drawing: SignallingDrawing, paint: Paint) {
        // Zoom callout located on top left
        val calloutCenterX = MARGIN_LEFT + 320f
        val calloutCenterY = 320f
        val circleRadius = 140f

        // Leader dashed line to route
        val dashPaint = Paint(paint).apply {
            color = Color.parseColor("#64748B")
            strokeWidth = 2.5f
            style = Paint.Style.STROKE
            pathEffect = DashPathEffect(floatArrayOf(12f, 8f), 0f)
        }
        val leaderPath = android.graphics.Path().apply {
            moveTo(calloutCenterX, calloutCenterY + circleRadius)
            quadTo(calloutCenterX + 80f, 540f, MARGIN_LEFT + 500f, 700f)
        }
        canvas.drawPath(leaderPath, dashPaint)

        // Callout Circle
        val circleBg = Paint(paint).apply {
            color = Color.parseColor("#FFFFFF")
            style = Paint.Style.FILL
        }
        canvas.drawCircle(calloutCenterX, calloutCenterY, circleRadius, circleBg)

        val circleBorder = Paint(paint).apply {
            color = Color.parseColor("#0F172A")
            strokeWidth = 4f
            style = Paint.Style.STROKE
        }
        canvas.drawCircle(calloutCenterX, calloutCenterY, circleRadius, circleBorder)

        // Callout Title
        val calloutTitle = Paint(paint).apply {
            color = Color.parseColor("#0D2B45")
            textSize = 22f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("DETAIL 'A'", calloutCenterX, calloutCenterY - circleRadius - 16f, calloutTitle)
        canvas.drawText("CROSS SECTION OF CABLE TRENCH", calloutCenterX, calloutCenterY - circleRadius + 22f, Paint(paint).apply {
            color = Color.parseColor("#475569")
            textSize = 15f
            textAlign = Paint.Align.CENTER
        })

        // Draw Trench Cross-section inside circle
        // Trench Wall
        val trenchPaint = Paint(paint).apply {
            color = Color.parseColor("#CBD5E1")
            strokeWidth = 3f
            style = Paint.Style.STROKE
        }
        val tLeft = calloutCenterX - 90f
        val tRight = calloutCenterX + 90f
        val tBottom = calloutCenterY + 80f
        canvas.drawLine(tLeft, calloutCenterY - 30f, tLeft, tBottom, trenchPaint)
        canvas.drawLine(tLeft, tBottom, tRight, tBottom, trenchPaint)
        canvas.drawLine(tRight, calloutCenterY - 30f, tRight, tBottom, trenchPaint)

        // Protective Bricks / RCC Tile on top
        val brickPaint = Paint(paint).apply {
            color = Color.parseColor("#B45309")
            style = Paint.Style.FILL
        }
        canvas.drawRect(tLeft + 5f, calloutCenterY - 10f, tRight - 5f, calloutCenterY, brickPaint)

        // Cable bundle cross-section circles
        val cableCount = drawing.cableDetails.count.coerceIn(1, 12)
        val cableRadius = 14f
        val cableFill = Paint(paint).apply {
            color = Color.parseColor("#DC2626")
            style = Paint.Style.FILL
        }
        val cableStroke = Paint(paint).apply {
            color = Color.parseColor("#0F172A")
            strokeWidth = 2f
            style = Paint.Style.STROKE
        }

        // Arrange in a compact grid
        val startCableX = calloutCenterX - ((cableCount.coerceAtMost(4) - 1) * cableRadius * 1.3f) / 2f
        var cx = startCableX
        var cy = calloutCenterY + 45f
        for (i in 1..cableCount) {
            canvas.drawCircle(cx, cy, cableRadius, cableFill)
            canvas.drawCircle(cx, cy, cableRadius, cableStroke)
            cx += cableRadius * 2.3f
            if (i % 4 == 0) {
                cx = startCableX
                cy -= cableRadius * 2.3f
            }
        }

        // Cable Bundle Label Below
        val bundleLabel = Paint(paint).apply {
            color = Color.parseColor("#0F172A")
            textSize = 21f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText(drawing.cableDetails.description, calloutCenterX, calloutCenterY + circleRadius + 34f, bundleLabel)
        canvas.drawText("Depth: 1.0 m (Normal Soil)", calloutCenterX, calloutCenterY + circleRadius + 60f, Paint(paint).apply {
            color = Color.parseColor("#64748B")
            textSize = 17f
            textAlign = Paint.Align.CENTER
        })
    }
}
