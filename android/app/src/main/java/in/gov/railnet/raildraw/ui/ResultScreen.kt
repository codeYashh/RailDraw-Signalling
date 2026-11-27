package `in`.gov.railnet.raildraw.ui

import android.graphics.Bitmap
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import `in`.gov.railnet.raildraw.model.DrawingVariant
import `in`.gov.railnet.raildraw.model.SignallingDrawing
import `in`.gov.railnet.raildraw.ui.theme.*

@Composable
fun ResultScreen(
    drawing: SignallingDrawing,
    drawingBitmap: Bitmap,
    isDark: Boolean,
    onVariantChange: (DrawingVariant) -> Unit,
    onSaveJpg: () -> Unit,
    onSaveA4Pdf: () -> Unit,
    onShareJpg: () -> Unit,
    onSharePdf: () -> Unit,
    onEdit: () -> Unit
) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offsetX by remember { mutableFloatStateOf(0f) }
    var offsetY by remember { mutableFloatStateOf(0f) }
    var showShareDialog by remember { mutableStateOf(false) }

    val bgColor = if (isDark) BackgroundDark else BackgroundLight
    val glassSurface = if (isDark) Color.White.copy(alpha = 0.08f) else Color.White.copy(alpha = 0.9f)
    val glassOrbBrush = if (isDark) {
        Brush.verticalGradient(
            listOf(Color.White.copy(alpha = 0.22f), Color.White.copy(alpha = 0.06f), Color(0xFF94A3B8).copy(alpha = 0.12f))
        )
    } else {
        Brush.verticalGradient(
            listOf(Color.White.copy(alpha = 0.96f), Color(0xFFF1F5F9).copy(alpha = 0.68f), Color.White.copy(alpha = 0.86f))
        )
    }
    val glassRimBrush = if (isDark) {
        Brush.verticalGradient(listOf(Color.White.copy(alpha = 0.42f), Color.White.copy(alpha = 0.10f)))
    } else {
        Brush.verticalGradient(listOf(Color.White, Color(0xFFCBD5E1).copy(alpha = 0.75f)))
    }
    val glassBorder = if (isDark) Color.White.copy(alpha = 0.14f) else BorderLight
    val primaryText = if (isDark) TextLight else TextDark
    val mutedText = if (isDark) TextMutedDark else TextMuted
    val accentColor = if (isDark) AccentSky else AccentBlue

    Scaffold(
        containerColor = bgColor,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .shadow(8.dp, CircleShape, clip = false)
                                .clip(CircleShape)
                                .background(glassOrbBrush)
                                .border(1.2.dp, glassRimBrush, CircleShape)
                                .clickable(onClick = onEdit),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = primaryText,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        Column {
                            Text(
                                text = "${drawing.fromLocation} to ${drawing.toLocation}",
                                color = primaryText,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "${drawing.totalLengthMeters.toInt()} m  ·  ${drawing.variant.shortLabel}",
                                color = mutedText,
                                fontSize = 12.sp
                            )
                        }
                    }

                    if (scale != 1f || offsetX != 0f || offsetY != 0f) {
                        Box(
                            modifier = Modifier
                                .shadow(6.dp, CircleShape, clip = false)
                                .clip(CircleShape)
                                .background(glassOrbBrush)
                                .border(1.2.dp, glassRimBrush, CircleShape)
                                .clickable {
                                    scale = 1f
                                    offsetX = 0f
                                    offsetY = 0f
                                }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text("Fit", color = accentColor, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                // Switch between 3 drawing types directly on the result screen
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    DrawingVariant.entries.forEach { variant ->
                        val selected = variant == drawing.variant
                        Box(
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(
                                    if (selected) accentColor.copy(alpha = if (isDark) 0.24f else 0.14f)
                                    else glassSurface
                                )
                                .border(
                                    width = if (selected) 1.5.dp else 1.dp,
                                    color = if (selected) accentColor else glassBorder,
                                    shape = CircleShape
                                )
                                .clickable { onVariantChange(variant) }
                                .padding(horizontal = 14.dp, vertical = 7.dp)
                        ) {
                            Text(
                                text = variant.shortLabel,
                                fontSize = 12.sp,
                                fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Medium,
                                color = if (selected) accentColor else primaryText
                            )
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 6.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .border(1.dp, glassBorder, RoundedCornerShape(20.dp))
                    .background(Color.White)
                    .pointerInput(Unit) {
                        detectTransformGestures { _, pan, zoom, _ ->
                            scale = (scale * zoom).coerceIn(0.8f, 5.0f)
                            offsetX += pan.x * scale
                            offsetY += pan.y * scale
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                Image(
                    bitmap = drawingBitmap.asImageBitmap(),
                    contentDescription = "Signalling Drawing",
                    modifier = Modifier
                        .fillMaxSize()
                        .graphicsLayer(
                            scaleX = scale,
                            scaleY = scale,
                            translationX = offsetX,
                            translationY = offsetY
                        )
                )
            }

            // Rounded Liquid Glass Action Bar (Save JPG, Save A4 PDF, Share)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onSaveJpg,
                    shape = CircleShape,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isDark) AccentSky else RailwayNavy,
                        contentColor = if (isDark) RailwayDarkNavy else Color.White
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                ) {
                    Icon(Icons.Filled.Image, contentDescription = null, modifier = Modifier.size(17.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Save JPG", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }

                OutlinedButton(
                    onClick = onSaveA4Pdf,
                    shape = CircleShape,
                    border = BorderStroke(1.dp, glassBorder),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = glassSurface,
                        contentColor = primaryText
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                ) {
                    Icon(Icons.Filled.PictureAsPdf, contentDescription = null, modifier = Modifier.size(17.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("A4 PDF", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }

                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .shadow(8.dp, CircleShape, clip = false)
                        .clip(CircleShape)
                        .background(glassOrbBrush)
                        .border(1.2.dp, glassRimBrush, CircleShape)
                        .clickable { showShareDialog = true },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Filled.Share, contentDescription = "Share", tint = primaryText, modifier = Modifier.size(19.dp))
                }
            }
        }
    }

    if (showShareDialog) {
        AlertDialog(
            onDismissRequest = { showShareDialog = false },
            shape = RoundedCornerShape(24.dp),
            title = { Text("Share Drawing", fontWeight = FontWeight.SemiBold, fontSize = 17.sp) },
            text = { Text("Choose format to share:", fontSize = 13.sp) },
            confirmButton = {
                Button(
                    onClick = {
                        showShareDialog = false
                        onShareJpg()
                    },
                    shape = CircleShape
                ) {
                    Text("Share JPG")
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = {
                        showShareDialog = false
                        onSharePdf()
                    },
                    shape = CircleShape
                ) {
                    Text("Share A4 PDF")
                }
            }
        )
    }
}
