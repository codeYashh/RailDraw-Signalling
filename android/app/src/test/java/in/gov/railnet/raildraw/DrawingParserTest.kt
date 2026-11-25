package `in`.gov.railnet.raildraw

import `in`.gov.railnet.raildraw.model.LayingMethod
import `in`.gov.railnet.raildraw.model.ParseResult
import `in`.gov.railnet.raildraw.parser.DrawingParser
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class DrawingParserTest {

    private lateinit var parser: DrawingParser

    @Before
    fun setUp() {
        parser = DrawingParser()
    }

    // Test 1: Base Example
    @Test
    fun test01_baseExamplePrompt() {
        val input = "Cable route from L1 to L12, 500 m: 20 m trenchless, 50 m GI pipe, 430 m normal trenching, 7 cables of 12 core"
        val result = parser.parse(input)

        assertTrue("Expected successful parse", result is ParseResult.Success)
        val drawing = (result as ParseResult.Success).drawing

        assertEquals("L1", drawing.fromLocation)
        assertEquals("L12", drawing.toLocation)
        assertEquals(500.0, drawing.totalLengthMeters, 0.01)

        assertEquals(3, drawing.segments.size)
        assertEquals(20.0, drawing.segments[0].lengthMeters, 0.01)
        assertEquals(LayingMethod.TRENCHLESS_HDD, drawing.segments[0].method)

        assertEquals(50.0, drawing.segments[1].lengthMeters, 0.01)
        assertEquals(LayingMethod.GI_PIPE, drawing.segments[1].method)

        assertEquals(430.0, drawing.segments[2].lengthMeters, 0.01)
        assertEquals(LayingMethod.NORMAL_TRENCHING, drawing.segments[2].method)

        assertEquals(7, drawing.cableDetails.count)
        assertEquals(12, drawing.cableDetails.coreCount)
        assertFalse(drawing.cableDetails.isDefault)
    }

    // Test 2: Spelling variants (meters, metres)
    @Test
    fun test02_metersAndMetresSpelling() {
        val input = "Cable route from L1 to L12, 500 meters: 20 metres trenchless, 50 metres GI pipe, 430 metres normal trenching, 7 cables of 12 core"
        val result = parser.parse(input)

        assertTrue(result is ParseResult.Success)
        val drawing = (result as ParseResult.Success).drawing
        assertEquals(500.0, drawing.totalLengthMeters, 0.01)
        assertEquals(3, drawing.segments.size)
    }

    // Test 3: Different segment order
    @Test
    fun test03_differentSegmentOrder() {
        val input = "Cable route from L1 to L12, 500 m: 430 m normal trenching, 20 m trenchless, 50 m GI pipe, 7 cables of 12 core"
        val result = parser.parse(input)

        assertTrue(result is ParseResult.Success)
        val drawing = (result as ParseResult.Success).drawing
        assertEquals(500.0, drawing.totalLengthMeters, 0.01)
        assertEquals(3, drawing.segments.size)
        assertEquals(LayingMethod.NORMAL_TRENCHING, drawing.segments[0].method)
        assertEquals(430.0, drawing.segments[0].lengthMeters, 0.01)
    }

    // Test 4: Number words (spoken form)
    @Test
    fun test04_numberWordsSpoken() {
        val input = "Cable route from L1 to L12, five hundred meters: twenty meters trenchless, fifty meters GI pipe, four hundred thirty meters normal trenching, seven cables of twelve core"
        val result = parser.parse(input)

        assertTrue(result is ParseResult.Success)
        val drawing = (result as ParseResult.Success).drawing
        assertEquals(500.0, drawing.totalLengthMeters, 0.01)
        assertEquals(3, drawing.segments.size)
        assertEquals(7, drawing.cableDetails.count)
        assertEquals(12, drawing.cableDetails.coreCount)
    }

    // Test 5: Segments do not add up (500 vs 470)
    @Test
    fun test05_segmentsDoNotAddUp() {
        val input = "Cable route from L1 to L12, 500 m: 20 m trenchless, 50 m GI pipe, 400 m normal trenching, 7 cables of 12 core"
        val result = parser.parse(input)

        assertTrue("Expected validation error", result is ParseResult.Error)
        val errorMsg = (result as ParseResult.Error).message
        assertTrue(errorMsg.contains("470") && errorMsg.contains("500"))
    }

    // Test 6: Missing cable details (standard default applied with notice)
    @Test
    fun test06_missingCableDetailsUsesDefault() {
        val input = "Cable route from L1 to L12, 500 m: 20 m trenchless, 50 m GI pipe, 430 m normal trenching"
        val result = parser.parse(input)

        assertTrue(result is ParseResult.Success)
        val success = result as ParseResult.Success
        assertEquals(7, success.drawing.cableDetails.count)
        assertEquals(12, success.drawing.cableDetails.coreCount)
        assertTrue(success.drawing.cableDetails.isDefault)
        assertNotNull(success.notice)
        assertTrue(success.notice!!.contains("standard default"))
    }

    // Test 7: Single segment route
    @Test
    fun test07_singleSegmentRoute() {
        val input = "Cable route from L1 to L2, 100 m: 100 m normal trenching"
        val result = parser.parse(input)

        assertTrue(result is ParseResult.Success)
        val drawing = (result as ParseResult.Success).drawing
        assertEquals(100.0, drawing.totalLengthMeters, 0.01)
        assertEquals(1, drawing.segments.size)
        assertEquals(LayingMethod.NORMAL_TRENCHING, drawing.segments[0].method)
    }

    // Test 8: Four segments including road crossing
    @Test
    fun test08_fourSegmentsWithRoadCrossing() {
        val input = "Cable route from L1 to L15, 600 m: 30 m road crossing, 50 m trenchless, 70 m GI pipe, 450 m normal trenching, 6 cables of 24 core"
        val result = parser.parse(input)

        assertTrue(result is ParseResult.Success)
        val drawing = (result as ParseResult.Success).drawing
        assertEquals(600.0, drawing.totalLengthMeters, 0.01)
        assertEquals(4, drawing.segments.size)
        assertEquals(LayingMethod.ROAD_CROSSING, drawing.segments[0].method)
        assertEquals(30.0, drawing.segments[0].lengthMeters, 0.01)
        assertEquals(6, drawing.cableDetails.count)
        assertEquals(24, drawing.cableDetails.coreCount)
    }

    // Test 9: Empty text input never crashes
    @Test
    fun test09_emptyTextHandling() {
        val result = parser.parse("")
        assertTrue(result is ParseResult.Error)
        val msg = (result as ParseResult.Error).message
        assertTrue(msg.contains("describe your signalling route"))
    }

    // Test 10: Random unrelated text never crashes
    @Test
    fun test10_unrelatedTextHandling() {
        val result = parser.parse("The quick brown fox jumps over the lazy dog.")
        assertTrue(result is ParseResult.Error)
        val msg = (result as ParseResult.Error).message
        assertTrue(msg.contains("Could not detect route segments"))
    }

    // Additional: Hindi prompt with Devanagari numerals
    @Test
    fun test11_hindiInputWithDevanagariNumerals() {
        val input = "एल १ से एल १२ तक ५०० मीटर केबल रूट बनाओ, २० मीटर ट्रेंचलेस, ५० मीटर जीआई पाइप और ४३० मीटर नॉर्मल ट्रेंचिंग ७x१२ कोर"
        val result = parser.parse(input)

        assertTrue(result is ParseResult.Success)
        val drawing = (result as ParseResult.Success).drawing
        assertEquals("L1", drawing.fromLocation)
        assertEquals("L12", drawing.toLocation)
        assertEquals(500.0, drawing.totalLengthMeters, 0.01)
        assertEquals(3, drawing.segments.size)
        assertEquals(7, drawing.cableDetails.count)
        assertEquals(12, drawing.cableDetails.coreCount)
    }
}
