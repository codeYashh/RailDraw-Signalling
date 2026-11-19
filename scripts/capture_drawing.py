from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 412, "height": 915})
    page.goto("http://127.0.0.1:8000/app/")
    page.wait_for_selector("text=Generate Drawing")
    page.click("text=Generate Drawing")
    page.wait_for_selector("text=Save to Phone")
    page.screenshot(path="screenshot_raildraw_result_new.png")
    print("Result screenshot saved.")

    drawing = page.locator("#rail-cad-canvas")
    drawing.screenshot(path="screenshot_drawing_only.png")
    print("Drawing element screenshot saved.")
    browser.close()
