package `in`.gov.railnet.raildraw.updater

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedInputStream
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.SocketTimeoutException
import java.net.URL
import java.net.UnknownHostException

data class ReleaseInfo(
    val versionName: String,
    val tagName: String,
    val releaseNotes: String,
    val apkUrl: String
)

sealed class UpdateCheckResult {
    data class UpdateAvailable(val release: ReleaseInfo, val installedVersion: String) : UpdateCheckResult()
    data class UpToDate(val installedVersion: String) : UpdateCheckResult()
    data class Error(val message: String) : UpdateCheckResult()
}

sealed class InstallLaunchResult {
    data object Launched : InstallLaunchResult()
    data class NeedsPermission(val settingsIntent: Intent) : InstallLaunchResult()
    data class Error(val message: String) : InstallLaunchResult()
}

object GitHubUpdater {
    private const val REPO_OWNER = "codeYashh"
    private const val REPO_NAME = "RailDraw-Signalling"
    private const val RAW_VERSION_JSON_URL =
        "https://raw.githubusercontent.com/$REPO_OWNER/$REPO_NAME/main/version.json"
    private const val GITHUB_RAW_VERSION_JSON_URL =
        "https://github.com/$REPO_OWNER/$REPO_NAME/raw/main/version.json"
    private const val WEB_LATEST_RELEASE_URL =
        "https://github.com/$REPO_OWNER/$REPO_NAME/releases/latest"
    private const val LATEST_RELEASE_URL =
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/latest"
    private const val FALLBACK_APK_URL =
        "https://github.com/$REPO_OWNER/$REPO_NAME/raw/main/RailDraw.apk"

    private const val PREFS_NAME = "raildraw_github_updater"
    private const val KEY_LAST_AUTO_CHECK_MS = "last_auto_check_ms"
    private const val AUTO_CHECK_INTERVAL_MS = 4L * 60L * 60L * 1000L // 4 hours

    fun shouldAutoCheck(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val lastCheck = prefs.getLong(KEY_LAST_AUTO_CHECK_MS, 0L)
        return (System.currentTimeMillis() - lastCheck) >= AUTO_CHECK_INTERVAL_MS
    }

