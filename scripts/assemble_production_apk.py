import os
import shutil
import zipfile
import subprocess

def assemble():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    dist_dir = os.path.join(root, "frontend", "dist")
    symbols_dir = os.path.join(root, "symbols")
    aapt2_exe = os.path.join(root, "tools", "android-14", "aapt2.exe")
    if not os.path.exists(aapt2_exe):
        aapt2_exe = r"C:\Users\User\.gradle\caches\transforms-4\eaadefa5055600386cb28370966f5a93\transformed\aapt2-8.4.2-11315950-windows\aapt2.exe"
    framework_apk = r"C:\Users\User\AppData\Local\apktool\framework\1.apk"
    manifest_xml = os.path.join(root, "manifest_native.xml")
    compiled_res = os.path.join(root, "compiled_res.zip")
    linked_apk = os.path.join(root, "test_linked.apk")
    native_dex = os.path.join(root, "android", "shell-java", "classes.dex")
    unaligned_apk = os.path.join(root, "RailDraw-unaligned.apk")
    aligned_apk = os.path.join(root, "RailDraw-aligned.apk")
    final_apk = os.path.join(root, "RailDraw.apk")
    zipalign_exe = os.path.join(root, "tools", "android-14", "zipalign.exe")
    if not os.path.exists(zipalign_exe):
        zipalign_exe = os.path.join(root, "zipalign.exe")
    apksigner_jar = os.path.join(root, "tools", "android-14", "lib", "apksigner.jar")
    if not os.path.exists(apksigner_jar):
        apksigner_jar = os.path.join(root, "apksigner.jar")
    keystore = os.path.join(root, "raildraw.keystore")

    gradle_release_dir = os.path.join(root, "android", "app", "build", "outputs", "apk", "release")
    os.makedirs(gradle_release_dir, exist_ok=True)

    print("0. Compiling Android resources & native classes.dex...")
    res_dir = os.path.join(root, "android", "app", "src", "main", "res")
    subprocess.run([aapt2_exe, "compile", "--dir", res_dir, "-o", compiled_res], check=True)
    subprocess.run(["python", os.path.join(root, "scripts", "build_native_dex.py")], check=True)

    print("1. Re-linking resources with aapt2 for com.raildraw.app...")
    subprocess.run([
        aapt2_exe, "link",
        "-I", framework_apk,
        "--manifest", manifest_xml,
        "--compile-sdk-version-code", "34",
        "--compile-sdk-version-name", "14",
        compiled_res,
        "-o", linked_apk,
        "--auto-add-overlay"
    ], check=True)

    print("2. Packaging universal APK archive...")
    apk_entries = {}

    # Read linked APK (Manifest + resources.arsc + res/ drawables)
    with zipfile.ZipFile(linked_apk, "r") as z:
        for name in z.namelist():
            if not name.startswith("META-INF/"):
                apk_entries[name] = z.read(name)

    # Read clean native classes.dex (MainActivity + RailDrawBridge MediaStore/Share/Voice)
    with open(native_dex, "rb") as f:
        apk_entries["classes.dex"] = f.read()

    # Add offline web assets
    with open(os.path.join(dist_dir, "index.html"), "rb") as f:
        apk_entries["assets/main.html"] = f.read()

    assets_folder = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_folder):
        for fname in os.listdir(assets_folder):
            fpath = os.path.join(assets_folder, fname)
            if os.path.isfile(fpath):
                with open(fpath, "rb") as f:
                    apk_entries[f"assets/assets/{fname}"] = f.read()

    if os.path.exists(symbols_dir):
        for r, _, files in os.walk(symbols_dir):
            for file in files:
                rel = os.path.relpath(os.path.join(r, file), symbols_dir).replace("\\", "/")
                with open(os.path.join(r, file), "rb") as f:
                    apk_entries[f"assets/symbols/{rel}"] = f.read()

    for extra in ["icon-192.png", "icon-512.png", "manifest.webmanifest"]:
        epath = os.path.join(dist_dir, extra)
        if os.path.exists(epath):
            with open(epath, "rb") as f:
                apk_entries[f"assets/{extra}"] = f.read()

    # Write unaligned APK
    # CRITICAL for Android 11+ (API 30+) / Samsung One UI:
    # resources.arsc MUST be stored UNCOMPRESSED (ZIP_STORED) and 4-byte aligned,
    # otherwise PackageInstaller rejects the APK with INSTALL_PARSE_FAILED_RESOURCES_ARSC_COMPRESSED.
    # Storing classes.dex uncompressed also matches modern ART/Play Store requirements.
    uncompressed_files = {"resources.arsc", "classes.dex"}
    if os.path.exists(unaligned_apk):
        os.remove(unaligned_apk)
    with zipfile.ZipFile(unaligned_apk, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in apk_entries.items():
            comp = zipfile.ZIP_STORED if (name in uncompressed_files or name.endswith(".so")) else zipfile.ZIP_DEFLATED
            zi = zipfile.ZipInfo(name)
            zi.compress_type = comp
            z.writestr(zi, data, compress_type=comp)

    print(f"3. Bundled {len(apk_entries)} entries into unaligned APK.")

    print("4. 4-byte ZipAligning...")
    if os.path.exists(aligned_apk):
        os.remove(aligned_apk)
    subprocess.run([zipalign_exe, "-p", "-f", "4", unaligned_apk, aligned_apk], check=True)

    print("5. Signing with Google apksigner (v1, v2, v3 enabled) using raildraw.keystore...")
    if os.path.exists(final_apk):
        os.remove(final_apk)

    cmd_sign = [
        "java", "-jar", apksigner_jar, "sign",
        "--ks", keystore,
        "--ks-key-alias", "raildrawkey",
        "--ks-pass", "pass:raildraw123",
        "--key-pass", "pass:raildraw123",
        "--min-sdk-version", "21",
        "--v1-signing-enabled", "true",
        "--v2-signing-enabled", "true",
        "--v3-signing-enabled", "true",
        "--out", final_apk,
        aligned_apk
    ]
    subprocess.run(cmd_sign, check=True)

    # Copy to all expected locations
    shutil.copy2(final_apk, os.path.join(gradle_release_dir, "RailDraw.apk"))
    shutil.copy2(final_apk, os.path.join(gradle_release_dir, "app-release.apk"))
    shutil.copy2(final_apk, os.path.join(root, "frontend", "public", "RailDraw.apk"))
    shutil.copy2(final_apk, os.path.join(root, "frontend", "dist", "RailDraw.apk"))
    shutil.copy2(final_apk, os.path.join(root, "frontend", "public", "raildraw-signalling.apk"))
    shutil.copy2(final_apk, os.path.join(root, "frontend", "dist", "raildraw-signalling.apk"))
    shutil.copy2(final_apk, os.path.join(root, "raildraw-signalling.apk"))

    # Verify resources.arsc is strictly uncompressed (required for Android 11+ / One UI)
    with zipfile.ZipFile(final_apk, "r") as zchk:
        arsc_info = zchk.getinfo("resources.arsc")
        assert arsc_info.compress_type == zipfile.ZIP_STORED, "resources.arsc MUST be uncompressed (ZIP_STORED)!"
        print(f"\n5b. Verified resources.arsc compress_type={arsc_info.compress_type} (ZIP_STORED / uncompressed OK!)")

    res_align = subprocess.run([zipalign_exe, "-c", "-v", "4", final_apk], capture_output=True, text=True)
    assert res_align.returncode == 0, f"zipalign verification failed: {res_align.stdout}\n{res_align.stderr}"
    for line in res_align.stdout.splitlines():
        if "resources.arsc" in line or "classes.dex" in line or "Verification" in line:
            print("   ", line.strip())

    print("\n6. Running apksigner verify --verbose --print-certs --min-sdk-version 23...")
    res_verify = subprocess.run([
        "java", "-jar", apksigner_jar, "verify",
        "--verbose", "--print-certs",
        "--min-sdk-version", "23",
        final_apk
    ], capture_output=True, text=True)
    print(res_verify.stdout)

    print("\n7. Running aapt2 dump badging...")
    res_dump = subprocess.run([aapt2_exe, "dump", "badging", final_apk], capture_output=True, text=True)
    print(res_dump.stdout[:600])

    size_mb = os.path.getsize(final_apk) / (1024 * 1024)
    print(f"\n=======================================================")
    print(f"OFFICIAL RELEASE APK READY: {final_apk}")
    print(f"Size: {size_mb:.2f} MB ({os.path.getsize(final_apk):,} bytes)")
    print(f"Package: com.raildraw.app")
    print(f"MinSdk: 24 | TargetSdk: 34")
    print(f"=======================================================")
    return True

if __name__ == "__main__":
    assemble()
