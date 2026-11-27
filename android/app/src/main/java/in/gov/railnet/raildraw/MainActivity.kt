package `in`.gov.railnet.raildraw

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.speech.RecognizerIntent
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.runtime.*
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import `in`.gov.railnet.raildraw.drawing.DrawingRenderer
import `in`.gov.railnet.raildraw.model.DrawingVariant
import `in`.gov.railnet.raildraw.model.ParseResult
import `in`.gov.railnet.raildraw.model.SignallingDrawing
import `in`.gov.railnet.raildraw.parser.DrawingParser
import `in`.gov.railnet.raildraw.ui.AboutAndUpdatesDialog
import `in`.gov.railnet.raildraw.ui.HomeScreen
import `in`.gov.railnet.raildraw.ui.ResultScreen
import `in`.gov.railnet.raildraw.ui.SplashScreen
import `in`.gov.railnet.raildraw.ui.UpdateAvailableDialog
import `in`.gov.railnet.raildraw.ui.theme.RailDrawTheme
import `in`.gov.railnet.raildraw.ui.theme.ThemePrefs
import `in`.gov.railnet.raildraw.updater.GitHubUpdater
import `in`.gov.railnet.raildraw.updater.ReleaseInfo
import `in`.gov.railnet.raildraw.updater.UpdateCheckResult
import `in`.gov.railnet.raildraw.util.DrawingHistoryItem
import `in`.gov.railnet.raildraw.util.HistoryStore
import `in`.gov.railnet.raildraw.util.StorageUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.*

class MainActivity : ComponentActivity() {

    private val parser = DrawingParser()
    private val renderer = DrawingRenderer()

