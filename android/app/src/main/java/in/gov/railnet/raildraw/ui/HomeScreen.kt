package `in`.gov.railnet.raildraw.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import `in`.gov.railnet.raildraw.R
import `in`.gov.railnet.raildraw.model.DrawingVariant
import `in`.gov.railnet.raildraw.ui.theme.*
import `in`.gov.railnet.raildraw.util.DrawingHistoryItem
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    promptText: String,
    onPromptChange: (String) -> Unit,
    selectedVariant: DrawingVariant,
    onVariantChange: (DrawingVariant) -> Unit,
    isListening: Boolean,
    isDark: Boolean,
    onToggleTheme: () -> Unit,
    onMicClick: () -> Unit,
    onGenerateClick: () -> Unit,
    onAboutClick: () -> Unit,
    historyItems: List<DrawingHistoryItem>,
    onSelectHistory: (DrawingHistoryItem) -> Unit,
    onDeleteHistory: (String) -> Unit,
    onClearHistory: () -> Unit,
    errorMessage: String? = null
) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    val bgBrush = if (isDark) {
        Brush.verticalGradient(listOf(Color(0xFF0A1424), BackgroundDark))
    } else {
        Brush.verticalGradient(listOf(Color(0xFFF8FAFC), BackgroundLight))
    }

    val glassSurface = if (isDark) Color.White.copy(alpha = 0.08f) else Color.White.copy(alpha = 0.85f)
    val glassBorder = if (isDark) Color.White.copy(alpha = 0.14f) else Color(0xFFD5DFEA)
    val primaryText = if (isDark) TextLight else TextDark
    val secondaryText = if (isDark) TextSecondaryDark else TextSecondary
    val mutedText = if (isDark) TextMutedDark else TextMuted
    val accentColor = if (isDark) AccentSky else AccentBlue

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet(
                drawerContainerColor = if (isDark) SurfaceCardDark else SurfaceCard,
                drawerShape = RoundedCornerShape(topEnd = 28.dp, bottomEnd = 28.dp),
                modifier = Modifier.width(300.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp, vertical = 20.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(RailwayNavy),
                                contentAlignment = Alignment.Center
                            ) {
                                Image(
                                    painter = painterResource(id = R.drawable.ic_raildraw_logo),
                                    contentDescription = null,
                                    modifier = Modifier.size(28.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "Past Drawings",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 16.sp,
                                    color = primaryText
                                )
                                Text(
                                    text = "${historyItems.size} saved",
                                    fontSize = 11.sp,
                                    color = mutedText
                                )
                            }
                        }

                        if (historyItems.isNotEmpty()) {
                            IconButton(onClick = onClearHistory) {
                                Icon(
                                    imageVector = Icons.Filled.DeleteSweep,
                                    contentDescription = "Clear history",
                                    tint = mutedText
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    HorizontalDivider(color = glassBorder)
                    Spacer(modifier = Modifier.height(10.dp))

                    if (historyItems.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Your generated drawings will appear here.",
                                fontSize = 13.sp,
                                color = mutedText,
                                textAlign = TextAlign.Center
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(historyItems, key = { it.id }) { item ->
                                Surface(
                                    shape = RoundedCornerShape(18.dp),
                                    color = glassSurface,
                                    border = BorderStroke(1.dp, glassBorder),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(18.dp))
                                        .clickable {
                                            scope.launch { drawerState.close() }
                                            onSelectHistory(item)
                                        }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = item.title,
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = primaryText,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                            Spacer(modifier = Modifier.height(2.dp))
                                            Text(
                                                text = "${item.variant.shortLabel}  ·  ${item.timestamp}",
                                                fontSize = 11.sp,
                                                color = mutedText,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                        }
                                        IconButton(
                                            onClick = { onDeleteHistory(item.id) },
                                            modifier = Modifier.size(30.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Filled.Close,
                                                contentDescription = "Delete",
                                                tint = mutedText,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    HorizontalDivider(color = glassBorder)
                    Spacer(modifier = Modifier.height(10.dp))

                    // Sidebar footer actions
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = onToggleTheme,
                            shape = CircleShape,
                            border = BorderStroke(1.dp, glassBorder),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = if (isDark) Icons.Filled.LightMode else Icons.Filled.DarkMode,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(if (isDark) "Light" else "Dark", fontSize = 12.sp)
                        }

                        OutlinedButton(
                            onClick = {
                                scope.launch { drawerState.close() }
                                onAboutClick()
                            },
                            shape = CircleShape,
                            border = BorderStroke(1.dp, glassBorder),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.SystemUpdate,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Updates", fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    ) {
        Scaffold(
            containerColor = Color.Transparent,
            modifier = Modifier.background(bgBrush)
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Top Liquid Glass Bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(glassSurface)
                            .border(1.dp, glassBorder, CircleShape)
                            .clickable { scope.launch { drawerState.open() } },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Menu,
                            contentDescription = "Past drawings",
                            tint = primaryText
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(glassSurface)
                            .border(1.dp, glassBorder, CircleShape)
                            .padding(horizontal = 14.dp, vertical = 7.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(22.dp)
                                .clip(RoundedCornerShape(7.dp))
                                .background(RailwayNavy),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.ic_raildraw_logo),
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Text(
                            text = "RailDraw",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = primaryText
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(glassSurface)
                                .border(1.dp, glassBorder, CircleShape)
                                .clickable(onClick = onToggleTheme),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (isDark) Icons.Filled.LightMode else Icons.Filled.DarkMode,
                                contentDescription = "Toggle Theme",
                                tint = primaryText,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(glassSurface)
                                .border(1.dp, glassBorder, CircleShape)
                                .clickable(onClick = onAboutClick),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Info,
                                contentDescription = "About & Updates",
                                tint = primaryText,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }

                // Gemini-style Center Stage ("Let's Create")
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "Let's Create",
                        fontSize = 34.sp,
                        fontWeight = FontWeight.Bold,
                        color = primaryText,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Indian Railways S&T CAD Drawings",
                        fontSize = 14.sp,
                        color = mutedText,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(22.dp))

                    // 3 Drawing Type Liquid Glass Pills
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally)
                    ) {
                        DrawingVariant.entries.forEach { variant ->
                            val selected = variant == selectedVariant
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
                                    .padding(horizontal = 14.dp, vertical = 9.dp)
                            ) {
                                Text(
                                    text = variant.shortLabel,
                                    fontSize = 12.sp,
                                    fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Medium,
                                    color = if (selected) accentColor else secondaryText
                                )
                            }
                        }
                    }

                    if (!errorMessage.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(16.dp))
                        Surface(
                            shape = RoundedCornerShape(18.dp),
                            color = ErrorBackground,
                            border = BorderStroke(1.dp, ErrorBorder),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = errorMessage,
                                color = ErrorRed,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(14.dp)
                            )
                        }
                    }
                }

                // Bottom Gemini-style Liquid Glass Prompt Composer
                Surface(
                    shape = RoundedCornerShape(28.dp),
                    color = glassSurface,
                    border = BorderStroke(1.dp, glassBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(min = 44.dp, max = 120.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            if (promptText.isEmpty()) {
                                Text(
                                    text = "Type..",
                                    color = mutedText,
                                    fontSize = 15.sp
                                )
                            }
                            BasicTextField(
                                value = promptText,
                                onValueChange = onPromptChange,
                                textStyle = TextStyle(
                                    color = primaryText,
                                    fontSize = 15.sp,
                                    lineHeight = 21.sp
                                ),
                                cursorBrush = SolidColor(accentColor),
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                                keyboardActions = KeyboardActions(
                                    onSend = { if (promptText.isNotBlank()) onGenerateClick() }
                                ),
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = if (isListening) "Listening..." else selectedVariant.displayName,
                                fontSize = 12.sp,
                                color = if (isListening) ErrorRed else mutedText,
                                fontWeight = if (isListening) FontWeight.SemiBold else FontWeight.Normal
                            )

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                // Auto-detect Voice Mic Pill
                                Box(
                                    modifier = Modifier
                                        .size(42.dp)
                                        .clip(CircleShape)
                                        .background(
                                            if (isListening) ErrorRed.copy(alpha = 0.16f)
                                            else if (isDark) Color.White.copy(alpha = 0.08f)
                                            else Color(0xFFE2E8F0)
                                        )
                                        .clickable(onClick = onMicClick),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = if (isListening) Icons.Filled.MicOff else Icons.Filled.Mic,
                                        contentDescription = "Voice Input",
                                        tint = if (isListening) ErrorRed else primaryText,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }

                                // Rounded Liquid Glass Generate Pill
                                Button(
                                    onClick = onGenerateClick,
                                    enabled = promptText.isNotBlank(),
                                    shape = CircleShape,
                                    contentPadding = PaddingValues(horizontal = 18.dp, vertical = 10.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (isDark) AccentSky else RailwayNavy,
                                        contentColor = if (isDark) RailwayDarkNavy else Color.White
                                    ),
                                    modifier = Modifier.height(42.dp)
                                ) {
                                    Text(
                                        text = "Generate",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Icon(
                                        imageVector = Icons.Filled.ArrowForward,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
