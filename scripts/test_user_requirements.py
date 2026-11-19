import time
from playwright.sync_api import sync_playwright

def test_workflow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport similar to Android phone
        page = browser.new_page(viewport={"width": 430, "height": 932})

        print("1. Navigating to RailDraw app at http://127.0.0.1:8000/app/ ...")
        page.goto("http://127.0.0.1:8000/app/", wait_until="networkidle")

        # Wait for splash or home composer
        time.sleep(1.5)

        # Check if language toggle is visible and switch to Hindi
        print("2. Testing Hindi Language Selector & Prompt...")
        hindi_btn = page.locator("button:has-text('हिंदी')")
        if hindi_btn.is_visible():
            hindi_btn.click()
            print("Switched to Hindi mode.")

        # Fill Hindi prompt: "सिग्नल S12 से पॉइंट मशीन P4 तक 800 मीटर केबल रूट: 120 मीटर ब्रिज, 30 मीटर कल्वर्ट और बाकी 650 मीटर केबल ट्रफ, 3x4 कोर सिग्नलिंग केबल"
        hindi_prompt = "सिग्नल S12 से पॉइंट मशीन P4 तक 800 मीटर केबल रूट, 120 मीटर ब्रिज, 30 मीटर कल्वर्ट और बाकी 650 मीटर केबल ट्रफ, 3x4 कोर सिग्नलिंग केबल"
        textarea = page.locator("#route-prompt-input")
        textarea.fill(hindi_prompt)

        page.screenshot(path="screenshot_step1_hindi_prompt.png")
        print("Saved screenshot_step1_hindi_prompt.png")

        # Click Generate Drawing / नक्शा बनाएं
        gen_btn = page.locator("button:has-text('नक्शा बनाएं'), button:has-text('Generate Drawing')")
        gen_btn.click()

        # Wait for CAD canvas to render
        page.wait_for_selector("#rail-cad-canvas", timeout=10000)
        time.sleep(1.0)

        # Take screenshot of the newly generated drawing showing railway track (पटरी) and surroundings
        page.screenshot(path="screenshot_step2_drawing_result.png")
        print("Saved screenshot_step2_drawing_result.png")

        # Also capture close-up of drawing canvas
        canvas = page.locator("#rail-cad-canvas")
        canvas.screenshot(path="screenshot_step2_cad_canvas_only.png")
        print("Saved screenshot_step2_cad_canvas_only.png")

        # 3. Test Requirement 1: Edit Written Information
        print("3. Testing 'Edit Info' modal for written text...")
        edit_info_btn = page.locator("button:has-text('Edit Info')").first
        assert edit_info_btn.is_visible(), "Edit Info button should be visible"
        edit_info_btn.click()
        time.sleep(0.5)

        # Take screenshot of the Edit Info Modal
        page.screenshot(path="screenshot_step3_edit_info_modal.png")
        print("Saved screenshot_step3_edit_info_modal.png")

        # Modify Start Node ID and click save
        start_input = page.locator("input[placeholder*='S12']").first
        if start_input.is_visible():
            start_input.fill("SIGNAL NO. S12 (MODIFIED)")

        # Switch to Segments tab
        segments_tab = page.locator("button:has-text('2. Segments')")
        if segments_tab.is_visible():
            segments_tab.click()
            time.sleep(0.3)
            page.screenshot(path="screenshot_step3_segments_tab.png")

        # Click Apply & Update Drawing
        apply_btn = page.locator("button:has-text('Apply & Update Drawing')")
        apply_btn.click()
        time.sleep(0.8)
        print("Applied written information changes.")

        # 4. Test Requirement 1: Manage Symbols (Add, Remove, Edit)
        print("4. Testing 'Symbols' Manager Drawer...")
        symbols_btn = page.locator("button:has-text('Symbols')").first
        symbols_btn.click()
        time.sleep(0.5)

        page.screenshot(path="screenshot_step4_symbols_drawer.png")
        print("Saved screenshot_step4_symbols_drawer.png")

        # Click Add Symbol inside the drawer
        add_sym_btn = page.locator("button:has-text('Add Symbol')").last
        add_sym_btn.click()
        time.sleep(0.5)

        page.screenshot(path="screenshot_step4_symbol_picker.png")
        print("Saved screenshot_step4_symbol_picker.png")

        # Pick a symbol (e.g., 4-Aspect Signal or Location Box)
        first_sym_card = page.locator("button:has-text('4-Aspect'), button:has-text('Location Box')").first
        if first_sym_card.is_visible():
            first_sym_card.click()
            time.sleep(0.5)
            print("Inserted new symbol.")

        # Close any open drawer
        done_btn = page.get_by_role("button", name="Done", exact=True)
        if done_btn.is_visible():
            done_btn.click()
            time.sleep(0.5)

        # Final full page & canvas screenshot
        page.screenshot(path="screenshot_step5_final_completed.png")
        canvas.screenshot(path="screenshot_step5_final_canvas.png")
        print("Saved screenshot_step5_final_completed.png and screenshot_step5_final_canvas.png")

        browser.close()
        print("All test steps completed successfully!")

if __name__ == "__main__":
    test_workflow()
