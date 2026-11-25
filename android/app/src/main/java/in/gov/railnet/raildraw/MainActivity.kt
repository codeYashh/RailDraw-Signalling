package in.gov.railnet.raildraw

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Bundle
import android.speech.RecognizerIntent
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import in.gov.railnet.raildraw.drawing.DrawingRenderer
import in.gov.railnet.raildraw.model.ParseResult
import in.gov.railnet.raildraw.model.SignallingDrawing
import in.gov.railnet.raildraw.parser.DrawingParser
import in.gov.railnet.raildraw.ui.AboutAndUpdatesDialog
import in.gov.railnet.raildraw.ui.HomeScreen
import in.gov.railnet.raildraw.ui.ResultScreen
import in.gov.railnet.raildraw.ui.UpdateAvailableDialog
import in.gov.railnet.raildraw.ui.theme.RailDrawTheme
import in.gov.railnet.raildraw.updater.GitHubUpdater
import in.gov.railnet.raildraw.updater.InstallLaunchResult
import in.gov.railnet.raildraw.updater.ReleaseInfo
import in.gov.railnet.raildraw.updater.UpdateCheckResult
import in.gov.railnet.raildraw.util.StorageUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.*

class MainActivity : ComponentActivity() {

    private val parser = DrawingParser()
    private val renderer = DrawingRenderer()
    private var pendingInstallApk: File? = null
    private var onInstallErrorCallback: ((String) -> Unit)? = null
    private var onInstallLaunchedCallback: (() -> Unit)? = null

