from playwright.sync_api import sync_playwright
import time

def test_raildraw():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport (Android pixel 7)
        page = browser.new_page(viewport={"width": 412, "height": 915})

        print("1. Loading RailDraw on Mobile Android Viewport (412x915)...")
        page.goto("http://127.0.0.1:5173/")
        page.wait_for_selector("text=RailDraw")
        print("✓ RailDraw Home Screen loaded with logo and title.")

        # Check for textarea and placeholder
        textarea = page.locator("textarea")
        assert textarea.is_visible(), "Textarea should be visible"
        print("✓ Large text box is visible.")

        # Verify default prompt
        val = textarea.input_value()
        print(f"✓ Default Prompt in box: {val[:60]}...")

        # Test Generate Drawing Button
        print("2. Clicking 'Generate Drawing'...")
        gen_btn = page.locator("button:has-text('Generate Drawing')")
        gen_btn.click()

        # Should transition to Result Screen
        page.wait_for_selector("text=Save to Phone", timeout=5000)
        print("✓ Transitioned to Result Screen!")

        # Verify 3 buttons: Save to Phone, Share, Edit
        assert page.get_by_role("button", name="Save to Phone").is_visible(), "Save to Phone button must be visible"
        assert page.get_by_role("button", name="Share").is_visible(), "Share button must be visible"
        assert page.get_by_role("button", name="Edit", exact=True).is_visible(), "Edit button must be visible"
        print("✓ All 3 buttons (Save to Phone, Share, Edit) verified!")

        # Verify drawing canvas is rendered
        assert page.locator("svg#rail-cad-canvas").is_visible(), "CAD SVG canvas must be rendered"
        print("✓ Signalling CAD Drawing rendered on screen!")

        page.screenshot(path="screenshot_raildraw_result.png")
        print("✓ Saved screenshot_raildraw_result.png")

        # Test "Save to Phone"
        page.get_by_role("button", name="Save to Phone").click()
        page.wait_for_selector("text=Saved to Gallery", timeout=3000)
        print("✓ 'Saved to Gallery' toast verified!")

        # Test "Edit" button returns to Home screen with text preserved
        print("3. Testing 'Edit' button navigation...")
        page.get_by_role("button", name="Edit", exact=True).click()
        page.wait_for_selector("text=Generate Drawing", timeout=5000)
        val_after_edit = page.locator("textarea").input_value()
        assert val_after_edit == val, "Text must be preserved when going back to edit"
        print("✓ Returned to Home Screen with prompt text perfectly preserved!")

        # 4. Test Error Handling & Validation
        print("4. Testing Validation Error: Mismatched total (e.g. 520m total with 500m segments)...")
        page.fill("textarea", "Cable route from L1 to L12, 520 m: 20 m trenchless, 50 m GI pipe, 430 m normal trenching")
        page.click("button:has-text('Generate Drawing')")
        page.wait_for_selector("text=Segments add up to 500 m but total is 520 m", timeout=3000)
        print("✓ Friendly validation error displayed correctly without crashing!")

        page.screenshot(path="screenshot_raildraw_home.png")
        print("✓ Saved screenshot_raildraw_home.png")

        browser.close()
        print("\n==========================================")
        print("ALL TESTS PASSED WITH 100% SUCCESS!")
        print("==========================================")

if __name__ == "__main__":
    test_raildraw()
