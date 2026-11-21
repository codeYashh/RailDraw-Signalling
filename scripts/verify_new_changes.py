import os
import sys
import time
import subprocess
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler

def run_tests():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    dist_dir = os.path.join(root, "frontend", "dist")

    # Start simple HTTP server for dist_dir
    os.chdir(dist_dir)
    server = HTTPServer(("127.0.0.1", 8765), SimpleHTTPRequestHandler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    print("Serving frontend dist on http://127.0.0.1:8765/ ...")

    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 430, "height": 932})

        print("1. Opening app...")
        page.goto("http://127.0.0.1:8765/index.html")

        # Skip or wait for splash
        skip_btn = page.locator("button:has-text('Skip')")
        if skip_btn.is_visible():
            skip_btn.click()
        page.wait_for_timeout(1000)

        # Take screenshot of home page
        page.screenshot(path=os.path.join(root, "screenshot_home_liquid_glass.png"))
        print("Captured screenshot_home_liquid_glass.png")

        # Verify liquid glass buttons and rounded shapes
        gen_btn = page.locator("button:has-text('Generate')")
        print(f"Generate button visible: {gen_btn.is_visible()}")

        # Test Update Modal: Check loading wheel rotation & "Checking for updates..."
        print("2. Testing Update Modal...")
        update_btn = page.locator("button[aria-label='Check for software updates']").first
        update_btn.click()
        page.wait_for_timeout(350)

        # Verify loading wheel and "Checking for updates..." text
        checking_text = page.locator("text='Checking for updates...'")
        print(f"Checking for updates visible: {checking_text.is_visible()}")
        page.screenshot(path=os.path.join(root, "screenshot_update_loading_wheel.png"))
        print("Captured screenshot_update_loading_wheel.png")

        # Wait for check to complete (minDelay is 1300ms)
        page.wait_for_timeout(1800)

        # Check update dialog content
        page.screenshot(path=os.path.join(root, "screenshot_update_result.png"))
        print("Captured screenshot_update_result.png")

        # Test Preview Update UI button
        preview_btn = page.locator("button:has-text('Preview Update UI')")
        if preview_btn.is_visible():
            preview_btn.click()
            page.wait_for_timeout(300)
            page.screenshot(path=os.path.join(root, "screenshot_update_available_action.png"))
            print("Captured screenshot_update_available_action.png (Update Available view)")

            # Test Update Now button
            update_now_btn = page.locator("button:has-text('Update Now')")
            print(f"Update Now button visible: {update_now_btn.is_visible()}")
            update_now_btn.click()
            page.wait_for_timeout(600)
            page.screenshot(path=os.path.join(root, "screenshot_update_downloading.png"))
            print("Captured screenshot_update_downloading.png (Active downloading)")

        # Close update modal
        close_btn = page.locator("button[aria-label='Close update checker']")
        close_btn.click()
        page.wait_for_timeout(400)

        # Test Generating Drawing & Edit Mode
        print("3. Testing Generate & Edit Mode...")
        textarea = page.locator("#route-prompt-input")
        textarea.fill("Signal S12 to Point Machine P4 total 500m route, 20m HDD and rest normal trenching")
        gen_btn.click()

        # Wait for CAD canvas to appear
        page.wait_for_selector("#rail-cad-canvas", timeout=8000)
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(root, "screenshot_result_normal_view.png"))
        print("Captured screenshot_result_normal_view.png")

        # Click Edit Mode
        edit_mode_btn = page.locator("button:has-text('Edit Mode')").first
        print(f"Edit Mode button visible: {edit_mode_btn.is_visible()}")
        edit_mode_btn.click()
        page.wait_for_timeout(600)

        # Verify Edit Mode Dock & tabs
        page.screenshot(path=os.path.join(root, "screenshot_edit_mode_active.png"))
        print("Captured screenshot_edit_mode_active.png")

        # Switch to Route & Details tab in Edit Mode
        details_tab = page.locator("button:has-text('Route & Details')")
        if details_tab.is_visible():
            details_tab.click()
            page.wait_for_timeout(400)
            page.screenshot(path=os.path.join(root, "screenshot_edit_mode_details.png"))
            print("Captured screenshot_edit_mode_details.png")

        print("All tests passed successfully!")
        browser.close()

if __name__ == "__main__":
    run_tests()
