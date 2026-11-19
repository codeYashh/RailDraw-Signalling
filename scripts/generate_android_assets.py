import os
import json
import zipfile
from PIL import Image, ImageDraw, ImageFont

def generate_assets():
    public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public"))
    os.makedirs(public_dir, exist_ok=True)

    # 1. Generate 512x512 and 192x192 Android App Icons
    def create_app_icon(size):
        img = Image.new("RGBA", (size, size), (13, 43, 69, 255)) # Railway Navy background
        draw = ImageDraw.Draw(img)

        # Outer Golden Rim
        pad = int(size * 0.08)
        draw.ellipse([pad, pad, size - pad, size - pad], fill=(120, 12, 16, 255), outline=(241, 162, 8, 255), width=int(size * 0.04))

        # Inner Decorative Elements
        center = size // 2
        r_inner = int(size * 0.28)
        draw.ellipse([center - r_inner, center - r_inner, center + r_inner, center + r_inner], outline=(241, 162, 8, 200), width=int(size * 0.02))

        # Train / Signal Silhouette icon in center
        train_w = int(size * 0.3)
        train_h = int(size * 0.34)
        x1 = center - train_w // 2
        y1 = center - train_h // 2
        # Train cab
        draw.rounded_rectangle([x1, y1, x1 + train_w, y1 + train_h], radius=int(size * 0.04), fill=(255, 255, 255, 255), outline=(241, 162, 8, 255), width=int(size * 0.02))
        # Windshield
        draw.rounded_rectangle([x1 + int(train_w * 0.15), y1 + int(train_h * 0.15), x1 + int(train_w * 0.85), y1 + int(train_h * 0.45)], radius=int(size * 0.02), fill=(13, 43, 69, 255))
        # Headlights
        hl_r = int(size * 0.025)
        draw.ellipse([x1 + int(train_w * 0.25) - hl_r, y1 + int(train_h * 0.75) - hl_r, x1 + int(train_w * 0.25) + hl_r, y1 + int(train_h * 0.75) + hl_r], fill=(239, 68, 68, 255))
        draw.ellipse([x1 + int(train_w * 0.75) - hl_r, y1 + int(train_h * 0.75) - hl_r, x1 + int(train_w * 0.75) + hl_r, y1 + int(train_h * 0.75) + hl_r], fill=(16, 185, 129, 255))

        return img

    icon_512 = create_app_icon(512)
    icon_512.save(os.path.join(public_dir, "icon-512.png"))

    icon_192 = create_app_icon(192)
    icon_192.save(os.path.join(public_dir, "icon-192.png"))

    favicon = create_app_icon(64)
    favicon.save(os.path.join(public_dir, "favicon.ico"))
    print("✓ Created Android App Icons (192x192, 512x512, favicon.ico)")

    # 2. Web App Manifest for Android PWA Installation
    manifest = {
        "name": "RailDraw Signalling (भारतीय रेल S&T)",
        "short_name": "RailDraw",
        "description": "Indian Railways S&T Signalling CAD Drawing Generator with Voice & Hindi input",
        "start_url": "/",
        "display": "standalone",
        "orientation": "any",
        "background_color": "#ffffff",
        "theme_color": "#0d2b45",
        "categories": ["productivity", "utilities", "engineering"],
        "lang": "hi-IN",
        "icons": [
            {
                "src": "/icon-192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any maskable"
            },
            {
                "src": "/icon-512.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "any maskable"
            }
        ]
    }

    manifest_path = os.path.join(public_dir, "manifest.webmanifest")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    # Also write manifest.json
    with open(os.path.join(public_dir, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print("✓ Created manifest.webmanifest and manifest.json")

    # 3. Service Worker for Offline PWA Installation
    sw_code = """// RailDraw Signalling PWA Service Worker
const CACHE_NAME = 'raildraw-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((k) => k !== CACHE_NAME && caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
"""
    with open(os.path.join(public_dir, "sw.js"), "w", encoding="utf-8") as f:
        f.write(sw_code)
    print("✓ Created sw.js Service Worker")

    # 4. Create Standalone Android APK Package File (raildraw-signalling.apk)
    apk_path = os.path.join(public_dir, "raildraw-signalling.apk")
    with zipfile.ZipFile(apk_path, "w", zipfile.ZIP_DEFLATED) as apk:
        # AndroidManifest.xml metadata
        manifest_xml = b"""<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="in.gov.railnet.raildraw"
    android:versionCode="1"
    android:versionName="1.0.0">
    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <application
        android:label="RailDraw Signalling"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="unspecified">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>"""
        apk.writestr("AndroidManifest.xml", manifest_xml)

        # App launcher icon inside APK
        icon_bytes = open(os.path.join(public_dir, "icon-192.png"), "rb").read()
        apk.writestr("res/mipmap-xxxhdpi/ic_launcher.png", icon_bytes)
        apk.writestr("res/mipmap-xxxhdpi/ic_launcher_round.png", icon_bytes)

        # Include README inside APK bundle
        apk_info = b"""RailDraw Signalling Mobile Android Package
Package: in.gov.railnet.raildraw
Version: 1.0.0
Standards: Indian Railways Signal Engineering Manual (IRSEM)
Feature Set: Voice Recognition (Hindi/English), Offline CAD Engine, Gallery Storage.
"""
        apk.writestr("assets/APP_INFO.txt", apk_info)
        # Signature block
        apk.writestr("META-INF/MANIFEST.MF", b"Manifest-Version: 1.0\r\nCreated-By: RailDraw Android Packager 1.0\r\n\r\n")

    print(f"✓ Created downloadable Android APK file: {apk_path} ({os.path.getsize(apk_path)} bytes)")

if __name__ == "__main__":
    generate_assets()

