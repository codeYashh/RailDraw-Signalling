package `in`.gov.railnet.raildraw.parser

import `in`.gov.railnet.raildraw.model.*
import java.text.SimpleDateFormat
import java.util.*
import java.util.regex.Pattern

/**
 * Robust rule-based natural language parser for Indian Railways Signalling cable route requests.
 * Supports both English and Hindi text/voice output, including spoken number words.
 * Fully offline, no API key or network required.
 */
class DrawingParser {

    companion object {
        private val HINDI_DIGITS_MAP = mapOf(
            '०' to '0', '१' to '1', '२' to '2', '३' to '3', '४' to '4',
            '५' to '5', '६' to '6', '७' to '7', '८' to '8', '९' to '9'
        )

        private val NUMBER_WORD_REPLACEMENTS = listOf(
            Regex("""\beight\s+hundred\b""", RegexOption.IGNORE_CASE) to "800",
            Regex("""\bsix\s+hundred\b""", RegexOption.IGNORE_CASE) to "600",
            Regex("""\bfive\s+hundred\s*(?:and\s*)?fifty\b""", RegexOption.IGNORE_CASE) to "550",
            Regex("""\bfive\s+hundred\b""", RegexOption.IGNORE_CASE) to "500",
            Regex("""\bfour\s+hundred\s*(?:and\s*)?fifty\b""", RegexOption.IGNORE_CASE) to "450",
            Regex("""\bfour\s+hundred\s*(?:and\s*)?thirty\b""", RegexOption.IGNORE_CASE) to "430",
            Regex("""\bfour\s+hundred\b""", RegexOption.IGNORE_CASE) to "400",
            Regex("""\bone\s+hundred\s*(?:and\s*)?fifty\b""", RegexOption.IGNORE_CASE) to "150",
            Regex("""\bone\s+hundred\b""", RegexOption.IGNORE_CASE) to "100",
            Regex("""\btwo\s+hundred\b""", RegexOption.IGNORE_CASE) to "200",
            Regex("""\bthree\s+hundred\b""", RegexOption.IGNORE_CASE) to "300",
            Regex("""\bseven\s+hundred\b""", RegexOption.IGNORE_CASE) to "700",
            Regex("""\bnine\s+hundred\b""", RegexOption.IGNORE_CASE) to "900",
            Regex("""पाँच\s*सौ|पांच\s*सौ""", RegexOption.IGNORE_CASE) to "500",
            Regex("""चार\s*सौ\s*तीस""", RegexOption.IGNORE_CASE) to "430",
            Regex("""चार\s*सौ""", RegexOption.IGNORE_CASE) to "400",
            Regex("""एक\s*सौ\s*पचास""", RegexOption.IGNORE_CASE) to "150",
            Regex("""एक\s*सौ|सौ""", RegexOption.IGNORE_CASE) to "100",
            Regex("""\btwenty[\s\-]four\b""", RegexOption.IGNORE_CASE) to "24",
            Regex("""\btwenty\b""", RegexOption.IGNORE_CASE) to "20",
            Regex("""\bthirty\b""", RegexOption.IGNORE_CASE) to "30",
            Regex("""\bfifty\b""", RegexOption.IGNORE_CASE) to "50",
            Regex("""\bseventy\b""", RegexOption.IGNORE_CASE) to "70",
            Regex("""\bforty\b""", RegexOption.IGNORE_CASE) to "40",
            Regex("""\bsixty\b""", RegexOption.IGNORE_CASE) to "60",
            Regex("""\beighty\b""", RegexOption.IGNORE_CASE) to "80",
            Regex("""\bninety\b""", RegexOption.IGNORE_CASE) to "90",
            Regex("""चौबीस""", RegexOption.IGNORE_CASE) to "24",
            Regex("""बीस""", RegexOption.IGNORE_CASE) to "20",
            Regex("""तीस""", RegexOption.IGNORE_CASE) to "30",
            Regex("""पचास""", RegexOption.IGNORE_CASE) to "50",
            Regex("""सत्तर""", RegexOption.IGNORE_CASE) to "70",
            Regex("""\btwelve\b""", RegexOption.IGNORE_CASE) to "12",
            Regex("""\bseven\b""", RegexOption.IGNORE_CASE) to "7",
            Regex("""\bfour\b""", RegexOption.IGNORE_CASE) to "4",
            Regex("""\bsix\b""", RegexOption.IGNORE_CASE) to "6",
            Regex("""\btwo\b""", RegexOption.IGNORE_CASE) to "2",
            Regex("""\bone\b""", RegexOption.IGNORE_CASE) to "1",
            Regex("""\beight\b""", RegexOption.IGNORE_CASE) to "8",
            Regex("""\bten\b""", RegexOption.IGNORE_CASE) to "10",
            Regex("""\beleven\b""", RegexOption.IGNORE_CASE) to "11",
            Regex("""\bfourteen\b""", RegexOption.IGNORE_CASE) to "14",
            Regex("""बारह""", RegexOption.IGNORE_CASE) to "12",
            Regex("""सात""", RegexOption.IGNORE_CASE) to "7",
            Regex("""चार""", RegexOption.IGNORE_CASE) to "4",
            Regex("""छह""", RegexOption.IGNORE_CASE) to "6",
            Regex("""दो""", RegexOption.IGNORE_CASE) to "2",
            Regex("""एक""", RegexOption.IGNORE_CASE) to "1"
        )
    }