    // Activity Result Launcher for Voice Input (System Speech Dialog)
    private val speechRecognitionLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == Activity.RESULT_OK) {
                val matches = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                if (!matches.isNullOrEmpty()) {
                    val spokenText = matches[0]
                    onSpeechResultCallback?.invoke(spokenText)
                }
            }
            onSpeechEndCallback?.invoke()
        }

    // Permission launcher for microphone
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

    // Callbacks for UI updates
    private var onSpeechResultCallback: ((String) -> Unit)? = null
    private var onSpeechEndCallback: (() -> Unit)? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            RailDrawTheme {
                var promptText by remember {
                    mutableStateOf(
                        "Cable route from L1 to L12, 500 m: 20 m trenchless, 50 m GI pipe, 430 m normal trenching, 7 cables of 12 core"
                    )
                }
                var currentDrawing by remember { mutableStateOf<SignallingDrawing?>(null) }
                var currentBitmap by remember { mutableStateOf<Bitmap?>(null) }
                var isListening by remember { mutableStateOf(false) }
                var errorMessage by remember { mutableStateOf<String?>(null) }
                var noticeMessage by remember { mutableStateOf<String?>(null) }

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

                DisposableEffect(Unit) {
                    onInstallErrorCallback = { msg ->
                        isDownloadingUpdate = false
                        updateErrorMessage = msg
                    }
                    onInstallLaunchedCallback = {
                        isDownloadingUpdate = false
                        availableRelease = null
                    }
                    onDispose {
                        onInstallErrorCallback = null
                        onInstallLaunchedCallback = null
                    }
                }

                // Background throttled update check on launch (at most once every 4 hours)
                LaunchedEffect(Unit) {
                    if (GitHubUpdater.shouldAutoCheck(this@MainActivity)) {
                        when (val res = GitHubUpdater.checkForUpdate(this@MainActivity, isAutoCheck = true)) {
                            is UpdateCheckResult.UpdateAvailable -> {
                                availableRelease = res.release
                            }
                            else -> Unit
                        }
                    }
                }

                // Connect speech recognizer callbacks
                DisposableEffect(Unit) {
                    onSpeechResultCallback = { resultText ->
                        promptText = resultText
                        isListening = false
                        errorMessage = null
                        noticeMessage = null

                        // Auto-generate drawing from voice
                        generateFromPrompt(
                            text = resultText,
                            onSuccess = { drawing, bmp, notice ->
                                currentDrawing = drawing
                                currentBitmap = bmp
                                noticeMessage = notice
                            },
                            onError = { err ->
                                errorMessage = err
                            }
                        )
                    }
                    onSpeechEndCallback = {
                        isListening = false
                    }
                    onDispose {
                        onSpeechResultCallback = null
                        onSpeechEndCallback = null
                    }
                }

                // If on Result screen, Back button returns to Home with text preserved
                if (currentDrawing != null && currentBitmap != null) {
                    BackHandler {
                        currentDrawing = null
                        currentBitmap = null
                    }

                    ResultScreen(
                        drawing = currentDrawing!!,
                        drawingBitmap = currentBitmap!!,
                        onSaveToPhone = {
                            val uri = StorageUtils.saveBitmapToGallery(
                                this@MainActivity,
                                currentBitmap!!,
                                "RailDraw_${currentDrawing!!.fromLocation}_to_${currentDrawing!!.toLocation}"
                            )
                            if (uri != null) {
                                Toast.makeText(this@MainActivity, getString(R.string.saved_to_gallery), Toast.LENGTH_SHORT).show()
                            } else {
                                Toast.makeText(this@MainActivity, "Failed to save drawing.", Toast.LENGTH_SHORT).show()
                            }
                        },
                        onSaveAsPdf = {
                            val uri = StorageUtils.saveAsPdf(
                                this@MainActivity,
                                currentBitmap!!,
                                "RailDraw_${currentDrawing!!.fromLocation}_to_${currentDrawing!!.toLocation}"
                            )
                            if (uri != null) {
                                Toast.makeText(this@MainActivity, getString(R.string.saved_pdf), Toast.LENGTH_SHORT).show()
                            } else {
                                Toast.makeText(this@MainActivity, "Failed to save PDF.", Toast.LENGTH_SHORT).show()
                            }
                        },
                        onShare = {
                            StorageUtils.shareDrawing(
                                this@MainActivity,
                                currentBitmap!!,
                                promptText
                            )
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
                            noticeMessage = null
                        },
                        isListening = isListening,
                        onMicClick = {
                            checkAndStartMic { isListening = true }
                        },
                        onGenerateClick = {
                            errorMessage = null
                            noticeMessage = null
                            generateFromPrompt(
                                text = promptText,
                                onSuccess = { drawing, bmp, notice ->
                                    currentDrawing = drawing
                                    currentBitmap = bmp
                                    noticeMessage = notice
                                },
                                onError = { err ->
                                    errorMessage = err
                                }
                            )
                        },
                        onAboutClick = {
                            aboutStatusMessage = null
                            showAboutDialog = true
                        },
                        errorMessage = errorMessage
                    )
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
                            updateErrorMessage = null
                            isDownloadingUpdate = true
                            downloadProgress = 0f
                            downloadStatus = "Connecting..."
                            lifecycleScope.launch {
                                val result = GitHubUpdater.downloadApk(
                                    context = this@MainActivity,
                                    apkUrl = release.apkUrl,
                                    onProgress = { prog, status ->
                                        downloadProgress = prog
                                        downloadStatus = status
                                    }
                                )
                                result.onSuccess { apkFile ->
                                    triggerApkInstall(apkFile)
                                }.onFailure { err ->
                                    isDownloadingUpdate = false
                                    updateErrorMessage = err.localizedMessage ?: "Download failed."
                                }
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

    private fun triggerApkInstall(apkFile: File) {
        when (val launchRes = GitHubUpdater.launchApkInstaller(this, apkFile)) {
            is InstallLaunchResult.Launched -> {
                pendingInstallApk = null
                onInstallLaunchedCallback?.invoke()
            }
            is InstallLaunchResult.NeedsPermission -> {
                pendingInstallApk = apkFile
                Toast.makeText(
                    this,
                    "Allow 'Install unknown apps' for RailDraw, then return to continue.",
                    Toast.LENGTH_LONG
                ).show()
                startActivity(launchRes.settingsIntent)
            }
            is InstallLaunchResult.Error -> {
                pendingInstallApk = null
                onInstallErrorCallback?.invoke(launchRes.message)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        val pending = pendingInstallApk ?: return
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.O ||
            packageManager.canRequestPackageInstalls()
        ) {
            pendingInstallApk = null
            triggerApkInstall(pending)
        }
    }

    private fun generateFromPrompt(
        text: String,
        onSuccess: (SignallingDrawing, Bitmap, String?) -> Unit,
        onError: (String) -> Unit
    ) {
        lifecycleScope.launch(Dispatchers.Default) {
            try {
                when (val result = parser.parse(text)) {
                    is ParseResult.Success -> {
                        val bitmap = renderer.renderToBitmap(result.drawing)
                        withContext(Dispatchers.Main) {
                            onSuccess(result.drawing, bitmap, result.notice)
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
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Describe your signalling route (English or Hindi)...")
            putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES", arrayOf("hi-IN", "en-IN"))
        }

        try {
            speechRecognitionLauncher.launch(intent)
        } catch (e: Exception) {
            Toast.makeText(
                this,
                "Voice input is not supported on this device. You can type your prompt.",
                Toast.LENGTH_LONG
            ).show()
            onSpeechEndCallback?.invoke()
        }
    }
}
