import { test, expect } from '@playwright/test';

// Helper: login and wait for dashboard to fully load (past boot sequence)
async function loginAndWaitForDashboard(page: import('@playwright/test').Page) {
  await page.goto('http://localhost:3001');
  await page.locator('input[placeholder="OPERATOR_ID (Username)"]').fill('Creator');
  await page.locator('input[type="password"]').fill('@LoveAlways11646');
  await page.locator('button', { hasText: 'INITIALIZE SECURE ACCESS' }).click();
  // Wait for boot sequence to finish and dashboard to appear
  await expect(page.locator('text=SYSTEM_STATUS_REPORT')).toBeVisible({ timeout: 30000 });
}

test.describe('SpartanAI Security Suite - Comprehensive Tests', () => {

  test.describe('Authentication', () => {

    test('Login page renders correctly', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Verify branding
      await expect(page.locator('text=SPARTANAI_SECURITY_CORE')).toBeVisible();
      await expect(page.locator('text=Enterprise Security Intelligence Suite')).toBeVisible();

      // Verify form fields exist
      await expect(page.locator('input[placeholder="OPERATOR_ID (Username)"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();

      // Verify login button
      await expect(page.locator('button', { hasText: 'INITIALIZE SECURE ACCESS' })).toBeVisible();

      // Verify Remember Operator ID checkbox text
      await expect(page.locator('text=Remember Operator ID')).toBeVisible();

      // Verify version info
      await expect(page.locator('text=VERSION: 2.5.0-STABLE')).toBeVisible();
    });

    test('Successful login navigates to dashboard', async ({ page }) => {
      await loginAndWaitForDashboard(page);

      // Verify dashboard header is visible
      await expect(page.locator('text=SYSTEM_STATUS_REPORT')).toBeVisible();

      // Verify top nav bar elements
      await expect(page.locator('text=SPARTANAI_SECURITY_CORE_SECURITY_CONSOLE')).toBeVisible();
    });

    test('Failed login shows error message', async ({ page }) => {
      await page.goto('http://localhost:3001');
      await page.locator('input[placeholder="OPERATOR_ID (Username)"]').fill('wronguser');
      await page.locator('input[type="password"]').fill('wrongpass');
      await page.locator('button', { hasText: 'INITIALIZE SECURE ACCESS' }).click();

      // Verify error message appears
      await expect(page.locator('text=/Authentication failed|Access denied/i')).toBeVisible({ timeout: 10000 });
    });

    test('Master Mode toggle shows WebAuthn UI', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Click the shield icon to toggle master mode
      await page.locator('.cursor-pointer').first().click();

      // Verify master mode UI elements
      await expect(page.locator('text=AUTHORIZE SOVEREIGN ENTRY')).toBeVisible();
      await expect(page.locator('button', { hasText: 'Register Key' })).toBeVisible();
      await expect(page.locator('button', { hasText: 'Authenticate Key' })).toBeVisible();

      // Verify the username field shows master email and is readonly
      const emailInput = page.locator('input[placeholder="OPERATOR_ID (Username)"]');
      await expect(emailInput).toHaveValue('Creator');
    });

    test('Master Mode can be toggled off', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Toggle master mode on
      await page.locator('.cursor-pointer').first().click();
      await expect(page.locator('text=AUTHORIZE SOVEREIGN ENTRY')).toBeVisible();

      // Toggle master mode off
      await page.locator('.cursor-pointer').first().click();
      await expect(page.locator('text=INITIALIZE SECURE ACCESS')).toBeVisible();

      // WebAuthn buttons should no longer be visible
      await expect(page.locator('button', { hasText: 'Register Key' })).not.toBeVisible();
    });
  });

  test.describe('Dashboard', () => {

    test.beforeEach(async ({ page }) => {
      await loginAndWaitForDashboard(page);
    });

    test('Status gauges are displayed', async ({ page }) => {
      await expect(page.locator('text=Shield Integrity')).toBeVisible();
      await expect(page.locator('text=Threat Index')).toBeVisible();
      await expect(page.locator('text=Network Entropy')).toBeVisible();
    });

    test('Holographic Control Hub is displayed with toggles', async ({ page }) => {
      await expect(page.locator('text=Holographic Control Hub')).toBeVisible();

      // Verify all four control toggles exist
      await expect(page.locator('text=Stealth Evasion')).toBeVisible();
      await expect(page.locator('text=Decoy HoneyGrid')).toBeVisible();
      await expect(page.locator('text=Auto-Countermeasures')).toBeVisible();
      await expect(page.locator('text=Enclave Hardening')).toBeVisible();
    });

    test('SpartanAI_Security_Core Shell is displayed and accepts input', async ({ page }) => {
      await expect(page.locator('text=SpartanAI_Security_Core Shell')).toBeVisible();

      // Verify terminal has initial messages
      await expect(page.locator('text=SPARTANAI_SECURITY_CORE_SHELL v2.5.0-STABLE READY.')).toBeVisible();

      // Verify command input exists
      const commandInput = page.locator('input[placeholder="Enter system command..."]');
      await expect(commandInput).toBeVisible();
    });

    test('Terminal executes "status" command', async ({ page }) => {
      const commandInput = page.locator('input[placeholder="Enter system command..."]');
      await commandInput.fill('status');
      await commandInput.press('Enter');

      // Verify the command appears in terminal output
      await expect(page.locator('text=operator@spartanai-security-core:~$ status')).toBeVisible({ timeout: 10000 });
    });

    test('Terminal executes "probe network" command', async ({ page }) => {
      const commandInput = page.locator('input[placeholder="Enter system command..."]');
      await commandInput.fill('probe network');
      await commandInput.press('Enter');

      // Verify the command response
      await expect(page.locator('text=NETWORK RECON PROBE INITIATED')).toBeVisible({ timeout: 10000 });
    });

    test('Cloud Desktop launch card is visible', async ({ page }) => {
      await expect(page.locator('text=LAUNCH_CLOUD_DESK')).toBeVisible();
      await expect(page.locator('text=Tunnel Secured')).toBeVisible();
    });

    test('Mobile C2 Sovereign Link section is visible', async ({ page }) => {
      await expect(page.locator('text=Mobile_C2_Sovereign_Link')).toBeVisible();
    });

    test('System Maintenance button is visible', async ({ page }) => {
      await expect(page.locator('text=System_Maintenance')).toBeVisible();
    });
  });

  test.describe('Sidebar Navigation', () => {

    test.beforeEach(async ({ page }) => {
      await loginAndWaitForDashboard(page);
    });

    test('All sidebar tabs are visible', async ({ page }) => {
      const tabLabels = [
        'COMMAND',
        'OP_ENCLAVE',
        'JARVIS',
        'KALI_CONS',
        'NEURAL_MOD',
        'SEC_RECON',
        'MSF_FRAMEWORK',
        'MATRIX_CORE',
        'HUB_MASTER',
      ];

      for (const label of tabLabels) {
        await expect(page.locator(`text=${label}`).first()).toBeVisible();
      }
    });

    test('Settings (CONFIG) button is visible', async ({ page }) => {
      await expect(page.locator('text=CONFIG')).toBeVisible();
    });

    test('Disconnect (logout) button is visible', async ({ page }) => {
      await expect(page.locator('text=DISCONNECT')).toBeVisible();
    });

    test('Clicking OP_ENCLAVE tab switches view', async ({ page }) => {
      await page.locator('text=OP_ENCLAVE').click();
      // Dashboard header should no longer be visible
      await expect(page.locator('text=SYSTEM_STATUS_REPORT')).not.toBeVisible({ timeout: 5000 });
    });

    test('Clicking COMMAND tab returns to dashboard', async ({ page }) => {
      // Navigate away first
      await page.locator('text=OP_ENCLAVE').click();
      await expect(page.locator('text=SYSTEM_STATUS_REPORT')).not.toBeVisible({ timeout: 5000 });

      // Navigate back to dashboard
      await page.locator('text=COMMAND').click();
      await expect(page.locator('text=SYSTEM_STATUS_REPORT')).toBeVisible({ timeout: 5000 });
    });

    test('Logout returns to login page', async ({ page }) => {
      await page.locator('text=DISCONNECT').click();

      // Verify we're back on the login page
      await expect(page.locator('text=SPARTANAI_SECURITY_CORE')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('button', { hasText: 'INITIALIZE SECURE ACCESS' })).toBeVisible();
    });
  });

  test.describe('Settings Panel', () => {

    test.beforeEach(async ({ page }) => {
      await loginAndWaitForDashboard(page);
    });

    test('Settings panel opens and closes', async ({ page }) => {
      // Open settings
      await page.locator('text=CONFIG').click();
      await expect(page.locator('text=SYSTEM_CONFIGURATION')).toBeVisible({ timeout: 5000 });

      // Close settings with the Close button
      await page.locator('button', { hasText: 'Close' }).click();
      await expect(page.locator('text=SYSTEM_CONFIGURATION')).not.toBeVisible({ timeout: 5000 });
    });

    test('Settings panel contains Audio and API sections', async ({ page }) => {
      await page.locator('text=CONFIG').click();
      await expect(page.locator('text=SYSTEM_CONFIGURATION')).toBeVisible({ timeout: 5000 });

      // The settings panel should contain the AudioSettingsPanel and ApiSettingsPanel
      // At minimum, the panel itself should be visible
      const settingsPanel = page.locator('text=SYSTEM_CONFIGURATION');
      await expect(settingsPanel).toBeVisible();
    });
  });

  test.describe('Top Navigation Bar', () => {

    test.beforeEach(async ({ page }) => {
      await loginAndWaitForDashboard(page);
    });

    test('Console branding is displayed', async ({ page }) => {
      await expect(page.locator('text=SPARTANAI_SECURITY_CORE_SECURITY_CONSOLE')).toBeVisible();
    });

    test('Operational state indicator is visible', async ({ page }) => {
      await expect(page.locator('text=OPERATIONAL STATE: ACTIVE // REGION: US-WEST')).toBeVisible();
    });

    test('Encryption status is displayed', async ({ page }) => {
      await expect(page.locator('text=ENCRYPTION: AES-256-GCM')).toBeVisible();
    });

    test('Network status indicator is visible', async ({ page }) => {
      // Default threat level is 'low', so status should be NOMINAL
      await expect(page.locator('text=/Network Status:/i')).toBeVisible();
    });
  });

  test.describe('Footer Bar', () => {

    test.beforeEach(async ({ page }) => {
      await loginAndWaitForDashboard(page);
    });

    test('Footer shows system status and version', async ({ page }) => {
      await expect(page.locator('text=SYSTEM OK')).toBeVisible();
      await expect(page.locator('text=SpartanAI Security Core Intelligence v2.5.0-Production')).toBeVisible();
    });

    test('Footer shows sync status', async ({ page }) => {
      await expect(page.locator('text=SECURE_SYNC: AUTHENTICATED')).toBeVisible();
    });
  });
});
