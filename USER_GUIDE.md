# 🚆 RailDraw — One-Page User Guide

**RailDraw** is an offline, voice-enabled Android app for Indian Railways Signal & Telecom (S&T) engineers. It automatically converts plain text or voice descriptions into print-ready, IRSEM-compliant cable route engineering drawings.

---

## 📱 1. How the App Works (2 Minimal Screens)

### Screen 1: Home Screen
- **App Logo & Name:** RailDraw at the top.
- **Large Description Box:** Type or paste your cable route details.
- **🎙️ Big Mic Button:** Tap once to speak in **English or हिन्दी (Hindi)**. Microphone permission is requested only on first tap; typing always keeps working.
- **✨ Generate Drawing Button:** Validates your inputs and instantly renders the engineering drawing. If segment lengths don't match the total, a friendly notice tells you the exact discrepancy.

### Screen 2: Result Screen
- **CAD Canvas:** Displays the Indian Railways standard drawing with **pinch-to-zoom and drag-to-pan**.
- **💾 Save to Phone:** Saves a high-resolution 300-DPI PNG directly to `Pictures/RailDraw` using Android MediaStore and displays a toast *"Saved to Gallery"*.
- **📄 Save as PDF:** Generates a vector-quality A3 landscape printable PDF.
- **📤 Share:** Shares the drawing image and prompt directly via WhatsApp, Telegram, Drive, or Email.
- **✏️ Edit:** Takes you back to the Home Screen keeping all your text intact for quick adjustments.

---

## 💡 2. Three Example Prompts to Try

### Example 1: Standard Indian Railways Route (English)
```text
Cable route from L1 to L12, 500 m: 20 m trenchless, 50 m GI pipe, 430 m normal trenching, 7 cables of 12 core
```
*Output:* Draws 500 m route from Location Box L1 to L12, with hatched block for 20 m trenchless, double-line pipe for 50 m GI pipe, red trench line for 430 m normal trenching, witness dimension lines, overall 500 m dimension line, and Detail 'A' zoom callout showing 7 Nos. x 12 Core Signalling Cables.

### Example 2: Everyday Hindi Voice Prompt (बोलकर बनाएँ)
```text
एल १ से एल १२ तक ५०० मीटर केबल रूट बनाओ, २० मीटर ट्रेंचलेस, ५० मीटर जीआई पाइप और ४३० मीटर नॉर्मल ट्रेंचिंग ७x१२ कोर
```
*Output:* Automatically recognizes Hindi numerals (`०-९`), maps `एल १` to L1 and `एल १२` to L12, identifies laying methods, and renders the drawing with bilingual title block.

### Example 3: Yard & Level Crossing Crossing (Spoken Number Words)
```text
Station Relay Room to LC Gate 45, 800 m: 100 m track crossing, 150 m GI pipe, 550 m normal trenching with four cables of twenty-four core
```
*Output:* Maps locations, draws 100 m track crossing with sleeper glyphs (1.2 m depth per IRSEM), 150 m GI pipe, 550 m trenching, and cable callout for 4 Nos. x 24 Core cables.

---

## 📲 3. Installing `RailDraw.apk` on Your Phone

The APK is pre-aligned (4-byte ZipAlign) and signed with APK Signature Schemes v1, v2, and v3:

1. Download **`RailDraw.apk`** from `http://192.168.0.104:8000/download` (or transfer via WhatsApp / USB).
2. Tap **RailDraw.apk** in Downloads or File Manager.
3. If Android displays *"Install unknown apps"*, tap **Settings** ➔ Toggle **ON** *"Allow from this source"*.
4. If Google Play Protect asks to scan, it will verify and install cleanly with zero signature conflicts.
5. Tap **Install** ➔ Open! The app runs completely offline.
