package in.gov.railnet.raildraw.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import in.gov.railnet.raildraw.R
import in.gov.railnet.raildraw.ui.theme.*

@Composable
fun HomeScreen(
    promptText: String,
    onPromptChange: (String) -> Unit,
    isListening: Boolean,
    onMicClick: () -> Unit,
    onGenerateClick: () -> Unit,
    errorMessage: String? = null
) {
    Scaffold(
        containerColor = BackgroundLight
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 20.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                horizontalAlignment = Alignment.Start,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(RailwayNavy),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_raildraw_logo),
                            contentDescription = "RailDraw insignia",
                            modifier = Modifier.size(36.dp)
                        )
                    }

                    Column {
                        Text(
                            text = "RailDraw",
                            style = MaterialTheme.typography.titleLarge,
                            color = TextDark,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 20.sp
                        )
                        Text(
                            text = "Indian Railways S&T Cable Route CAD",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextMuted,
                            fontSize = 12.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Draft a Signalling Cable Route",
                    style = MaterialTheme.typography.headlineLarge,
                    color = TextDark,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 24.sp
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Specify endpoints, segment lengths, laying methods, and cable cores in English or Hindi.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary,
                    fontSize = 14.sp
                )
            }

            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, BorderLight),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCard)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        OutlinedTextField(
                            value = promptText,
                            onValueChange = onPromptChange,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(156.dp),
                            placeholder = {
                                Text(
                                    text = "Example: L1 to L12, 500 m: 20 m HDD, 50 m GI pipe, 430 m normal trenching, 7x12 core signalling cables",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = TextMuted,
                                    fontSize = 14.sp,
                                    lineHeight = 20.sp
                                )
                            },
                            shape = RoundedCornerShape(6.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = RailwayNavy,
                                unfocusedBorderColor = BorderLight,
                                focusedContainerColor = SurfaceCard,
                                unfocusedContainerColor = BackgroundLight
                            ),
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                            keyboardActions = KeyboardActions(onDone = { onGenerateClick() })
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = if (isListening) "Listening — speak route details" else "Voice input (Hindi / English)",
                                style = MaterialTheme.typography.bodySmall,
                                color = if (isListening) ErrorRed else TextMuted,
                                fontWeight = if (isListening) FontWeight.SemiBold else FontWeight.Normal
                            )

                            OutlinedButton(
                                onClick = onMicClick,
                                modifier = Modifier.height(44.dp),
                                shape = RoundedCornerShape(6.dp),
                                border = BorderStroke(1.dp, if (isListening) ErrorRed else BorderLight),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    containerColor = if (isListening) ErrorBackground else SurfaceSubtle,
                                    contentColor = if (isListening) ErrorRed else TextDark
                                )
                            ) {
                                Icon(
                                    imageVector = if (isListening) Icons.Filled.MicOff else Icons.Filled.Mic,
                                    contentDescription = "Voice Input",
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (isListening) "Stop" else "Speak",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }

                if (!errorMessage.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = ErrorBackground),
                        shape = RoundedCornerShape(6.dp),
                        border = BorderStroke(1.dp, ErrorBorder)
                    ) {
                        Text(
                            text = errorMessage,
                            color = ErrorRed,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(12.dp),
                            textAlign = TextAlign.Start
                        )
                    }
                }
            }

            Button(
                onClick = onGenerateClick,
                enabled = promptText.isNotBlank(),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(6.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = RailwayNavy,
                    contentColor = Color.White
                )
            ) {
                Text(
                    text = "Generate Drawing",
                    style = MaterialTheme.typography.labelLarge,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.width(8.dp))
                Icon(
                    imageVector = Icons.Filled.ArrowForward,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}
