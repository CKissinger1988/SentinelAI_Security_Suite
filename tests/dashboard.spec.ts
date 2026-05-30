import { test, expect } from "@playwright/test";

test("STEPP x3 UI Automation Test", async ({ page }) => {
  console.log("Navigating to SpartanAI Hub...");
  await page.goto("http://localhost:3001");

  // Attempt login
  console.log("Attempting login...");
  const inputs = await page.locator("input").all();
  if (inputs.length >= 2) {
    await inputs[0].fill(process.env.TEST_EMAIL || "admin@spartanai.local");
    await inputs[1].fill(process.env.TEST_PASSWORD || "password123");

    const buttons = await page.locator("button").all();
    if (buttons.length > 0) {
      await buttons[0].click();
      await page.waitForLoadState("networkidle");
      console.log("Login sequence executed.");
    }
  }

  // Ensure dashboard loads
  await page.waitForTimeout(2000);

  // Click various buttons
  console.log("Executing STEPP clicking on dashboard buttons...");
  const dashboardButtons = await page.locator("button").all();
  console.log(`Found ${dashboardButtons.length} buttons to interact with.`);

  for (let i = 0; i < Math.min(dashboardButtons.length, 5); i++) {
    const btn = dashboardButtons[i];
    try {
      if ((await btn.isVisible()) && (await btn.isEnabled())) {
        console.log(`Clicking button ${i + 1}...`);
        await btn.click({ force: true });
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log(`Could not click button ${i + 1}: ${e}`);
    }
  }

  console.log("STEPP x3 UI interaction completed successfully.");
  await page.screenshot({ path: "dashboard_stepp_result.png", fullPage: true });
  console.log("Saved screenshot to dashboard_stepp_result.png");
});
