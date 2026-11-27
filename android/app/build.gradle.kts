


plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "in.gov.railnet.raildraw"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.raildraw.app"
        minSdk = 24
        targetSdk = 34
        val tagVersionName = (System.getenv("VERSION_NAME") ?: project.findProperty("VERSION_NAME") as String?)
            ?.removePrefix("v")
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: "1.0.0"
        val tagVersionCode = (System.getenv("VERSION_CODE") ?: project.findProperty("VERSION_CODE") as String?)
            ?.toIntOrNull()
            ?: run {
                val parts = tagVersionName.substringBefore("-").split(".").map { it.toIntOrNull() ?: 0 }
                val major = parts.getOrElse(0) { 1 }
                val minor = parts.getOrElse(1) { 0 }
                val patch = parts.getOrElse(2) { 0 }
                (major * 10000 + minor * 100 + patch).coerceAtLeast(1)
            }
        versionCode = tagVersionCode
        versionName = tagVersionName

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    signingConfigs {
        create("release") {
            val keystorePath = System.getenv("KEYSTORE_PATH")
                ?: (project.findProperty("KEYSTORE_PATH") as String?)
                ?: file("raildraw.keystore").takeIf { it.exists() }?.absolutePath
            if (!keystorePath.isNullOrBlank()) {
                storeFile = file(keystorePath)
            }
            storePassword = System.getenv("KEYSTORE_PASSWORD")
                ?: (project.findProperty("KEYSTORE_PASSWORD") as String?)
                ?: "raildraw123"
            keyAlias = System.getenv("KEY_ALIAS")
                ?: (project.findProperty("KEY_ALIAS") as String?)
                ?: "raildrawkey"
            keyPassword = System.getenv("KEY_PASSWORD")
                ?: (project.findProperty("KEY_PASSWORD") as String?)
                ?: "raildraw123"
            enableV1Signing = true
            enableV2Signing = true
            enableV3Signing = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            val hasReleaseKeystore = signingConfigs.getByName("release").storeFile?.exists() == true
            if (hasReleaseKeystore) {
                signingConfig = signingConfigs.getByName("release")
            }
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.11"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.02.02"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.02.02"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
