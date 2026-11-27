package `in`.gov.railnet.raildraw.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import `in`.gov.railnet.raildraw.R
import `in`.gov.railnet.raildraw.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun SplashScreen(
    isDark: Boolean,
    onFinish: () -> Unit
) {
    val logoScale = remember { Animatable(0.45f) }
    val logoAlpha = remember { Animatable(0f) }
    val cornerRadiusDp = remember { Animatable(56f) }
    val textAlpha = remember { Animatable(0f) }
    val textOffsetY = remember { Animatable(18f) }
    val progressWidth = remember { Animatable(0f) }
    val screenAlpha = remember { Animatable(1f) }
    val screenScale = remember { Animatable(1f) }

    var exiting by remember { mutableStateOf(false) }

    fun finishNow() {
        if (exiting) return
        exiting = true
        onFinish()
    }

    LaunchedEffect(Unit) {
        // Phase 1: Smooth orb-to-squircle morph in
        launch {
            logoScale.animateTo(
                1f,
                animationSpec = tween(durationMillis = 620, easing = FastOutSlowInEasing)
            )
        }
        launch {
            logoAlpha.animateTo(
                1f,
                animationSpec = tween(durationMillis = 480, easing = FastOutSlowInEasing)
            )
        }
        launch {
            cornerRadiusDp.animateTo(
                28f,
                animationSpec = tween(durationMillis = 650, easing = FastOutSlowInEasing)
            )
        }

        // Phase 2: Smooth title & progress glide
        delay(180)
        launch {
            textAlpha.animateTo(1f, animationSpec = tween(480, easing = FastOutSlowInEasing))
        }
        launch {
            textOffsetY.animateTo(0f, animationSpec = tween(520, easing = FastOutSlowInEasing))
        }
        launch {
            progressWidth.animateTo(1f, animationSpec = tween(1050, easing = FastOutSlowInEasing))
        }

        // Phase 3: Smooth morph-out transition into Home screen
        delay(1200)
        if (!exiting) {
            launch {
                logoScale.animateTo(1.16f, animationSpec = tween(420, easing = FastOutSlowInEasing))
            }
            launch {
                screenScale.animateTo(1.04f, animationSpec = tween(420, easing = FastOutSlowInEasing))
            }
            screenAlpha.animateTo(0f, animationSpec = tween(420, easing = FastOutSlowInEasing))
            finishNow()
        }
    }

    val bgBrush = if (isDark) {
        Brush.radialGradient(
            colors = listOf(Color(0xFF13263E), Color(0xFF0A1424), Color(0xFF050B14))
        )
    } else {
        Brush.radialGradient(
            colors = listOf(Color(0xFFFFFFFF), Color(0xFFF1F5F9), Color(0xFFE2E8F0))
        )
    }

    val glassCardBg = if (isDark) Color.White.copy(alpha = 0.08f) else Color.White.copy(alpha = 0.88f)
    val glassBorder = if (isDark) Color.White.copy(alpha = 0.16f) else Color(0xFFCBD5E1)
    val titleColor = if (isDark) TextLight else TextDark
    val accentColor = if (isDark) AccentSky else AccentBlue
    val subColor = if (isDark) Color(0xFFFBBF24) else Color(0xFFB45309)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .scale(screenScale.value)
            .alpha(screenAlpha.value)
            .background(bgBrush)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { finishNow() }
            .padding(horizontal = 24.dp, vertical = 32.dp)
    ) {
        // Top pill badge
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.TopCenter)
                .alpha(textAlpha.value),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .clip(CircleShape)
                    .background(glassCardBg)
                    .border(1.dp, glassBorder, CircleShape)
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "RDSO S&T CAD",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isDark) TextSecondaryDark else TextSecondary
                )
            }

            Box(
                modifier = Modifier
                    .clip(CircleShape)
                    .background(glassCardBg)
                    .border(1.dp, glassBorder, CircleShape)
                    .clickable { finishNow() }
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "Skip",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isDark) TextSecondaryDark else TextSecondary
                )
            }
        }

        // Center morphing logo & title
        Column(
            modifier = Modifier.align(Alignment.Center),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .scale(logoScale.value)
                    .alpha(logoAlpha.value)
                    .size(116.dp)
                    .clip(RoundedCornerShape(cornerRadiusDp.value.dp))
                    .background(glassCardBg)
                    .border(1.dp, glassBorder, RoundedCornerShape(cornerRadiusDp.value.dp))
                    .padding(10.dp),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.ic_raildraw_logo),
                    contentDescription = "RailDraw Logo",
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(22.dp))
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .offset(y = textOffsetY.value.dp)
                    .alpha(textAlpha.value)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "RailDraw ",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        color = titleColor
                    )
                    Text(
                        text = "Signalling",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Light,
                        color = accentColor
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "Indian Railways S&T CAD",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = subColor
                )

                Spacer(modifier = Modifier.height(22.dp))

                // Smooth progress hairline
                Box(
                    modifier = Modifier
                        .width(136.dp)
                        .height(3.dp)
                        .clip(CircleShape)
                        .background(if (isDark) Color.White.copy(alpha = 0.12f) else Color(0xFFCBD5E1))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxHeight()
                            .fillMaxWidth(progressWidth.value)
                            .clip(CircleShape)
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(Color(0xFFF97316), AccentSky, Color(0xFF16A34A))
                                )
                            )
                    )
                }
            }
        }

        // Footer
        Text(
            text = "Designed for Indian Railways S&T Engineers",
            fontSize = 11.sp,
            color = if (isDark) TextMutedDark else TextMuted,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .alpha(textAlpha.value)
        )
    }
}
