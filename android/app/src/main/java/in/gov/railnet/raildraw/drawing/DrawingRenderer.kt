package `in`.gov.railnet.raildraw.drawing

import android.graphics.*
import `in`.gov.railnet.raildraw.model.*

/**
 * High-precision Indian Railways S&T Signalling CAD Drawing Generator.
 * Renders 4 clean variations of the standard S&T route diagram (2800 x 1800 px),
 * with no bottom Drawn By / signature strip — just the engineering diagram.
 */
class DrawingRenderer {

    companion object {
        const val CANVAS_WIDTH = 2800f
        const val CANVAS_HEIGHT = 1800f

        const val MARGIN_LEFT = 80f
        const val MARGIN_TOP = 65f
        const val MARGIN_RIGHT = 80f
        const val MARGIN_BOTTOM = 65f
    }

    fun renderToBitmap(drawing: SignallingDrawing): Bitmap {
        val bitmap = Bitmap.createBitmap(
            CANVAS_WIDTH.toInt(),
            CANVAS_HEIGHT.toInt(),
            Bitmap.Config.ARGB_8888
        )
        val canvas = Canvas(bitmap)
        val isMono = drawing.variant == DrawingVariant.CLASSIC_PRINT

        canvas.drawColor(Color.WHITE)
        val defaultPaint = Paint(Paint.ANTI_ALIAS_FLAG)

        // 1. Clean Engineering Border
        drawDrawingBorder(canvas, defaultPaint, isMono)

        // 2. Top Title Header (No bottom Drawn By / Checked By / Approved By bar)
        drawTopHeader(canvas, drawing, defaultPaint, isMono)

        // 3. Broad Gauge Railway Track + Signals + Main Route Diagram (shared across all 4 similar options)
        val startX = MARGIN_LEFT + 190f
        val endX = CANVAS_WIDTH - MARGIN_RIGHT - 190f
        val trackY = 395f
        val routeY = 625f

        drawRailwayTrack(
            canvas = canvas,
            startX = startX - 60f,
            endX = endX + 60f,
            centerY = trackY,
            paint = defaultPaint,
            trackLabel = "C/L OF NEAREST RAILWAY TRACK (1676 mm BG — OFFSET: 3.5 m MIN)",
            isMono = isMono
        )
        drawClsSignal(canvas, startX, routeY - 24f, drawing.fromLocation.take(10), defaultPaint, isMono)
        drawPointOrEndNode(canvas, endX, routeY - 24f, drawing.toLocation.take(10), defaultPaint, isMono)

        drawRouteDiagram(canvas, drawing, startX, endX, routeY, defaultPaint, isMono)

        // 4. Lower Panels (4 clean variations of the attached diagram style, extending to bottom margin)
        val panelTop = 945f
        val panelBottom = CANVAS_HEIGHT - MARGIN_BOTTOM - 36f
        val panelLeft = MARGIN_LEFT + 44f
        val panelRight = CANVAS_WIDTH - MARGIN_RIGHT - 44f

        when (drawing.variant) {
            DrawingVariant.ROUTE_PLAN, DrawingVariant.CLASSIC_PRINT -> {
                val midGap = 36f
                val cardW = (panelRight - panelLeft - midGap) / 2f
                drawDetailACard(canvas, drawing, panelLeft, panelTop, cardW, panelBottom - panelTop, defaultPaint, isMono)
                drawLegendAndNotesCard(canvas, drawing, panelLeft + cardW + midGap, panelTop, cardW, panelBottom - panelTop, defaultPaint, isMono)
            }
            DrawingVariant.ROUTE_SCHEDULE -> {
                val midGap = 36f
                val leftW = (panelRight - panelLeft - midGap) * 0.58f
                val rightW = (panelRight - panelLeft - midGap) - leftW
                drawSegmentScheduleCard(canvas, drawing, panelLeft, panelTop, leftW, panelBottom - panelTop, defaultPaint)
                drawLegendAndNotesCard(canvas, drawing, panelLeft + leftW + midGap, panelTop, rightW, panelBottom - panelTop, defaultPaint, false)
            }
            DrawingVariant.ROUTE_TRENCH -> {
                val midGap = 36f
                val leftW = (panelRight - panelLeft - midGap) * 0.54f
                val rightW = (panelRight - panelLeft - midGap) - leftW
                drawTrackToTrenchCard(canvas, drawing, panelLeft, panelTop, leftW, panelBottom - panelTop, defaultPaint)
                drawLegendAndNotesCard(canvas, drawing, panelLeft + leftW + midGap, panelTop, rightW, panelBottom - panelTop, defaultPaint, false)
            }
        }

        return bitmap
    }

