import os
import sys
import json
import subprocess
import urllib.request
import urllib.error

def get_git_token():
    env_token = os.environ.get('GITHUB_TOKEN')
    if env_token:
        return env_token
    try:
        p = subprocess.Popen(['git', 'credential', 'fill'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
        out, _ = p.communicate(input='protocol=https\nhost=github.com\n')
        for line in out.splitlines():
            if line.startswith('password='):
                return line.split('=', 1)[1].strip()
    except Exception:
        pass
    return None

TOKEN = get_git_token()
REPO_OWNER = 'codeYashh'
REPO_NAME = 'RailDraw-Signalling'
TAG_NAME = 'v1.5.0'
RELEASE_NAME = 'RailDraw Signalling v1.5.0'
RELEASE_BODY = """### RailDraw Signalling v1.5.0 Official Release

#### What's New:
- **Dynamic Theme-Matching Load Screen**: Splash screen and native Android views seamlessly adapt to Light and Dark modes with zero load-time flicker.
- **25 New Official Indian Railways S&T Symbols (70 Total)**:
  - **Signals**: Route Indicators (Feather type), Automatic Signals ('A' marker), Semi-Automatic ('A' illuminated), Inner Distant ('ID' marker), Intermediate Starter, Co-acting duplicated heads, Banner Repeater, Position Light Shunt, Calling-On on CLS mast, Gate Signals ('G' marker), Semaphore Warner fishtail.
  - **Track & Points**: Fouling Marks (FM post), Track Lead Junction Boxes (TLJB), MSDAC Wheel Sensors, Point Machines with Clamp Locks.
  - **Boards & Indicators**: Shunting Limit Board (SLB), Block Section Limit Board (BSLB), Whistle Boards (W / W/L), Warning Boards (diagonal stripes), Speed & Termination Boards (T/P & T/G).
  - **Power & Telecom**: Emergency Telephone Sockets (EC), IPS Equipment Room, Solar PV Arrays, OFC Cable Markers, and SPD Cabinets.
- **Direct In-App OTA Update Engine**: Instant update detection via GitHub Releases & Contents API.
- **Layered AutoCAD DXF & Vector CAD Integration**: High-precision vector exports for all placed equipment.
"""

APK_PATH = os.path.abspath('RailDraw.apk')

def get_headers(content_type='application/json'):
    return {
        'Authorization': f'Bearer {TOKEN}',
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'RailDraw-Release-Script',
        'Content-Type': content_type
    }

def main():
    if not os.path.exists(APK_PATH):
        print(f"Error: APK file not found at {APK_PATH}")
        sys.exit(1)

    print(f"Target APK: {APK_PATH} ({os.path.getsize(APK_PATH):,} bytes)")

    # 1. Check if release already exists
    release_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/releases/tags/{TAG_NAME}"
    existing_release = None
    try:
        req = urllib.request.Request(release_url, headers=get_headers())
        with urllib.request.urlopen(req) as resp:
            existing_release = json.loads(resp.read().decode())
            print(f"Release {TAG_NAME} already exists (ID: {existing_release.get('id')})")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"Release {TAG_NAME} does not exist yet. Creating...")
        else:
            print(f"Error checking release: {e}")
            sys.exit(1)

    # 2. Create release if not exists
    if not existing_release:
        create_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/releases"
        payload = json.dumps({
            "tag_name": TAG_NAME,
            "target_commitish": "main",
            "name": RELEASE_NAME,
            "body": RELEASE_BODY,
            "draft": False,
            "prerelease": False
        }).encode('utf-8')

        req = urllib.request.Request(create_url, data=payload, headers=get_headers(), method='POST')
        try:
            with urllib.request.urlopen(req) as resp:
                existing_release = json.loads(resp.read().decode())
                print(f"Successfully created release {TAG_NAME} (ID: {existing_release.get('id')})")
        except urllib.error.HTTPError as e:
            print(f"Failed to create release: {e.code} {e.read().decode()}")
            sys.exit(1)

    release_id = existing_release['id']
    upload_url_template = existing_release['upload_url'] # e.g. https://uploads.github.com/.../assets{?name,label}
    clean_upload_url = upload_url_template.split('{')[0]

    # 3. Check if RailDraw.apk asset is already attached
    assets = existing_release.get('assets', [])
    for a in assets:
        if a['name'] == 'RailDraw.apk':
            print(f"Deleting previous APK asset (ID: {a['id']})...")
            del_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/releases/assets/{a['id']}"
            del_req = urllib.request.Request(del_url, headers=get_headers(), method='DELETE')
            try:
                with urllib.request.urlopen(del_req) as resp:
                    print("Deleted previous APK asset.")
            except Exception as del_err:
                print(f"Warning deleting old asset: {del_err}")

    # 4. Upload RailDraw.apk to release
    print(f"Uploading RailDraw.apk ({os.path.getsize(APK_PATH):,} bytes)...")
    target_upload_url = f"{clean_upload_url}?name=RailDraw.apk"

    with open(APK_PATH, 'rb') as f:
        apk_bytes = f.read()

    upload_req = urllib.request.Request(
        target_upload_url,
        data=apk_bytes,
        headers=get_headers(content_type='application/vnd.android.package-archive'),
        method='POST'
    )

    try:
        with urllib.request.urlopen(upload_req) as resp:
            uploaded_asset = json.loads(resp.read().decode())
            print(f"Successfully uploaded RailDraw.apk! Download URL: {uploaded_asset.get('browser_download_url')}")
    except urllib.error.HTTPError as e:
        print(f"Failed to upload asset: {e.code} {e.read().decode()}")
        sys.exit(1)

    # 5. Verify /releases/latest endpoint
    latest_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/releases/latest"
    ver_req = urllib.request.Request(latest_url, headers=get_headers())
    with urllib.request.urlopen(ver_req) as resp:
        latest_data = json.loads(resp.read().decode())
        print(f"VERIFIED: /releases/latest tag_name = {latest_data.get('tag_name')}")
        print(f"Assets: {[a['name'] for a in latest_data.get('assets', [])]}")

if __name__ == '__main__':
    main()
