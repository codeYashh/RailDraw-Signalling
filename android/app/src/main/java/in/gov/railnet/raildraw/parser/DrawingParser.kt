package in.gov.railnet.raildraw.parser

import in.gov.railnet.raildraw.model.*
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
            val (fromLoc, toLoc) = extractLocations(normalized, lower)

            // 2. Extract Segments
            val segments = extractSegments(normalized, lower)
            if (segments.isEmpty()) {
                return ParseResult.Error(
                    "Could not detect route segments. Please specify lengths and methods (e.g. 20m trenchless, 50m GI pipe, 430m normal trenching)."
                )
            }

            // 3. Extract Total Length
            val totalLength = extractTotalLength(normalized, lower)
            val segmentsSum = segments.sumOf { it.lengthMeters }

            if (totalLength != null && totalLength > 0) {
                val diff = Math.abs(segmentsSum - totalLength)
                if (diff > 0.01) {
                    val sumStr = if (segmentsSum % 1.0 == 0.0) segmentsSum.toInt().toString() else "%.1f".format(segmentsSum)
                    val totalStr = if (totalLength % 1.0 == 0.0) totalLength.toInt().toString() else "%.1f".format(totalLength)
                    return ParseResult.Error(
                        "Segments add up to $sumStr m but total is $totalStr m. Please adjust the lengths so they match."
                    )
                }
            }

            val finalTotal = totalLength ?: segmentsSum

            // 4. Extract Cable Details
            val (cableDetails, notice) = extractCableDetails(normalized, lower)
            val currentDate = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault()).format(Date())

            val drawing = SignallingDrawing(
                fromLocation = fromLoc,
                toLocation = toLoc,
                totalLengthMeters = finalTotal,
                segments = segments,
                cableDetails = cableDetails,
                date = currentDate,
                notice = notice
            )

            return ParseResult.Success(drawing, notice)

        } catch (e: Exception) {
            return ParseResult.Error("Could not understand drawing details: ${e.localizedMessage ?: "Invalid format"}")
        }
    }

    private fun extractLocations(raw: String, lower: String): Pair<String, String> {
        val engRegex = Pattern.compile(
            """\b(?:from|between)\s+([A-Za-z0-9_\-]+)\s+(?:to|and)\s+([A-Za-z0-9_\-]+)\b""",
            Pattern.CASE_INSENSITIVE
        )
        val engMatcher = engRegex.matcher(raw)
        if (engMatcher.find()) {
            val from = cleanLocation(engMatcher.group(1))
            val to = cleanLocation(engMatcher.group(2))
            if (from.isNotBlank() && to.isNotBlank()) {
                return Pair(from, to)
            }
        }

        val hindiRegex = Pattern.compile("""([A-Za-z0-9_\-\u0900-\u097F]+)\s*से\s+([A-Za-z0-9_\-\u0900-\u097F]+)\s*(?:तक)?""")
        val hindiMatcher = hindiRegex.matcher(raw)
        if (hindiMatcher.find()) {
            val from = cleanLocation(hindiMatcher.group(1))
            val to = cleanLocation(hindiMatcher.group(2))
            if (from.isNotBlank() && to.isNotBlank()) {
                return Pair(from, to)
            }
        }

        return Pair("L1", "L12")
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
            """(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres|मीटर)?\s*[:\-]?""" +
            """\s*(trenchless|hdd|ट्रेंचलेस|एचडीडी|gi\s*pipe|g\.i|जीआई|rcc|आरसीसी|hdpe|एचडीपीई|road\s*crossing|सड़क|track\s*crossing|rail\s*crossing|ट्रैक|normal(?:\s*trenching)?|trenching|trench|खाई|pipe|पाइप)""",
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
                desc.contains("normal") || desc.contains("trench") || desc.contains("खाई") ->
                    LayingMethod.NORMAL_TRENCHING
                else -> LayingMethod.GI_PIPE
            }

            val depth = if (method == LayingMethod.TRACK_CROSSING) 1.2 else 1.0
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