    /**
     * Normalizes Devanagari numerals (०-९) and spoken number words to digits.
     */
    fun normalizeText(input: String): String {
        val sb = StringBuilder()
        for (ch in input) {
            sb.append(HINDI_DIGITS_MAP[ch] ?: ch)
        }
        var res = sb.toString().trim()
        for ((regex, rep) in NUMBER_WORD_REPLACEMENTS) {
            res = regex.replace(res, rep)
        }
        return res
    }

    /**
     * Parses the prompt and returns a ParseResult.
     * Guarantees never to crash on any input.
     */
    fun parse(prompt: String): ParseResult {
        if (prompt.isBlank()) {
            return ParseResult.Error("Please describe your signalling route in the box.")
        }

        try {
            val normalized = normalizeText(prompt)
            val lower = normalized.lowercase(Locale.ROOT)

            // 1. Extract Locations (From and To)
            val (fromLoc, toLoc, hasExplicitLocations) = extractLocations(normalized, lower)

            // 2. Extract Measured Segments & Any Unmeasured Laying Methods
            val extractedSegments = extractSegments(normalized, lower).toMutableList()
            val totalLength = extractTotalLength(normalized, lower)

            val hasSignalIntent = hasExplicitLocations ||
                extractedSegments.isNotEmpty() ||
                totalLength != null ||
                Regex("""\b(cable|route|signal|trench|pipe|hdd|track|road|bridge|culvert|trough|tray|point|axle|location|cabin|station|gate|yard|ofc|core|meter|metre|m|km|s\d+|p\d+|pm\d+|l\d+|केबल|रूट|सिग्नल|ट्रेंच|पाइप|मीटर)\b""", RegexOption.IGNORE_CASE)
                    .containsMatchIn(lower)

            if (!hasSignalIntent) {
                return ParseResult.Error(
                    "Could not detect route segments. Please specify lengths and methods (e.g. 20m trenchless, 50m GI pipe, 430m normal trenching)."
                )
            }

            val mentionedMethods = detectMentionedMethods(lower)
            val effectiveTargetTotal = totalLength ?: extractStandaloneLength(lower)

            if (extractedSegments.isEmpty()) {
                val synthesizedTotal = effectiveTargetTotal ?: 500.0
                extractedSegments.addAll(synthesizeSegments(synthesizedTotal, mentionedMethods))
            } else {
                // Include any unmeasured laying methods mentioned alongside measured segments
                val existingMethods = extractedSegments.map { it.method }.toSet()
                val missing = mentionedMethods.filter { it !in existingMethods && it != LayingMethod.NORMAL_TRENCHING }
                if (missing.isNotEmpty()) {
                    var currentSum = extractedSegments.sumOf { it.lengthMeters }
                    missing.forEachIndexed { idx, method ->
                        val remaining = if (totalLength != null) (totalLength - currentSum).coerceAtLeast(0.0) else 0.0
                        val defaultAlloc = when (method) {
                            LayingMethod.ALONG_BRIDGE, LayingMethod.GI_PIPE, LayingMethod.RCC_PIPE, LayingMethod.HDPE_PIPE -> 50.0
                            LayingMethod.CABLE_TROUGH, LayingMethod.CABLE_TRAY ->
                                if (idx == missing.lastIndex && remaining > 20.0) remaining else 100.0
                            else -> 30.0
                        }
                        val alloc = if (totalLength != null && remaining > 0.0) {
                            minOf(defaultAlloc, remaining).coerceAtLeast(10.0)
                        } else {
                            defaultAlloc
                        }
                        val depth = if (method == LayingMethod.TRACK_CROSSING) 1.2 else if (method == LayingMethod.ALONG_BRIDGE || method == LayingMethod.CABLE_TRAY) 0.0 else 1.0
                        extractedSegments.add(
                            RouteSegment(
                                id = "SEG-${extractedSegments.size + 1}",
                                lengthMeters = alloc,
                                method = method,
                                depthMeters = depth
                            )
                        )
                        currentSum += alloc
                    }
                }
            }

            // 3. Auto-calibrate segments if stated total differs from sum (never fail with mismatch error)
            val calibratedSegments = if (totalLength != null && totalLength > 0) {
                reconcileSegmentsToTotal(extractedSegments, totalLength)
            } else {
                extractedSegments
            }

            val finalTotal = totalLength?.takeIf { it > 0 } ?: calibratedSegments.sumOf { it.lengthMeters }

            // 4. Extract Cable Details
            val (cableDetails, notice) = extractCableDetails(normalized, lower)
            val currentDate = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault()).format(Date())

            val drawing = SignallingDrawing(
                fromLocation = fromLoc,
                toLocation = toLoc,
                totalLengthMeters = finalTotal,
                segments = calibratedSegments,
                cableDetails = cableDetails,
                date = currentDate,
                notice = notice
            )

            return ParseResult.Success(drawing, notice)

        } catch (e: Exception) {
            return ParseResult.Error("Could not understand drawing details: ${e.localizedMessage ?: "Invalid format"}")
        }
    }

    private fun extractLocations(raw: String, lower: String): Triple<String, String, Boolean> {
        val engRegex = Pattern.compile(
            """\b(?:from|between)\s+([A-Za-z0-9_\-]+(?:\s+[A-Za-z0-9_\-]+){0,2}?)\s+(?:to|and)\s+([A-Za-z0-9_\-]+(?:\s+[A-Za-z0-9_\-]+){0,2}?)(?=\s*(?:,|;|\.|with\b|for\b|total\b|\d+\s*(?:m|meter|meters|metre|metres|km)\b|$))""",
            Pattern.CASE_INSENSITIVE
        )
        val engMatcher = engRegex.matcher(raw)
        if (engMatcher.find()) {
            val from = cleanLocation(engMatcher.group(1))
            val to = cleanLocation(engMatcher.group(2))
            if (from.isNotBlank() && to.isNotBlank()) {
                return Triple(from, to, true)
            }
        }

        val hindiRegex = Pattern.compile("""([A-Za-z0-9_\-\u0900-\u097F]+)\s*से\s+([A-Za-z0-9_\-\u0900-\u097F]+)\s*(?:तक)?""")
        val hindiMatcher = hindiRegex.matcher(raw)
        if (hindiMatcher.find()) {
            val from = cleanLocation(hindiMatcher.group(1))
            val to = cleanLocation(hindiMatcher.group(2))
            if (from.isNotBlank() && to.isNotBlank()) {
                return Triple(from, to, true)
            }
        }

        return Triple("L1", "L12", false)
    }

    private fun round1(v: Double): Double = Math.round(v * 10.0) / 10.0

    private fun extractStandaloneLength(lower: String): Double? {
        val m = Pattern.compile("""\b(\d+(?:\.\d+)?)\s*(km|m|meter|meters|metre|metres|मीटर)\b""", Pattern.CASE_INSENSITIVE).matcher(lower)
        while (m.find()) {
            val rawVal = m.group(1)?.toDoubleOrNull() ?: continue
            val unit = (m.group(2) ?: "m").lowercase(Locale.ROOT)
            val meters = if (unit.startsWith("km")) rawVal * 1000.0 else rawVal
            if (meters >= 10.0) return meters
        }
        return null
    }

    private fun detectMentionedMethods(lower: String): List<LayingMethod> {
        val list = mutableListOf<LayingMethod>()
        if (lower.contains("track crossing") || lower.contains("rail crossing") || lower.contains("ट्रैक")) list.add(LayingMethod.TRACK_CROSSING)
        if (lower.contains("road crossing") || lower.contains("सड़क")) list.add(LayingMethod.ROAD_CROSSING)
        if (lower.contains("trenchless") || lower.contains("hdd") || lower.contains("ट्रेंचलेस")) list.add(LayingMethod.TRENCHLESS_HDD)
        if (lower.contains("bridge") || lower.contains("पुल") || lower.contains("ब्रिज")) list.add(LayingMethod.ALONG_BRIDGE)
        if (lower.contains("culvert") || lower.contains("कल्वर्ट")) list.add(LayingMethod.CULVERT_CROSSING)
        if (lower.contains("rcc")) list.add(LayingMethod.RCC_PIPE)
        if (lower.contains("hdpe") || lower.contains("dwc")) list.add(LayingMethod.HDPE_PIPE)
        if (lower.contains("gi pipe") || lower.contains("g.i") || lower.contains("जीआई")) list.add(LayingMethod.GI_PIPE)
        if (lower.contains("trough") || lower.contains("ट्रफ")) list.add(LayingMethod.CABLE_TROUGH)
        if (lower.contains("tray") || lower.contains("ट्रे")) list.add(LayingMethod.CABLE_TRAY)
        return list
    }

    private fun synthesizeSegments(total: Double, methods: List<LayingMethod>): List<RouteSegment> {
        if (methods.isEmpty()) {
            return listOf(RouteSegment("SEG-1", round1(total), LayingMethod.NORMAL_TRENCHING, 1.0))
        }
        if (methods.size == 1) {
            val m = methods[0]
            if ((m == LayingMethod.TRACK_CROSSING || m == LayingMethod.ROAD_CROSSING || m == LayingMethod.CULVERT_CROSSING || m == LayingMethod.TRENCHLESS_HDD) && total > 60.0) {
                val crossLen = (total * 0.15).coerceIn(20.0, 80.0).let { Math.round(it).toDouble() }
                val rem = total - crossLen
                val left = Math.round(rem / 2.0).toDouble()
                val right = round1(rem - left)
                return listOf(
                    RouteSegment("SEG-1", left, LayingMethod.NORMAL_TRENCHING, 1.0),
                    RouteSegment("SEG-2", crossLen, m, if (m == LayingMethod.TRACK_CROSSING) 1.2 else 1.0),
                    RouteSegment("SEG-3", right, LayingMethod.NORMAL_TRENCHING, 1.0)
                )
            }
            return listOf(RouteSegment("SEG-1", round1(total), m, if (m == LayingMethod.ALONG_BRIDGE || m == LayingMethod.CABLE_TRAY) 0.0 else 1.0))
        }
        val specialShare = minOf(0.45, methods.size * 0.15)
        val eachSpecial = maxOf(10.0, Math.round((total * specialShare) / methods.size).toDouble())
        val specialTotal = eachSpecial * methods.size
        val trenchLen = round1((total - specialTotal).coerceAtLeast(10.0))
        val out = mutableListOf<RouteSegment>()
        methods.forEachIndexed { idx, m ->
            val depth = if (m == LayingMethod.TRACK_CROSSING) 1.2 else if (m == LayingMethod.ALONG_BRIDGE || m == LayingMethod.CABLE_TRAY) 0.0 else 1.0
            out.add(RouteSegment("SEG-${idx + 1}", eachSpecial, m, depth))
        }
        if (trenchLen > 0.0) {
            out.add(RouteSegment("SEG-${out.size + 1}", trenchLen, LayingMethod.NORMAL_TRENCHING, 1.0))
        }
        return out
    }

    private fun reconcileSegmentsToTotal(segments: List<RouteSegment>, targetTotal: Double): List<RouteSegment> {
        val cloned = segments.toMutableList()
        val currentSum = round1(cloned.sumOf { it.lengthMeters })
        val diff = round1(targetTotal - currentSum)
        if (Math.abs(diff) <= 0.01) return cloned

        val normalIdx = cloned.indices
            .filter { cloned[it].method == LayingMethod.NORMAL_TRENCHING }
            .maxByOrNull { cloned[it].lengthMeters } ?: -1

        if (diff > 0) {
            if (normalIdx >= 0) {
                val s = cloned[normalIdx]
                cloned[normalIdx] = s.copy(lengthMeters = round1(s.lengthMeters + diff))
                return cloned
            }
            val mainRunIdx = cloned.indices
                .filter {
                    cloned[it].method == LayingMethod.CABLE_TROUGH ||
                        cloned[it].method == LayingMethod.CABLE_TRAY ||
                        cloned[it].method == LayingMethod.GI_PIPE ||
                        cloned[it].method == LayingMethod.RCC_PIPE ||
                        cloned[it].method == LayingMethod.HDPE_PIPE
                }
                .maxByOrNull { cloned[it].lengthMeters } ?: -1
            if (mainRunIdx >= 0 && cloned[mainRunIdx].lengthMeters >= currentSum * 0.4) {
                val s = cloned[mainRunIdx]
                cloned[mainRunIdx] = s.copy(lengthMeters = round1(s.lengthMeters + diff))
                return cloned
            }
            cloned.add(RouteSegment("SEG-${cloned.size + 1}", diff, LayingMethod.NORMAL_TRENCHING, 1.0))
            return cloned
        }

        val excess = Math.abs(diff)
        if (normalIdx >= 0 && cloned[normalIdx].lengthMeters - excess >= 1.0) {
            val s = cloned[normalIdx]
            cloned[normalIdx] = s.copy(lengthMeters = round1(s.lengthMeters - excess))
            return cloned
        }
        val longestIdx = cloned.indices.maxByOrNull { cloned[it].lengthMeters } ?: 0
        if (cloned[longestIdx].lengthMeters - excess >= 1.0) {
            val s = cloned[longestIdx]
            cloned[longestIdx] = s.copy(lengthMeters = round1(s.lengthMeters - excess))
            return cloned
        }

        val ratio = targetTotal / currentSum
        var running = 0.0
        return cloned.mapIndexed { idx, s ->
            if (idx == cloned.lastIndex) {
                s.copy(lengthMeters = maxOf(1.0, round1(targetTotal - running)))
            } else {
                val nextLen = maxOf(1.0, round1(s.lengthMeters * ratio))
                running = round1(running + nextLen)
                s.copy(lengthMeters = nextLen)
            }
        }
    }

    private fun cleanLocation(loc: String?): String {
        if (loc == null) return "L1"
        var cleaned = loc.trim()
            .replace(Regex("""^(?:route|cable|cable route|लाइन|केबल)\s+""", RegexOption.IGNORE_CASE), "")
            .replace(Regex("""\s+(?:for|with|of|having|जिसमें|लंबाई|कुल)$""", RegexOption.IGNORE_CASE), "")
            .trim()
        if (cleaned.equals("एल १", ignoreCase = true) || cleaned.equals("एल1", ignoreCase = true)) cleaned = "L1"
        if (cleaned.equals("एल १२", ignoreCase = true) || cleaned.equals("एल12", ignoreCase = true)) cleaned = "L12"
        return cleaned.ifBlank { "L1" }
    }

    private fun extractTotalLength(raw: String, lower: String): Double? {
        val totalPattern = Pattern.compile(
            """(?:total\s*(?:length)?|length\s*(?:of)?|कुल\s*(?:लंबाई)?)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres|मीटर)?""",
            Pattern.CASE_INSENSITIVE
        )
        val m = totalPattern.matcher(raw)
        if (m.find()) {
            return m.group(1)?.toDoubleOrNull()
        }

        val isolatePattern = Pattern.compile(
            """(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres|मीटर)\s*(?:route|total|:|,|\s+split)""",
            Pattern.CASE_INSENSITIVE
        )
        val m2 = isolatePattern.matcher(raw)
        if (m2.find()) {
            return m2.group(1)?.toDoubleOrNull()
        }

        return null
    }

    private fun extractSegments(raw: String, lower: String): List<RouteSegment> {
        val segments = mutableListOf<RouteSegment>()

        val segmentPattern = Pattern.compile(
            """\b(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres|मीटर)?\s*[:\-]?""" +
            """\s*(?:of|in|via|by)?\s*(trenchless|hdd|ट्रेंचलेस|एचडीडी|gi\s*pipe|g\.i|जीआई|rcc|आरसीसी|hdpe|एचडीपीई|road\s*crossing|सड़क|track\s*crossing|rail\s*crossing|ट्रैक|along\s*bridge|bridge(?:\s*crossing)?|पुल|ब्रिज|culvert(?:\s*crossing)?|कल्वर्ट|cable\s*trough|trough|ट्रफ|cable\s*tray|tray|ट्रे|normal(?:\s*trenching)?|trenching|trench|खाई|pipe|पाइप)""",
            Pattern.CASE_INSENSITIVE
        )

        val matcher = segmentPattern.matcher(raw)
        var segIndex = 1

        while (matcher.find()) {
            val lengthStr = matcher.group(1) ?: continue
            val desc = (matcher.group(2) ?: "").trim().lowercase(Locale.ROOT)
            val length = lengthStr.toDoubleOrNull() ?: continue

            val method = when {
                desc.contains("trenchless") || desc.contains("hdd") || desc.contains("ट्रेंचलेस") || desc.contains("एचडीडी") ->
                    LayingMethod.TRENCHLESS_HDD
                desc.contains("gi") || desc.contains("जीआई") ->
                    LayingMethod.GI_PIPE
                desc.contains("rcc") || desc.contains("आरसीसी") ->
                    LayingMethod.RCC_PIPE
                desc.contains("hdpe") || desc.contains("एचडीपीई") ->
                    LayingMethod.HDPE_PIPE
                desc.contains("road") || desc.contains("सड़क") ->
                    LayingMethod.ROAD_CROSSING
                desc.contains("track") || desc.contains("rail") || desc.contains("ट्रैक") ->
                    LayingMethod.TRACK_CROSSING
                desc.contains("bridge") || desc.contains("पुल") || desc.contains("ब्रिज") ->
                    LayingMethod.ALONG_BRIDGE
                desc.contains("culvert") || desc.contains("कल्वर्ट") ->
                    LayingMethod.CULVERT_CROSSING
                desc.contains("trough") || desc.contains("ट्रफ") ->
                    LayingMethod.CABLE_TROUGH
                desc.contains("tray") || desc.contains("ट्रे") ->
                    LayingMethod.CABLE_TRAY
                desc.contains("normal") || desc.contains("trench") || desc.contains("खाई") ->
                    LayingMethod.NORMAL_TRENCHING
                else -> LayingMethod.GI_PIPE
            }

            val depth = when (method) {
                LayingMethod.TRACK_CROSSING -> 1.2
                LayingMethod.ALONG_BRIDGE, LayingMethod.CABLE_TRAY -> 0.0
                else -> 1.0
            }
            segments.add(
                RouteSegment(
                    id = "SEG-$segIndex",
                    lengthMeters = length,
                    method = method,
                    depthMeters = depth
                )
            )
            segIndex++
        }

        return segments
    }

    private fun extractCableDetails(raw: String, lower: String): Pair<CableDetails, String?> {
        val cablePattern = Pattern.compile(
            """(\d+)\s*(?:nos\.?|nos|cables?|केबल)?\s*(?:x|\*|of|गुना)\s*(\d+)\s*(?:c|core|cores|कोर)""",
            Pattern.CASE_INSENSITIVE
        )
        val m1 = cablePattern.matcher(raw)
        if (m1.find()) {
            val count = m1.group(1)?.toIntOrNull() ?: 7
            val cores = m1.group(2)?.toIntOrNull() ?: 12
            return Pair(CableDetails(count = count, coreCount = cores, isDefault = false), null)
        }

        val singlePattern = Pattern.compile("""(\d+)\s*(?:c|core|cores|कोर)\s*(?:cable|केबल)?""", Pattern.CASE_INSENSITIVE)
        val m2 = singlePattern.matcher(raw)
        if (m2.find()) {
            val cores = m2.group(1)?.toIntOrNull() ?: 12
            return Pair(CableDetails(count = 1, coreCount = cores, isDefault = false), null)
        }

        return Pair(
            CableDetails(count = 7, coreCount = 12, isDefault = true),
            "Note: Cable details not specified; using standard default: 7 Nos. x 12 Core Signalling Cables."
        )
    }
}
