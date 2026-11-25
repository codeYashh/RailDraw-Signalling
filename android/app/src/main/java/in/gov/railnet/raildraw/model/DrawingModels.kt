package `in`.gov.railnet.raildraw.model

import java.io.Serializable

enum class LayingMethod(val displayName: String, val irsemRef: String) {
    NORMAL_TRENCHING("Normal Trenching", "IRSEM 15.3.1"),
    TRENCHLESS_HDD("Trenchless / HDD", "IRSEM 15.3.4"),
    GI_PIPE("GI Pipe", "IRSEM 15.3.2"),
    RCC_PIPE("RCC Pipe", "IRSEM 15.3.3"),
    HDPE_PIPE("HDPE Pipe", "IRSEM 15.3.5"),
    ROAD_CROSSING("Road Crossing", "IRSEM 15.4.1"),
    TRACK_CROSSING("Track Crossing", "IRSEM 15.4.2")
}

data class RouteSegment(
    val id: String,
    val lengthMeters: Double,
    val method: LayingMethod,
    val depthMeters: Double = 1.0,
    val remarks: String = ""
) : Serializable

data class CableDetails(
    val count: Int = 7,
    val coreCount: Int = 12,
    val type: String = "Signalling",
    val conductorSize: String = "1.5 sq mm",
    val isArmoured: Boolean = true,
    val isDefault: Boolean = false
) : Serializable {
    val description: String
        get() = "$count Nos. x $coreCount Core $type Cables ($conductorSize ${if (isArmoured) "Armoured" else "Unarmoured"})"
}

data class SignallingDrawing(
    val fromLocation: String = "L1",
    val toLocation: String = "L12",
    val totalLengthMeters: Double = 500.0,
    val segments: List<RouteSegment> = emptyList(),
    val cableDetails: CableDetails = CableDetails(),
    val drawingNo: String = "RDSO/SIG/CABLE/2026/01",
    val date: String = "17-11-2026",
    val railwayZone: String = "Northern Railway",
    val division: String = "Delhi Division",
    val notice: String? = null,
    val notes: List<String> = listOf(
        "1. Minimum cable burial depth: 1.0 m in normal ground; 1.2 m at track crossings.",
        "2. Cable warning tiles and route marker posts shall be provided as per IRSEM Chapter 15.",
        "3. Sand cushioning of 50 mm below and 100 mm above cable bundle."
    )
) : Serializable

sealed class ParseResult {
    data class Success(val drawing: SignallingDrawing, val notice: String? = null) : ParseResult()
    data class Error(val message: String) : ParseResult()
}
