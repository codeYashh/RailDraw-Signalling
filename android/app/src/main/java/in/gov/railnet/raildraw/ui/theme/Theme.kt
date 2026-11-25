package `in`.gov.railnet.raildraw.ui.theme

import android.app.Activity
import android.content.Context
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = RailwayNavy,
    onPrimary = Color.White,
    primaryContainer = SurfaceSubtle,
    onPrimaryContainer = TextDark,
    secondary = AccentBlue,
    onSecondary = Color.White,
    background = BackgroundLight,
    surface = SurfaceCard,
    surfaceVariant = SurfaceSubtle,
    onBackground = TextDark,
    onSurface = TextDark,
    onSurfaceVariant = TextSecondary,
    outline = BorderLight
)

private val DarkColorScheme = darkColorScheme(
    primary = AccentSky,
    onPrimary = RailwayDarkNavy,
    primaryContainer = SurfaceSubtleDark,
    onPrimaryContainer = TextLight,
    secondary = AccentSky,
    onSecondary = RailwayDarkNavy,
    background = BackgroundDark,
    surface = SurfaceCardDark,
    surfaceVariant = SurfaceSubtleDark,
    onBackground = TextLight,
    onSurface = TextLight,
    onSurfaceVariant = TextSecondaryDark,
    outline = BorderDark
)

object ThemePrefs {
    private const val PREFS_NAME = "raildraw_theme_prefs"
    private const val KEY_IS_DARK = "is_dark_mode"

    fun isDarkMode(context: Context): Boolean =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getBoolean(KEY_IS_DARK, false)

    fun setDarkMode(context: Context, isDark: Boolean) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_IS_DARK, isDark)
            .apply()
    }
}

@Composable
fun RailDrawTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            val barColor = if (darkTheme) BackgroundDark else BackgroundLight
            window.statusBarColor = barColor.toArgb()
            window.navigationBarColor = barColor.toArgb()
            val controller = WindowCompat.getInsetsController(window, view)
            controller.isAppearanceLightStatusBars = !darkTheme
            controller.isAppearanceLightNavigationBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
