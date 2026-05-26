import time
from playwright.sync_api import sync_playwright

print("Initiating STEPP x3 UI Automation Test...")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    print("Navigating to SpartanAI Hub...")
    try:
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')
    except Exception as e:
        print(f"Failed to load page: {e}")
        browser.close()
        exit(1)

    print("Attempting to login...")
    try:
        # Assuming there are input fields for username and password
        inputs = page.locator('input').all()
        if len(inputs) >= 2:
            inputs[0].fill('Creator')
            inputs[1].fill('toor')
            
            # Find a button to click
            buttons = page.locator('button').all()
            if buttons:
                buttons[0].click()
                page.wait_for_load_state('networkidle')
                print("Login sequence executed.")
            else:
                print("No login button found.")
        else:
            print("No login inputs found. Might already be logged in.")
    except Exception as e:
        print(f"Login failed or skipped: {e}")

    print("Executing STEPP clicking on dashboard buttons...")
    try:
        # Give it a second to render the dashboard
        time.sleep(2)
        
        # Click various buttons on the dashboard to test functionality
        buttons = page.locator('button').all()
        print(f"Found {len(buttons)} buttons to interact with.")
        
        # Click the first 5 buttons safely
        for i, button in enumerate(buttons[:5]):
            try:
                if button.is_visible() and button.is_enabled():
                    print(f"Clicking button {i+1}...")
                    button.click()
                    page.wait_for_timeout(500) # wait briefly
            except Exception as e:
                print(f"Could not click button {i+1}: {e}")
        
        print("STEPP x3 UI interaction completed successfully.")
    except Exception as e:
        print(f"Dashboard interaction error: {e}")

    # Take a screenshot for verification
    page.screenshot(path='dashboard_stepp_result.png', full_page=True)
    print("Saved screenshot to dashboard_stepp_result.png")

    browser.close()