    private fun markAutoChecked(context: Context) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putLong(KEY_LAST_AUTO_CHECK_MS, System.currentTimeMillis())
            .apply()
    }

    fun getInstalledVersionName(context: Context): String {
        return try {
            val info = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.packageManager.getPackageInfo(
                    context.packageName,
                    PackageManager.PackageInfoFlags.of(0)
                )
            } else {
                @Suppress("DEPRECATION")
                context.packageManager.getPackageInfo(context.packageName, 0)
            }
            info.versionName?.trim().takeIf { !it.isNullOrEmpty() } ?: "1.0.0"
        } catch (_: Exception) {
            "1.0.0"
        }
    }

    /**
     * Semantic version comparison: returns > 0 if v1 > v2, < 0 if v1 < v2, 0 if equal.
     */
    fun compareSemver(v1: String, v2: String): Int {
        val clean1 = v1.trim().removePrefix("v").removePrefix("V").substringBefore("-")
        val clean2 = v2.trim().removePrefix("v").removePrefix("V").substringBefore("-")
        val parts1 = clean1.split(".").map { it.toIntOrNull() ?: 0 }
        val parts2 = clean2.split(".").map { it.toIntOrNull() ?: 0 }
        val maxLen = maxOf(parts1.size, parts2.size)
        for (i in 0 until maxLen) {
            val a = parts1.getOrElse(i) { 0 }
            val b = parts2.getOrElse(i) { 0 }
            if (a != b) return a.compareTo(b)
        }
        return 0
    }

    private fun fetchVersionJson(urlStr: String, installedVersion: String): UpdateCheckResult? {
        var conn: HttpURLConnection? = null
        return try {
            val sep = if (urlStr.contains("?")) "&" else "?"
            val url = URL("$urlStr${sep}_cb=${System.currentTimeMillis()}")
            conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 8_000
                readTimeout = 10_000
                useCaches = false
                setRequestProperty("Cache-Control", "no-cache, no-store, must-revalidate")
                setRequestProperty("User-Agent", "RailDraw-Android/$installedVersion")
            }
            if (conn.responseCode !in 200..299) return null
            val body = conn.inputStream.bufferedReader().use { it.readText() }
            val json = JSONObject(body)
            val remoteVersion = json.optString("version", "").trim().removePrefix("v").removePrefix("V")
            if (remoteVersion.isEmpty()) return null
            if (compareSemver(remoteVersion, installedVersion) <= 0) {
                return UpdateCheckResult.UpToDate(installedVersion)
            }
            val notes = json.optString("releaseNotes", "").trim().ifEmpty {
                "Bug fixes and performance improvements."
            }
            val apkUrl = json.optString("apkUrl", "").trim().ifEmpty { FALLBACK_APK_URL }
            UpdateCheckResult.UpdateAvailable(
                release = ReleaseInfo(
                    versionName = remoteVersion,
                    tagName = "v$remoteVersion",
                    releaseNotes = notes,
                    apkUrl = apkUrl
                ),
                installedVersion = installedVersion
            )
        } catch (_: Exception) {
            null
        } finally {
            conn?.disconnect()
        }
    }

    private fun checkWebLatestReleaseRedirect(installedVersion: String): UpdateCheckResult? {
        var conn: HttpURLConnection? = null
        return try {
            conn = (URL(WEB_LATEST_RELEASE_URL).openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                instanceFollowRedirects = false
                connectTimeout = 8_000
                readTimeout = 10_000
                setRequestProperty("User-Agent", "RailDraw-Android/$installedVersion")
            }
            val code = conn.responseCode
            if (code !in listOf(301, 302, 303, 307, 308)) return null
            val location = conn.getHeaderField("Location")?.trim() ?: return null
            val tagSegment = location.substringAfterLast("/tag/", "").substringBefore("?").trim()
            if (tagSegment.isEmpty()) return null
            val remoteVersion = tagSegment.removePrefix("v").removePrefix("V").trim()
            if (remoteVersion.isEmpty()) return null
            if (compareSemver(remoteVersion, installedVersion) <= 0) {
                return UpdateCheckResult.UpToDate(installedVersion)
            }
            val releaseApkUrl =
                "https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/$tagSegment/app-release.apk"
            UpdateCheckResult.UpdateAvailable(
                release = ReleaseInfo(
                    versionName = remoteVersion,
                    tagName = tagSegment,
                    releaseNotes = "Latest RailDraw Signalling release ($tagSegment).",
                    apkUrl = releaseApkUrl
                ),
                installedVersion = installedVersion
            )
        } catch (_: Exception) {
            null
        } finally {
            conn?.disconnect()
        }
    }

    suspend fun checkForUpdate(context: Context, isAutoCheck: Boolean): UpdateCheckResult =
        withContext(Dispatchers.IO) {
            val installedVersion = getInstalledVersionName(context)
            var conn: HttpURLConnection? = null
            try {
                if (isAutoCheck) {
                    markAutoChecked(context)
                }

                // 1. Primary (Zero API rate limit): GitHub web releases/latest redirect -> tag & release APK
                checkWebLatestReleaseRedirect(installedVersion)?.let { return@withContext it }

                // 2. Secondary (Zero API rate limit): Direct version.json from raw.githubusercontent.com
                fetchVersionJson(RAW_VERSION_JSON_URL, installedVersion)?.let { return@withContext it }

                // 3. Tertiary (Zero API rate limit): Direct github.com raw version.json mirror
                fetchVersionJson(GITHUB_RAW_VERSION_JSON_URL, installedVersion)?.let { return@withContext it }

                // 4. Last-resort fallback: GitHub REST API
                val url = URL(LATEST_RELEASE_URL)
                conn = (url.openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    connectTimeout = 10_000
                    readTimeout = 12_000
                    setRequestProperty("Accept", "application/vnd.github+json")
                    setRequestProperty("User-Agent", "RailDraw-Android/$installedVersion")
                }

                val code = conn.responseCode
                if (code == 403 || code == 429) {
                    val remaining = conn.getHeaderField("X-RateLimit-Remaining")
                    if (remaining == "0" || code == 429) {
                        return@withContext UpdateCheckResult.Error(
                            "GitHub API rate limit reached. Please try again later."
                        )
                    }
                    return@withContext UpdateCheckResult.Error(
                        "Update server temporarily unavailable (HTTP $code)."
                    )
                }
                if (code == 404) {
                    return@withContext UpdateCheckResult.UpToDate(installedVersion)
                }
                if (code !in 200..299) {
                    return@withContext UpdateCheckResult.Error(
                        "Unable to check for updates (HTTP $code)."
                    )
                }

                val body = conn.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(body)
                val tagName = json.optString("tag_name", "").trim()
                val remoteVersion = tagName.removePrefix("v").removePrefix("V").trim()
                if (remoteVersion.isEmpty()) {
                    return@withContext UpdateCheckResult.Error("Invalid release metadata from GitHub.")
                }

                if (compareSemver(remoteVersion, installedVersion) <= 0) {
                    return@withContext UpdateCheckResult.UpToDate(installedVersion)
                }

                val releaseNotes = json.optString("body", "")
                    .trim()
                    .ifEmpty { "Bug fixes and performance improvements." }

                val assets = json.optJSONArray("assets")
                var apkUrl = ""
                if (assets != null) {
                    for (i in 0 until assets.length()) {
                        val asset = assets.optJSONObject(i) ?: continue
                        val name = asset.optString("name", "")
                        val downloadUrl = asset.optString("browser_download_url", "")
                        if (name.equals("app-release.apk", ignoreCase = true) && downloadUrl.isNotEmpty()) {
                            apkUrl = downloadUrl
                            break
                        }
                        if (name.endsWith(".apk", ignoreCase = true) && downloadUrl.isNotEmpty() && apkUrl.isEmpty()) {
                            apkUrl = downloadUrl
                        }
                    }
                }

                if (apkUrl.isEmpty()) {
                    return@withContext UpdateCheckResult.Error(
                        "Release $tagName was found, but no APK asset is attached yet."
                    )
                }

                UpdateCheckResult.UpdateAvailable(
                    release = ReleaseInfo(
                        versionName = remoteVersion,
                        tagName = tagName,
                        releaseNotes = releaseNotes,
                        apkUrl = apkUrl
                    ),
                    installedVersion = installedVersion
                )
            } catch (_: UnknownHostException) {
                UpdateCheckResult.Error("No internet connection. Please check your network and try again.")
            } catch (_: SocketTimeoutException) {
                UpdateCheckResult.Error("Connection timed out while checking for updates.")
            } catch (e: Exception) {
                UpdateCheckResult.Error(
                    "Could not check for updates: ${e.localizedMessage ?: "Network error"}"
                )
            } finally {
                conn?.disconnect()
            }
        }

    suspend fun downloadApk(
        context: Context,
        apkUrl: String,
        onProgress: (progress: Float, statusText: String) -> Unit
    ): Result<File> = withContext(Dispatchers.IO) {
        var conn: HttpURLConnection? = null
        try {
            var currentUrl = apkUrl.trim()
            var redirects = 0
            while (redirects < 6) {
                if (!currentUrl.startsWith("https://")) {
                    return@withContext Result.failure(Exception("Only HTTPS update downloads are allowed."))
                }
                conn = (URL(currentUrl).openConnection() as HttpURLConnection).apply {
                    instanceFollowRedirects = false
                    connectTimeout = 15_000
                    readTimeout = 30_000
                    setRequestProperty("User-Agent", "RailDraw-Android-Updater")
                }
                val code = conn.responseCode
                if (code == 301 || code == 302 || code == 303 || code == 307 || code == 308) {
                    val next = conn.getHeaderField("Location")
                    conn.disconnect()
                    if (next.isNullOrBlank()) {
                        return@withContext Result.failure(Exception("Invalid redirect from server."))
                    }
                    currentUrl = next
                    redirects++
                    continue
                }
                if (code !in 200..299) {
                    return@withContext Result.failure(Exception("Download failed (HTTP $code)."))
                }
                break
            }

            val activeConn = conn ?: return@withContext Result.failure(Exception("Connection failed."))
            val totalBytes = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                activeConn.contentLengthLong
            } else {
                activeConn.contentLength.toLong()
            }

            val updatesDir = File(context.cacheDir, "updates").apply { mkdirs() }
            val partFile = File(updatesDir, "app-release.apk.part")
            val finalFile = File(updatesDir, "app-release.apk")
            if (partFile.exists()) partFile.delete()

            BufferedInputStream(activeConn.inputStream).use { input ->
                FileOutputStream(partFile).use { output ->
                    val buffer = ByteArray(16 * 1024)
                    var downloaded = 0L
                    var lastEmit = 0L
                    while (true) {
                        val read = input.read(buffer)
                        if (read == -1) break
                        output.write(buffer, 0, read)
                        downloaded += read
                        val now = System.currentTimeMillis()
                        if (now - lastEmit >= 120L) {
                            lastEmit = now
                            val progress = if (totalBytes > 0L) {
                                (downloaded.toFloat() / totalBytes.toFloat()).coerceIn(0f, 0.99f)
                            } else {
                                0.5f
                            }
                            val mbDone = String.format("%.1f", downloaded / (1024.0 * 1024.0))
                            val status = if (totalBytes > 0L) {
                                val pct = (progress * 100).toInt()
                                val mbTotal = String.format("%.1f", totalBytes / (1024.0 * 1024.0))
                                "Downloading... $pct% ($mbDone / $mbTotal MB)"
                            } else {
                                "Downloading... $mbDone MB"
                            }
                            onProgress(progress, status)
                        }
                    }
                    output.flush()
                }
            }

            if (partFile.length() < 64 * 1024) {
                partFile.delete()
                return@withContext Result.failure(Exception("Downloaded APK is invalid or incomplete."))
            }

            // Verify ZIP structure and matching publisher signature before launching installer
            val sigMatches = runCatching {
                java.util.zip.ZipFile(partFile).use { zf ->
                    if (zf.getEntry("AndroidManifest.xml") == null || zf.getEntry("classes.dex") == null) {
                        return@runCatching false
                    }
                }
                @Suppress("DEPRECATION")
                val installed = context.packageManager.getPackageInfo(context.packageName, PackageManager.GET_SIGNATURES)
                @Suppress("DEPRECATION")
                val archive = context.packageManager.getPackageArchiveInfo(partFile.absolutePath, PackageManager.GET_SIGNATURES)
                val instSig = installed.signatures?.firstOrNull()?.toByteArray()
                val archSig = archive?.signatures?.firstOrNull()?.toByteArray()
                if (instSig != null && archSig != null) {
                    val md = java.security.MessageDigest.getInstance("SHA-256")
                    md.digest(instSig).contentEquals(md.digest(archSig))
                } else {
                    true
                }
            }.getOrDefault(false)

            if (!sigMatches) {
                partFile.delete()
                return@withContext Result.failure(Exception("Update APK failed integrity or signature verification."))
            }

            if (finalFile.exists()) finalFile.delete()
            if (!partFile.renameTo(finalFile)) {
                return@withContext Result.failure(Exception("Failed to prepare update package."))
            }

            onProgress(1f, "Download complete")
            Result.success(finalFile)
        } catch (_: UnknownHostException) {
            Result.failure(Exception("No internet connection during download."))
        } catch (_: SocketTimeoutException) {
            Result.failure(Exception("Download timed out. Please try again."))
        } catch (e: Exception) {
            Result.failure(Exception(e.localizedMessage ?: "Download failed."))
        } finally {
            conn?.disconnect()
        }
    }

    fun launchApkInstaller(context: Context, apkFile: File): InstallLaunchResult {
        if (!apkFile.exists()) {
            return InstallLaunchResult.Error("Update APK file not found.")
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !context.packageManager.canRequestPackageInstalls()
        ) {
            val permIntent = Intent(
                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:${context.packageName}")
            ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            return InstallLaunchResult.NeedsPermission(permIntent)
        }

        return try {
            val contentUri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                apkFile
            )
            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(contentUri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(installIntent)
            InstallLaunchResult.Launched
        } catch (e: Exception) {
            InstallLaunchResult.Error(
                "Could not open system installer: ${e.localizedMessage ?: "Unknown error"}"
            )
        }
    }
}
