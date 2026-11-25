package `in`.gov.railnet.raildraw.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import `in`.gov.railnet.raildraw.ui.theme.RailwayNavy
import `in`.gov.railnet.raildraw.ui.theme.TextMuted
import `in`.gov.railnet.raildraw.ui.theme.TextSecondary
import `in`.gov.railnet.raildraw.updater.ReleaseInfo

@Composable
fun UpdateAvailableDialog(
    release: ReleaseInfo,
    installedVersion: String,
    isDownloading: Boolean,
    downloadProgress: Float,
    downloadStatus: String,
    errorMessage: String?,
    onUpdateNow: () -> Unit,
    onLater: () -> Unit
) {
    AlertDialog(
        onDismissRequest = { if (!isDownloading) onLater() },
        shape = RoundedCornerShape(12.dp),
        title = {
            Column {
                Text(
                    text = "Update Available (${release.tagName})",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 18.sp
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Installed: v$installedVersion  ->  New: v${release.versionName}",
                    fontSize = 12.sp,
                    color = TextMuted
                )
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = release.releaseNotes,
                    fontSize = 13.sp,
                    color = TextSecondary,
                    lineHeight = 19.sp
                )

                if (isDownloading) {
                    Spacer(modifier = Modifier.height(4.dp))
                    LinearProgressIndicator(
                        progress = { downloadProgress.coerceIn(0f, 1f) },
                        modifier = Modifier.fillMaxWidth(),
                        color = RailwayNavy
                    )
                    Text(
                        text = downloadStatus,
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                }

                if (!errorMessage.isNullOrBlank()) {
                    Text(
                        text = errorMessage,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.error,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onUpdateNow,
                enabled = !isDownloading,
                colors = ButtonDefaults.buttonColors(containerColor = RailwayNavy)
            ) {
                Text(if (isDownloading) "Downloading..." else "Update now")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onLater,
                enabled = !isDownloading
            ) {
                Text("Later")
            }
        }
    )
}

@Composable
fun AboutAndUpdatesDialog(
    installedVersion: String,
    isChecking: Boolean,
    statusMessage: String?,
    onCheckForUpdates: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(12.dp),
        title = {
            Text(
                text = "About RailDraw",
                fontWeight = FontWeight.SemiBold,
                fontSize = 18.sp
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "Indian Railways S&T Cable Route CAD",
                    fontSize = 14.sp,
                    color = TextSecondary
                )
                Text(
                    text = "Version: v$installedVersion",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )

                if (isChecking) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            strokeWidth = 2.dp,
                            color = RailwayNavy
                        )
                        Text(
                            text = "Checking GitHub Releases...",
                            fontSize = 13.sp,
                            color = TextMuted
                        )
                    }
                } else if (!statusMessage.isNullOrBlank()) {
                    Text(
                        text = statusMessage,
                        fontSize = 13.sp,
                        color = TextSecondary
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onCheckForUpdates,
                enabled = !isChecking,
                colors = ButtonDefaults.buttonColors(containerColor = RailwayNavy)
            ) {
                Text("Check for updates")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}