    private fun drawDrawingBorder(canvas: Canvas, paint: Paint, isMono: Boolean) {
        val outerColor = if (isMono) Color.parseColor("#111827") else Color.parseColor("#0C2340")
        val outerBorder = Paint(paint).apply {
            style = Paint.Style.STROKE
            strokeWidth = 6f
            color = outerColor
        }
        val innerBorder = Paint(paint).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2f
            color = Color.parseColor("#CBD5E1")
        }
        canvas.drawRoundRect(
            RectF(MARGIN_LEFT, MARGIN_TOP, CANVAS_WIDTH - MARGIN_RIGHT, CANVAS_HEIGHT - MARGIN_BOTTOM),
            12f, 12f, outerBorder
        )
        canvas.drawRoundRect(
            RectF(MARGIN_LEFT + 12f, MARGIN_TOP + 12f, CANVAS_WIDTH - MARGIN_RIGHT - 12f, CANVAS_HEIGHT - MARGIN_BOTTOM - 12f),
            8f, 8f, innerBorder
        )
    }

    private fun drawTopHeader(canvas: Canvas, drawing: SignallingDrawing, paint: Paint, isMono: Boolean) {
        val startX = MARGIN_LEFT + 44f
        val endX = CANVAS_WIDTH - MARGIN_RIGHT - 44f
        val primaryCol = if (isMono) Color.parseColor("#111827") else Color.parseColor("#0C2340")
        val accentCol = if (isMono) Color.parseColor("#111827") else Color.parseColor("#1D4ED8")

        canvas.drawText(
            "${drawing.railwayZone.uppercase()} — SIGNAL & TELECOMMUNICATION DEPARTMENT",
            startX,
            MARGIN_TOP + 58f,
            Paint(paint).apply {
                color = Color.parseColor("#475569")
                textSize = 24f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            }
        )
        canvas.drawText(
            "TOTAL: ${drawing.totalLengthMeters.toInt()} m  |  ${drawing.drawingNo}",
            endX,
            MARGIN_TOP + 58f,
            Paint(paint).apply {
                color = accentCol
                textSize = 25f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textAlign = Paint.Align.RIGHT
            }
        )
        canvas.drawText(
            "${drawing.cableDetails.type.uppercase()} CABLE ROUTE : ${drawing.fromLocation} TO ${drawing.toLocation}",
            startX,
            MARGIN_TOP + 108f,
            Paint(paint).apply {
                color = primaryCol
                textSize = 36f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            }
        )
        canvas.drawLine(
            startX,
            MARGIN_TOP + 132f,
            endX,
            MARGIN_TOP + 132f,
            Paint(paint).apply { color = primaryCol; strokeWidth = 3f }
        )
    }

    private fun drawRailwayTrack(
        canvas: Canvas,
        startX: Float,
        endX: Float,
        centerY: Float,
        paint: Paint,
        trackLabel: String,
        isMono: Boolean
    ) {
        val ballastPaint = Paint(paint).apply {
            color = if (isMono) Color.parseColor("#F3F4F6") else Color.parseColor("#E2E8F0")
            style = Paint.Style.FILL
        }
        canvas.drawRect(startX, centerY - 26f, endX, centerY + 26f, ballastPaint)

        val sleeperPaint = Paint(paint).apply {
            color = Color.parseColor("#64748B")
            strokeWidth = 7f
        }
        var sx = startX + 18f
        while (sx < endX - 10f) {
            canvas.drawLine(sx, centerY - 22f, sx, centerY + 22f, sleeperPaint)
            sx += 34f
        }

        val railPaint = Paint(paint).apply {
            color = Color.parseColor("#0F172A")
            strokeWidth = 5f
        }
        canvas.drawLine(startX, centerY - 11f, endX, centerY - 11f, railPaint)
        canvas.drawLine(startX, centerY + 11f, endX, centerY + 11f, railPaint)

        val clPaint = Paint(paint).apply {
            color = Color.parseColor("#64748B")
            strokeWidth = 2.5f
            pathEffect = DashPathEffect(floatArrayOf(22f, 8f, 6f, 8f), 0f)
        }
        canvas.drawLine(startX, centerY, endX, centerY, clPaint)

        canvas.drawText(
            trackLabel,
            (startX + endX) / 2f,
            centerY - 48f,
            Paint(paint).apply {
                color = Color.parseColor("#334155")
                textSize = 22f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textAlign = Paint.Align.CENTER
            }
        )
    }

    private fun drawClsSignal(canvas: Canvas, x: Float, baseY: Float, label: String, paint: Paint, isMono: Boolean) {
        val mastPaint = Paint(paint).apply {
            color = Color.parseColor("#0F172A")
            strokeWidth = 6f
        }
        canvas.drawLine(x, baseY, x, baseY - 110f, mastPaint)
        canvas.drawLine(x - 20f, baseY, x + 20f, baseY, mastPaint)

        val headPaint = Paint(paint).apply {
            color = Color.parseColor("#111827")
            style = Paint.Style.FILL
        }
        canvas.drawRoundRect(RectF(x - 17f, baseY - 190f, x + 17f, baseY - 105f), 14f, 14f, headPaint)

        val aspects = if (isMono) {
            listOf(Color.WHITE to (baseY - 172f), Color.LTGRAY to (baseY - 148f), Color.GRAY to (baseY - 124f))
        } else {
            listOf(Color.parseColor("#22C55E") to (baseY - 172f), Color.parseColor("#FACC15") to (baseY - 148f), Color.parseColor("#EF4444") to (baseY - 124f))
        }
        aspects.forEach { (col, cy) ->
            canvas.drawCircle(x, cy, 7f, Paint(paint).apply { color = col; style = Paint.Style.FILL })
        }

        // Badge above signal
        val badgeRect = RectF(x - 105f, 275f, x + 105f, 318f)
        canvas.drawRoundRect(badgeRect, 8f, 8f, Paint(paint).apply { color = if (isMono) Color.parseColor("#111827") else Color.parseColor("#0C2340") })
        canvas.drawText(label, x, 304f, Paint(paint).apply {
            color = Color.WHITE; textSize = 21f; typeface = Typeface.DEFAULT_BOLD; textAlign = Paint.Align.CENTER
        })
    }

    private fun drawPointOrEndNode(canvas: Canvas, x: Float, baseY: Float, label: String, paint: Paint, isMono: Boolean) {
        val boxRect = RectF(x - 36f, baseY - 38f, x + 36f, baseY + 6f)
        canvas.drawRoundRect(boxRect, 6f, 6f, Paint(paint).apply {
            color = if (isMono) Color.parseColor("#F3F4F6") else Color.parseColor("#DBEAFE")
            style = Paint.Style.FILL
        })
        canvas.drawRoundRect(boxRect, 6f, 6f, Paint(paint).apply {
            color = if (isMono) Color.parseColor("#111827") else Color.parseColor("#1D4ED8")
            style = Paint.Style.STROKE
            strokeWidth = 4f
        })
        canvas.drawText("PM", x, baseY - 10f, Paint(paint).apply {
            color = if (isMono) Color.parseColor("#111827") else Color.parseColor("#1E3A8A")
            textSize = 22f; typeface = Typeface.DEFAULT_BOLD; textAlign = Paint.Align.CENTER
        })

        val badgeRect = RectF(x - 115f, 275f, x + 115f, 318f)
        canvas.drawRoundRect(badgeRect, 8f, 8f, Paint(paint).apply { color = if (isMono) Color.parseColor("#111827") else Color.parseColor("#0C2340") })
        canvas.drawText(label, x, 304f, Paint(paint).apply {
            color = Color.WHITE; textSize = 21f; typeface = Typeface.DEFAULT_BOLD; textAlign = Paint.Align.CENTER
        })
    }

    private fun methodColor(method: LayingMethod, isMono: Boolean): Int {
        if (isMono) return Color.parseColor("#111827")
        return when (method) {
            LayingMethod.ALONG_BRIDGE, LayingMethod.CABLE_TRAY -> Color.parseColor("#0F766E")
            LayingMethod.CULVERT_CROSSING -> Color.parseColor("#0284C7")
            LayingMethod.CABLE_TROUGH -> Color.parseColor("#6D28D9")
            LayingMethod.TRENCHLESS_HDD -> Color.parseColor("#B91C1C")
            LayingMethod.GI_PIPE -> Color.parseColor("#1D4ED8")
            LayingMethod.RCC_PIPE -> Color.parseColor("#475569")
            LayingMethod.HDPE_PIPE -> Color.parseColor("#0369A1")
            LayingMethod.TRACK_CROSSING -> Color.parseColor("#B45309")
            LayingMethod.ROAD_CROSSING -> Color.parseColor("#334155")
            LayingMethod.NORMAL_TRENCHING -> Color.parseColor("#0C2340")
        }
    }

    private fun methodFill(method: LayingMethod, isMono: Boolean): Int {
        if (isMono) return Color.parseColor("#F3F4F6")
        return when (method) {
            LayingMethod.ALONG_BRIDGE, LayingMethod.CABLE_TRAY -> Color.parseColor("#CCFBF1")
            LayingMethod.CULVERT_CROSSING -> Color.parseColor("#E0F2FE")
            LayingMethod.CABLE_TROUGH -> Color.parseColor("#EDE9FE")
            LayingMethod.TRENCHLESS_HDD -> Color.parseColor("#FEE2E2")
            LayingMethod.GI_PIPE, LayingMethod.HDPE_PIPE -> Color.parseColor("#DBEAFE")
            LayingMethod.RCC_PIPE, LayingMethod.ROAD_CROSSING -> Color.parseColor("#E2E8F0")
            LayingMethod.TRACK_CROSSING -> Color.parseColor("#FEF3C7")
            LayingMethod.NORMAL_TRENCHING -> Color.parseColor("#F1F5F9")
        }
    }

    private fun drawRouteDiagram(
        canvas: Canvas,
        drawing: SignallingDrawing,
        startX: Float,
        endX: Float,
        routeY: Float,
        paint: Paint,
        isMono: Boolean
    ) {
        val totalLength = drawing.totalLengthMeters.coerceAtLeast(1.0)
        val segments = drawing.segments
        val routeStartX = startX + 46f
        val routeEndX = endX - 46f
        val routeSpan = routeEndX - routeStartX

        // Allocate proportional widths with minimum readability
        val minW = 140f
        val widths = FloatArray(segments.size)
        if (segments.size * minW <= routeSpan) {
            val rem = routeSpan - segments.size * minW
            segments.forEachIndexed { idx, s ->
                widths[idx] = minW + (s.lengthMeters / totalLength * rem).toFloat()
            }
        } else {
            segments.forEachIndexed { idx, s ->
                widths[idx] = (s.lengthMeters / totalLength * routeSpan).toFloat()
            }
        }

        val dimWitnessPaint = Paint(paint).apply { color = Color.parseColor("#64748B"); strokeWidth = 2.2f }
        val dimLinePaint = Paint(paint).apply { color = if (isMono) Color.parseColor("#111827") else Color.parseColor("#0C2340"); strokeWidth = 3f }
        val dimTextPaint = Paint(paint).apply {
            color = if (isMono) Color.parseColor("#111827") else Color.parseColor("#0C2340")
            textSize = 24f; typeface = Typeface.DEFAULT_BOLD; textAlign = Paint.Align.CENTER
        }

        val segDimY = routeY + 100f
        val overallDimY = routeY + 205f
        canvas.drawLine(routeStartX, routeY + 22f, routeStartX, overallDimY + 28f, dimWitnessPaint)

        var currX = routeStartX
        segments.forEachIndexed { idx, seg ->
            val segW = widths[idx]
            val segEndX = if (idx == segments.lastIndex) routeEndX else currX + segW
            val midX = (currX + segEndX) / 2f
            val strokeCol = methodColor(seg.method, isMono)
            val fillCol = methodFill(seg.method, isMono)

            when (seg.method) {
                LayingMethod.ALONG_BRIDGE -> {
                    // Truss bridge + cable tray
                    val rect = RectF(currX, routeY - 20f, segEndX, routeY + 20f)
                    canvas.drawRect(rect, Paint(paint).apply { color = fillCol; style = Paint.Style.FILL })
                    canvas.drawRect(rect, Paint(paint).apply { color = strokeCol; style = Paint.Style.STROKE; strokeWidth = 4f })
                    var tx = currX
                    while (tx + 36f <= segEndX) {
                        canvas.drawLine(tx, routeY + 18f, tx + 18f, routeY - 18f, Paint(paint).apply { color = strokeCol; strokeWidth = 3f })
                        canvas.drawLine(tx + 18f, routeY - 18f, tx + 36f, routeY + 18f, Paint(paint).apply { color = strokeCol; strokeWidth = 3f })
                        tx += 36f
                    }
                    // Piers
                    canvas.drawRect(currX, routeY + 20f, currX + 18f, routeY + 52f, Paint(paint).apply { color = strokeCol })
                    canvas.drawRect(segEndX - 18f, routeY + 20f, segEndX, routeY + 52f, Paint(paint).apply { color = strokeCol })
                }
                LayingMethod.TRENCHLESS_HDD -> {
                    val rect = RectF(currX, routeY - 16f, segEndX, routeY + 16f)
                    canvas.drawRect(rect, Paint(paint).apply { color = fillCol; style = Paint.Style.FILL })
                    canvas.drawRect(rect, Paint(paint).apply { color = strokeCol; style = Paint.Style.STROKE; strokeWidth = 4f })
                    var hx = currX + 10f
                    while (hx < segEndX - 10f) {
                        canvas.drawLine(hx, routeY + 15f, (hx + 16f).coerceAtMost(segEndX), routeY - 15f, Paint(paint).apply { color = strokeCol; strokeWidth = 2.8f })
                        hx += 20f
                    }
                }
                LayingMethod.CABLE_TROUGH, LayingMethod.GI_PIPE, LayingMethod.RCC_PIPE, LayingMethod.HDPE_PIPE, LayingMethod.CULVERT_CROSSING -> {
                    val rect = RectF(currX, routeY - 15f, segEndX, routeY + 15f)
                    canvas.drawRect(rect, Paint(paint).apply { color = fillCol; style = Paint.Style.FILL })
                    canvas.drawRect(rect, Paint(paint).apply { color = strokeCol; style = Paint.Style.STROKE; strokeWidth = 4f })
                    canvas.drawLine(currX, routeY - 4f, segEndX, routeY - 4f, Paint(paint).apply { color = strokeCol; strokeWidth = 2f })
                    canvas.drawLine(currX, routeY + 4f, segEndX, routeY + 4f, Paint(paint).apply { color = strokeCol; strokeWidth = 2f })
                }
                else -> {
                    canvas.drawLine(currX, routeY, segEndX, routeY, Paint(paint).apply { color = strokeCol; strokeWidth = 8f })
                }
            }

            // Joint divider
            canvas.drawLine(segEndX, routeY - 24f, segEndX, routeY + 24f, Paint(paint).apply { color = Color.parseColor("#0C2340"); strokeWidth = 3f })

            // Staggered method label above segment
            val labelY = if (idx % 2 == 1) routeY - 82f else routeY - 46f
            canvas.drawText(
                seg.method.displayName.uppercase(),
                midX,
                labelY,
                Paint(paint).apply {
                    color = strokeCol
                    textSize = 21f
                    typeface = Typeface.DEFAULT_BOLD
                    textAlign = Paint.Align.CENTER
                }
            )

            // Segment dimension witness & arrow
            canvas.drawLine(segEndX, routeY + 22f, segEndX, segDimY + 26f, dimWitnessPaint)
            val lenStr = if (seg.lengthMeters % 1.0 == 0.0) "${seg.lengthMeters.toInt()} m" else "${"%.1f".format(seg.lengthMeters)} m"
            drawDimensionLineWithArrows(canvas, currX, segEndX, segDimY, lenStr, dimLinePaint, dimTextPaint)

            currX = segEndX
        }

        canvas.drawLine(routeEndX, routeY + 22f, routeEndX, overallDimY + 28f, dimWitnessPaint)
        canvas.drawText("START", startX, routeY + 60f, Paint(paint).apply { color = Color.parseColor("#334155"); textSize = 20f; typeface = Typeface.DEFAULT_BOLD; textAlign = Paint.Align.CENTER })
        canvas.drawText("END", endX, routeY + 60f, Paint(paint).apply { color = Color.parseColor("#334155"); textSize = 20f; typeface = Typeface.DEFAULT_BOLD; textAlign = Paint.Align.CENTER })

        val totalStr = if (totalLength % 1.0 == 0.0) totalLength.toInt().toString() else "%.1f".format(totalLength)
        drawDimensionLineWithArrows(
            canvas,
            routeStartX,
            routeEndX,
            overallDimY,
            "TOTAL LENGTH : $totalStr METRES",
            Paint(dimLinePaint).apply { strokeWidth = 4.2f },
            Paint(dimTextPaint).apply { textSize = 28f }
        )
    }

    private fun drawCardFrame(canvas: Canvas, x: Float, y: Float, w: Float, h: Float, title: String, paint: Paint, isMono: Boolean) {
        val headerCol = if (isMono) Color.parseColor("#111827") else Color.parseColor("#0C2340")
        canvas.drawRoundRect(RectF(x, y, x + w, y + h), 14f, 14f, Paint(paint).apply { color = Color.WHITE; style = Paint.Style.FILL })
        canvas.drawRoundRect(RectF(x, y, x + w, y + 66f), 14f, 14f, Paint(paint).apply { color = headerCol; style = Paint.Style.FILL })
        canvas.drawRect(x, y + 36f, x + w, y + 66f, Paint(paint).apply { color = headerCol; style = Paint.Style.FILL })
        canvas.drawRoundRect(RectF(x, y, x + w, y + h), 14f, 14f, Paint(paint).apply { color = headerCol; style = Paint.Style.STROKE; strokeWidth = 3.5f })
        canvas.drawText(title, x + 32f, y + 43f, Paint(paint).apply { color = Color.WHITE; textSize = 24f; typeface = Typeface.DEFAULT_BOLD })
    }

    private fun drawDetailACard(
        canvas: Canvas,
        drawing: SignallingDrawing,
        x: Float,
        y: Float,
        w: Float,
        h: Float,
        paint: Paint,
        isMono: Boolean
    ) {
        drawCardFrame(canvas, x, y, w, h, "DETAIL 'A' — CABLE TRENCH CROSS-SECTION", paint, isMono)

        val trenchCx = x + 220f
        val glY = y + 175f
        val botY = y + 495f
        val halfW = 86f

        canvas.drawLine(trenchCx - 140f, glY, trenchCx + 140f, glY, Paint(paint).apply { color = Color.parseColor("#334155"); strokeWidth = 4f })
        canvas.drawText("G.L.", trenchCx - 148f, glY + 8f, Paint(paint).apply { color = Color.parseColor("#334155"); textSize = 22f; typeface = Typeface.DEFAULT_BOLD; textAlign = Paint.Align.RIGHT })

        canvas.drawRect(trenchCx - halfW, glY, trenchCx + halfW, botY, Paint(paint).apply { color = Color.WHITE; style = Paint.Style.FILL })
        canvas.drawRect(trenchCx - halfW, botY - 110f, trenchCx + halfW, botY, Paint(paint).apply {
            color = if (isMono) Color.parseColor("#F3F4F6") else Color.parseColor("#FEF3C7"); style = Paint.Style.FILL
        })
        canvas.drawLine(trenchCx - halfW, glY, trenchCx - halfW, botY, Paint(paint).apply { color = Color.parseColor("#0C2340"); strokeWidth = 4f })
        canvas.drawLine(trenchCx - halfW, botY, trenchCx + halfW, botY, Paint(paint).apply { color = Color.parseColor("#0C2340"); strokeWidth = 4f })
        canvas.drawLine(trenchCx + halfW, botY, trenchCx + halfW, glY, Paint(paint).apply { color = Color.parseColor("#0C2340"); strokeWidth = 4f })

        // Brick layer
        canvas.drawRect(trenchCx - 74f, botY - 165f, trenchCx + 74f, botY - 122f, Paint(paint).apply {
            color = if (isMono) Color.WHITE else Color.parseColor("#C2410C"); style = Paint.Style.FILL
        })
        if (isMono) {
            canvas.drawRect(trenchCx - 74f, botY - 165f, trenchCx + 74f, botY - 122f, Paint(paint).apply {
                color = Color.parseColor("#111827"); style = Paint.Style.STROKE; strokeWidth = 3f
            })
        }
        canvas.drawText("CLASS-II BRICK", trenchCx, botY - 137f, Paint(paint).apply {
            color = if (isMono) Color.parseColor("#111827") else Color.WHITE; textSize = 16f; typeface = Typeface.DEFAULT_BOLD; textAlign = Paint.Align.CENTER
        })

        // Cables in sand
        val cCount = drawing.cableDetails.count.coerceIn(1, 6)
        for (i in 0 until cCount) {
            val cx = trenchCx - 38f + (i % 3) * 38f
            val cy = botY - 72f + (i / 3) * 34f
            canvas.drawCircle(cx, cy, 11f, Paint(paint).apply { color = if (isMono) Color.parseColor("#111827") else Color.parseColor("#7C2D12") })
        }

        // Depth arrow
        val dx = trenchCx + 118f
        canvas.drawLine(dx, glY, dx, botY, Paint(paint).apply { color = Color.parseColor("#0C2340"); strokeWidth = 3f })
        canvas.drawText("1.0 m", dx + 16f, (glY + botY) / 2f, Paint(paint).apply { color = Color.parseColor("#0C2340"); textSize = 24f; typeface = Typeface.DEFAULT_BOLD })

        // Right specs text
        val tx = x + 480f
        canvas.drawText("${drawing.cableDetails.count} Nos. x ${drawing.cableDetails.coreCount} Core ${drawing.cableDetails.type}", tx, y + 160f, Paint(paint).apply {
            color = if (isMono) Color.parseColor("#111827") else Color.parseColor("#0C2340"); textSize = 28f; typeface = Typeface.DEFAULT_BOLD
        })
        canvas.drawText("${drawing.cableDetails.conductorSize} Armoured Railway Cable", tx, y + 205f, Paint(paint).apply {
            color = if (isMono) Color.parseColor("#374151") else Color.parseColor("#1D4ED8"); textSize = 24f; typeface = Typeface.DEFAULT_BOLD
        })
        val bullets = listOf(
            "• Trench Depth: 1.0 m below G.L. (Min)",
            "• Sand Bedding: 50 mm clean river sand layer",
            "• Protection: Class-II Brick / Perforated GI Tray",
            "• Ref Standard: IRSEM Part-II / RDSO"
        )
        bullets.forEachIndexed { idx, line ->
            canvas.drawText(line, tx, y + 275f + idx * 48f, Paint(paint).apply { color = Color.parseColor("#334155"); textSize = 22f })
        }
    }

    private fun drawSegmentScheduleCard(
        canvas: Canvas,
        drawing: SignallingDrawing,
        x: Float,
        y: Float,
        w: Float,
        h: Float,
        paint: Paint
    ) {
        drawCardFrame(canvas, x, y, w, h, "ROUTE SEGMENT & CHAINAGE SCHEDULE", paint, false)
        canvas.drawRect(x + 4f, y + 68f, x + w - 4f, y + 122f, Paint(paint).apply { color = Color.parseColor("#F1F5F9") })
        val hdrPaint = Paint(paint).apply { color = Color.parseColor("#0C2340"); textSize = 21f; typeface = Typeface.DEFAULT_BOLD }
        canvas.drawText("SEG", x + 28f, y + 102f, hdrPaint)
        canvas.drawText("CHAINAGE", x + 115f, y + 102f, hdrPaint)
        canvas.drawText("LENGTH", x + 360f, y + 102f, hdrPaint)
        canvas.drawText("LAYING METHOD", x + 540f, y + 102f, hdrPaint)
        canvas.drawText("DEPTH", x + 940f, y + 102f, hdrPaint)

        var ch = 0.0
        val rowPaint = Paint(paint).apply { color = Color.parseColor("#1E293B"); textSize = 22f }
        drawing.segments.take(6).forEachIndexed { idx, s ->
            val ry = y + 170f + idx * 66f
            val endCh = ch + s.lengthMeters
            canvas.drawText("${idx + 1}", x + 34f, ry, rowPaint)
            canvas.drawText("${ch.toInt()} m – ${endCh.toInt()} m", x + 115f, ry, rowPaint)
            canvas.drawText("${s.lengthMeters.toInt()} m", x + 360f, ry, Paint(rowPaint).apply { typeface = Typeface.DEFAULT_BOLD })
            canvas.drawText(s.method.displayName, x + 540f, ry, rowPaint)
            canvas.drawText("${"%.1f".format(s.depthMeters)} m", x + 940f, ry, rowPaint)
            canvas.drawLine(x + 20f, ry + 22f, x + w - 20f, ry + 22f, Paint(paint).apply { color = Color.parseColor("#E2E8F0"); strokeWidth = 2f })
            ch = endCh
        }
    }

    private fun drawTrackToTrenchCard(
        canvas: Canvas,
        drawing: SignallingDrawing,
        x: Float,
        y: Float,
        w: Float,
        h: Float,
        paint: Paint
    ) {
        drawCardFrame(canvas, x, y, w, h, "DETAIL 'A' — TRACK TO TRENCH SECTION (3.5 m MIN OFFSET)", paint, false)
        val glY = y + 250f
        canvas.drawLine(x + 40f, glY, x + 760f, glY, Paint(paint).apply { color = Color.parseColor("#334155"); strokeWidth = 4f })
        canvas.drawText("G.L.", x + 40f, glY - 14f, Paint(paint).apply { color = Color.parseColor("#334155"); textSize = 20f; typeface = Typeface.DEFAULT_BOLD })

        // Track ballast & rails on left
        val trackCx = x + 230f
        val ballast = Path().apply {
            moveTo(trackCx - 140f, glY); lineTo(trackCx - 95f, glY - 52f); lineTo(trackCx + 95f, glY - 52f); lineTo(trackCx + 140f, glY); close()
        }
        canvas.drawPath(ballast, Paint(paint).apply { color = Color.parseColor("#E2E8F0"); style = Paint.Style.FILL })
        canvas.drawRect(trackCx - 85f, glY - 68f, trackCx + 85f, glY - 52f, Paint(paint).apply { color = Color.parseColor("#64748B") })
        canvas.drawRect(trackCx - 52f, glY - 92f, trackCx - 38f, glY - 68f, Paint(paint).apply { color = Color.parseColor("#0F172A") })
        canvas.drawRect(trackCx + 38f, glY - 92f, trackCx + 52f, glY - 68f, Paint(paint).apply { color = Color.parseColor("#0F172A") })
        canvas.drawText("BG TRACK (1676 mm)", trackCx, glY - 110f, Paint(paint).apply { color = Color.parseColor("#0C2340"); textSize = 20f; typeface = Typeface.DEFAULT_BOLD; textAlign = Paint.Align.CENTER })

        // Trench on right
        val trenchCx = x + 600f
        val botY = glY + 250f
        canvas.drawRect(trenchCx - 66f, glY, trenchCx + 66f, botY, Paint(paint).apply { color = Color.parseColor("#FEF3C7"); style = Paint.Style.FILL })
        canvas.drawRect(trenchCx - 66f, glY, trenchCx + 66f, botY, Paint(paint).apply { color = Color.parseColor("#0C2340"); style = Paint.Style.STROKE; strokeWidth = 4f })
        canvas.drawRect(trenchCx - 58f, botY - 120f, trenchCx + 58f, botY - 84f, Paint(paint).apply { color = Color.parseColor("#C2410C") })
        val cCount = drawing.cableDetails.count.coerceIn(1, 6)
        for (i in 0 until cCount) {
            canvas.drawCircle(trenchCx - 32f + (i % 3) * 32f, botY - 54f + (i / 3) * 26f, 10f, Paint(paint).apply { color = Color.parseColor("#0C2340") })
        }

        // Offset arrow
        drawDimensionLineWithArrows(canvas, trackCx, trenchCx, glY + 46f, "3.5 m MIN", Paint(paint).apply { color = Color.parseColor("#0284C7"); strokeWidth = 3f }, Paint(paint).apply { color = Color.parseColor("#0284C7"); textSize = 20f; typeface = Typeface.DEFAULT_BOLD; textAlign = Paint.Align.CENTER })

        // Summary text right side
        val sx = x + 800f
        canvas.drawText("${drawing.cableDetails.count} x ${drawing.cableDetails.coreCount}C ${drawing.cableDetails.type}", sx, y + 170f, Paint(paint).apply { color = Color.parseColor("#0C2340"); textSize = 26f; typeface = Typeface.DEFAULT_BOLD })
        canvas.drawText("${drawing.cableDetails.conductorSize} Armoured", sx, y + 215f, Paint(paint).apply { color = Color.parseColor("#1D4ED8"); textSize = 22f; typeface = Typeface.DEFAULT_BOLD })
        canvas.drawText("• Min Depth: 1.0 m (1.2 m track)", sx, y + 280f, Paint(paint).apply { color = Color.parseColor("#334155"); textSize = 21f })
        canvas.drawText("• Sand Cushion: 50 mm", sx, y + 325f, Paint(paint).apply { color = Color.parseColor("#334155"); textSize = 21f })
        canvas.drawText("• Brick Warning Protection", sx, y + 370f, Paint(paint).apply { color = Color.parseColor("#334155"); textSize = 21f })
    }

    private fun drawLegendAndNotesCard(
        canvas: Canvas,
        drawing: SignallingDrawing,
        x: Float,
        y: Float,
        w: Float,
        h: Float,
        paint: Paint,
        isMono: Boolean
    ) {
        drawCardFrame(canvas, x, y, w, h, "GENERAL NOTES & DRAWING LEGEND", paint, isMono)

        val methods = drawing.segments.map { it.method }.distinct().take(4)
        methods.forEachIndexed { idx, m ->
            val ry = y + 118f + idx * 60f
            val stroke = methodColor(m, isMono)
            val fill = methodFill(m, isMono)
            canvas.drawRoundRect(RectF(x + 36f, ry, x + 130f, ry + 34f), 6f, 6f, Paint(paint).apply { color = fill; style = Paint.Style.FILL })
            canvas.drawRoundRect(RectF(x + 36f, ry, x + 130f, ry + 34f), 6f, 6f, Paint(paint).apply { color = stroke; style = Paint.Style.STROKE; strokeWidth = 3f })
            canvas.drawText(m.displayName, x + 154f, ry + 25f, Paint(paint).apply { color = Color.parseColor("#1E293B"); textSize = 23f; typeface = Typeface.DEFAULT_BOLD })
        }

        val lineY = y + h - 220f
        canvas.drawLine(x + 32f, lineY, x + w - 32f, lineY, Paint(paint).apply { color = Color.parseColor("#CBD5E1"); strokeWidth = 2f })

        val notes = listOf(
            "1. Cable Route Markers (C.M.) installed every 50 m & track bends.",
            "2. Minimum bending radius of cable shall not be less than 15D.",
            "3. Route: ${drawing.segments.size} segment(s) · IRSEM Part-II / RDSO."
        )
        notes.forEachIndexed { idx, n ->
            canvas.drawText(n, x + 36f, lineY + 54f + idx * 50f, Paint(paint).apply { color = Color.parseColor("#1E293B"); textSize = 21f })
        }
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
        val arrowLength = 18f
        val arrowHalfWidth = 6f
        canvas.drawLine(x1, y, x2, y, linePaint)

        val leftArrow = Path().apply {
            moveTo(x1, y); lineTo(x1 + arrowLength, y - arrowHalfWidth); lineTo(x1 + arrowLength, y + arrowHalfWidth); close()
        }
        canvas.drawPath(leftArrow, Paint(linePaint).apply { style = Paint.Style.FILL })

        val rightArrow = Path().apply {
            moveTo(x2, y); lineTo(x2 - arrowLength, y - arrowHalfWidth); lineTo(x2 - arrowLength, y + arrowHalfWidth); close()
        }
        canvas.drawPath(rightArrow, Paint(linePaint).apply { style = Paint.Style.FILL })

        val midX = (x1 + x2) / 2f
        val padW = text.length * 14f + 24f
        canvas.drawRect(midX - padW / 2f, y - 22f, midX + padW / 2f, y + 10f, Paint().apply { color = Color.WHITE; style = Paint.Style.FILL })
        canvas.drawText(text, midX, y + 4f, textPaint)
    }
}