    private val speechRecognitionLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == Activity.RESULT_OK) {
                val matches = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                if (!matches.isNullOrEmpty()) {
                    onSpeechResultCallback?.invoke(matches[0])
                }
            }
            onSpeechEndCallback?.invoke()
        }

    private val requestRecordAudioPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                startVoiceRecognition()
            } else {
                Toast.makeText(
                    this,
                    getString(R.string.mic_denied_message),
                    Toast.LENGTH_LONG
                ).show()
                onSpeechEndCallback?.invoke()
            }
        }

    private var onSpeechResultCallback: ((String) -> Unit)? = null
    private var onSpeechEndCallback: (() -> Unit)? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            var isDark by remember { mutableStateOf(ThemePrefs.isDarkMode(this@MainActivity)) }

            RailDrawTheme(darkTheme = isDark) {
                var showSplash by remember { mutableStateOf(true) }
                var promptText by remember { mutableStateOf("") }
                var selectedVariant by remember { mutableStateOf(DrawingVariant.ROUTE_PLAN) }
                var currentDrawing by remember { mutableStateOf<SignallingDrawing?>(null) }
                var currentBitmap by remember { mutableStateOf<Bitmap?>(null) }
                var isListening by remember { mutableStateOf(false) }
                var errorMessage by remember { mutableStateOf<String?>(null) }
                var historyItems by remember {
                    mutableStateOf<List<DrawingHistoryItem>>(HistoryStore.getHistory(this@MainActivity))
                }

                // In-app GitHub Releases updater states
                val installedVersion = remember { GitHubUpdater.getInstalledVersionName(this@MainActivity) }
                var availableRelease by remember { mutableStateOf<ReleaseInfo?>(null) }
                var showAboutDialog by remember { mutableStateOf(false) }
                var isCheckingUpdates by remember { mutableStateOf(false) }
                var aboutStatusMessage by remember { mutableStateOf<String?>(null) }
                var isDownloadingUpdate by remember { mutableStateOf(false) }
                var downloadProgress by remember { mutableStateOf(0f) }
                var downloadStatus by remember { mutableStateOf("") }
                var updateErrorMessage by remember { mutableStateOf<String?>(null) }

                // Background throttled update check on launch (at most once every 4 hours)
                LaunchedEffect(Unit) {
                    if (GitHubUpdater.shouldAutoCheck(this@MainActivity)) {
                        when (val res = GitHubUpdater.checkForUpdate(this@MainActivity, isAutoCheck = true)) {
                            is UpdateCheckResult.UpdateAvailable -> availableRelease = res.release
                            else -> Unit
                        }
                    }
                }

                fun openDrawing(text: String, variant: DrawingVariant, saveToHistory: Boolean) {
                    generateFromPrompt(
                        text = text,
                        variant = variant,
                        onSuccess = { drawing, bmp ->
                            currentDrawing = drawing
                            currentBitmap = bmp
                            if (saveToHistory) {
                                historyItems = HistoryStore.addEntry(
                                    context = this@MainActivity,
                                    title = "${drawing.fromLocation} to ${drawing.toLocation} (${drawing.totalLengthMeters.toInt()} m)",
                                    prompt = text,
                                    variant = variant
                                )
                            }
                        },
                        onError = { err ->
                            errorMessage = err
                        }
                    )
                }

                // Connect speech recognizer callbacks
                DisposableEffect(selectedVariant) {
                    onSpeechResultCallback = { resultText ->
                        promptText = resultText
                        isListening = false
                        errorMessage = null
                        openDrawing(resultText, selectedVariant, saveToHistory = true)
                    }
                    onSpeechEndCallback = { isListening = false }
                    onDispose {
                        onSpeechResultCallback = null
                        onSpeechEndCallback = null
                    }
                }

                if (showSplash) {
                    SplashScreen(
                        isDark = isDark,
                        onFinish = { showSplash = false }
                    )
                } else {
                    val isShowingResult = currentDrawing != null && currentBitmap != null
                    if (isShowingResult) {
                        BackHandler {
                            currentDrawing = null
                            currentBitmap = null
                        }
                    }

                    AnimatedContent(
                        targetState = isShowingResult,
                        transitionSpec = {
                            fadeIn(animationSpec = tween(280)) togetherWith
                                fadeOut(animationSpec = tween(220))
                        },
                        label = "MainScreenTransition"
                    ) { showResult ->
                        if (showResult && currentDrawing != null && currentBitmap != null) {
                            ResultScreen(
                                drawing = currentDrawing!!,
                                drawingBitmap = currentBitmap!!,
                                isDark = isDark,
                                onVariantChange = { newVariant ->
                                    selectedVariant = newVariant
                                    val base = currentDrawing!!.copy(variant = newVariant)
                                    lifecycleScope.launch(Dispatchers.Default) {
                                        val bmp = renderer.renderToBitmap(base)
                                        withContext(Dispatchers.Main) {
                                            currentDrawing = base
                                            currentBitmap = bmp
                                        }
                                    }
                                },
                                onSaveJpg = {
                                    val uri = StorageUtils.saveBitmapToGallery(
                                        this@MainActivity,
                                        currentBitmap!!,
                                        "RailDraw_${currentDrawing!!.fromLocation}_to_${currentDrawing!!.toLocation}"
                                    )
                                    Toast.makeText(
                                        this@MainActivity,
                                        if (uri != null) "Saved JPG to Pictures/RailDraw" else "Failed to save JPG.",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                },
                                onSaveA4Pdf = {
                                    val uri = StorageUtils.saveAsPdf(
                                        this@MainActivity,
                                        currentBitmap!!,
                                        "RailDraw_${currentDrawing!!.fromLocation}_to_${currentDrawing!!.toLocation}"
                                    )
                                    Toast.makeText(
                                        this@MainActivity,
                                        if (uri != null) "Saved A4 PDF to Download/RailDraw" else "Failed to save PDF.",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                },
                                onShareJpg = {
                                    StorageUtils.shareDrawing(this@MainActivity, currentBitmap!!, promptText)
                                },
                                onSharePdf = {
                                    StorageUtils.shareDrawingAsPdf(this@MainActivity, currentBitmap!!, promptText)
                                },
                                onEdit = {
                                    currentDrawing = null
                                    currentBitmap = null
                                }
                            )
                        } else {
                            HomeScreen(
                                promptText = promptText,
                                onPromptChange = {
                                    promptText = it
                                    errorMessage = null
                                },
                                selectedVariant = selectedVariant,
                                onVariantChange = { selectedVariant = it },
                                isListening = isListening,
                                isDark = isDark,
                                onToggleTheme = {
                                    isDark = !isDark
                                    ThemePrefs.setDarkMode(this@MainActivity, isDark)
                                },
                                onMicClick = {
                                    checkAndStartMic { isListening = true }
                                },
                                onGenerateClick = {
                                    errorMessage = null
                                    openDrawing(promptText, selectedVariant, saveToHistory = true)
                                },
                                onAboutClick = {
                                    aboutStatusMessage = null
                                    showAboutDialog = true
                                },
                                historyItems = historyItems,
                                onSelectHistory = { item ->
                                    promptText = item.prompt
                                    selectedVariant = item.variant
                                    errorMessage = null
                                    openDrawing(item.prompt, item.variant, saveToHistory = false)
                                },
                                onDeleteHistory = { id ->
                                    historyItems = HistoryStore.deleteEntry(this@MainActivity, id)
                                },
                                onClearHistory = {
                                    historyItems = HistoryStore.clearAll(this@MainActivity)
                                },
                                errorMessage = errorMessage
                            )
                        }
                    }
                }

                if (showAboutDialog) {
                    AboutAndUpdatesDialog(
                        installedVersion = installedVersion,
                        isChecking = isCheckingUpdates,
                        statusMessage = aboutStatusMessage,
                        onCheckForUpdates = {
                            isCheckingUpdates = true
                            aboutStatusMessage = null
                            lifecycleScope.launch {
                                when (val res = GitHubUpdater.checkForUpdate(this@MainActivity, isAutoCheck = false)) {
                                    is UpdateCheckResult.UpdateAvailable -> {
                                        isCheckingUpdates = false
                                        showAboutDialog = false
                                        updateErrorMessage = null
                                        availableRelease = res.release
                                    }
                                    is UpdateCheckResult.UpToDate -> {
                                        isCheckingUpdates = false
                                        aboutStatusMessage = "You're up to date (v${res.installedVersion})."
                                    }
                                    is UpdateCheckResult.Error -> {
                                        isCheckingUpdates = false
                                        aboutStatusMessage = res.message
                                    }
                                }
                            }
                        },
                        onDismiss = {
                            if (!isCheckingUpdates) showAboutDialog = false
                        }
                    )
                }

                availableRelease?.let { release ->
                    UpdateAvailableDialog(
                        release = release,
                        installedVersion = installedVersion,
                        isDownloading = isDownloadingUpdate,
                        downloadProgress = downloadProgress,
                        downloadStatus = downloadStatus,
                        errorMessage = updateErrorMessage,
                        onUpdateNow = {
                            val targetUrl = release.apkUrl.trim()
                            if (targetUrl.startsWith("https://")) {
                                try {
                                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(targetUrl)))
                                    availableRelease = null
                                } catch (err: Exception) {
                                    updateErrorMessage = err.localizedMessage ?: "Could not open download link."
                                }
                            } else {
                                updateErrorMessage = "Invalid update URL."
                            }
                        },
                        onLater = {
                            if (!isDownloadingUpdate) {
                                availableRelease = null
                                updateErrorMessage = null
                            }
                        }
                    )
                }
            }
        }
    }

    private fun generateFromPrompt(
        text: String,
        variant: DrawingVariant,
        onSuccess: (SignallingDrawing, Bitmap) -> Unit,
        onError: (String) -> Unit
    ) {
        lifecycleScope.launch(Dispatchers.Default) {
            try {
                when (val result = parser.parse(text)) {
                    is ParseResult.Success -> {
                        val drawingWithVariant = result.drawing.copy(variant = variant)
                        val bitmap = renderer.renderToBitmap(drawingWithVariant)
                        withContext(Dispatchers.Main) {
                            onSuccess(drawingWithVariant, bitmap)
                        }
                    }
                    is ParseResult.Error -> {
                        withContext(Dispatchers.Main) {
                            onError(result.message)
                        }
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    onError("Error generating drawing: ${e.localizedMessage ?: "Unknown error"}")
                }
            }
        }
    }

    private fun checkAndStartMic(onGranted: () -> Unit) {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED -> {
                onGranted()
                startVoiceRecognition()
            }
            else -> {
                requestRecordAudioPermission.launch(Manifest.permission.RECORD_AUDIO)
            }
        }
    }

    private fun startVoiceRecognition() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak your signalling route...")
            putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES", arrayOf("hi-IN", "en-IN"))
        }

        try {
            speechRecognitionLauncher.launch(intent)
        } catch (e: Exception) {
            Toast.makeText(
                this,
                "Voice input is not supported on this device.",
                Toast.LENGTH_LONG
            ).show()
            onSpeechEndCallback?.invoke()
        }
    }
}
