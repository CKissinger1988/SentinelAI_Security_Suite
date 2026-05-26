import { test, expect } from '@playwright/test';

test.describe('SpartanAI E2E Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('Standard Login Flow', async ({ page }) => {
    // Attempt standard password login
    const emailInput = page.locator('input[placeholder="OPERATOR_ID (Username)"]');
    await emailInput.fill('Creator');
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('@LoveAlways11646');
    
    const loginButton = page.locator('button', { hasText: 'INITIALIZE SECURE ACCESS' });
    await loginButton.click();
    
    // Check that we navigate to dashboard
    await expect(page.locator('text=SYSTEM_STATUS_REPORT')).toBeVisible({ timeout: 10000 });
  });

  test('Master Mode and WebAuthn UI', async ({ page }) => {
    const masterButton = page.locator('div').filter({ hasText: 'Shield' }).nth(1); // Click shield icon to toggle master mode
    // Wait, the shield icon is in:
    // <div onClick={toggleMasterMode} ...>
    // Let's look for the shield svg or master admin element
    const shieldToggle = page.locator('form').locator('xpath=..').locator('div').first(); // Or just the element with class containing cursor-pointer
    await page.locator('.cursor-pointer').first().click();
    
    // Verify master mode specific UI elements
    await expect(page.locator('text=AUTHORIZE SOVEREIGN ENTRY')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Register Key' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Authenticate Key' })).toBeVisible();
  });

  test('Dashboard and Threat Alerts', async ({ page }) => {
    // Login first
    const emailInput = page.locator('input[placeholder="OPERATOR_ID (Username)"]');
    await emailInput.fill('Creator');
    await page.locator('input[type="password"]').fill('@LoveAlways11646');
    await page.locator('button', { hasText: 'INITIALIZE SECURE ACCESS' }).click();
    
    await expect(page.locator('text=SYSTEM_STATUS_REPORT')).toBeVisible({ timeout: 10000 });
    
    // Verify Threat Alerts section
    await expect(page.locator('text=Intrusion_IDS_Active')).toBeVisible();
    await expect(page.locator('text=Neural Firewall')).toBeVisible();
    
    // Verify circular status gauges exist
    await expect(page.locator('text=Shield Integrity')).toBeVisible();
    await expect(page.locator('text=Threat Index')).toBeVisible();
    await expect(page.locator('text=Network Entropy')).toBeVisible();

    // Verify Holographic Control Hub exists
    await expect(page.locator('text=Holographic Control Hub')).toBeVisible();

    // Verify Interactive Terminal accepts commands and prints execution logs
    const consoleInput = page.locator('input[placeholder="Enter system command..."]');
    await consoleInput.fill('probe network');
    await consoleInput.press('Enter');
    await expect(page.locator('text=NETWORK RECON PROBE INITIATED')).toBeVisible({ timeout: 10000 });

    // Verify tabs exist
    await expect(page.locator('button', { hasText: 'COMMAND' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'OP_ENCLAVE' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'MSF_FRAMEWORK' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'JARVIS' })).toBeVisible();
  });

});
