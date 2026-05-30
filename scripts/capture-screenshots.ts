import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const screenshotDir = path.join(process.cwd(), "screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // Mock speech synthesis to prevent audio failures or blocks in headless browser
  await context.addInitScript(() => {
    (window as any).speechSynthesis = {
      speak: () => {},
      cancel: () => {},
      pause: () => {},
      resume: () => {},
      getVoices: () => [],
      pending: false,
      speaking: false,
      paused: false,
      onvoiceschanged: null,
    };
  });

  const page = await context.newPage();

  console.log("Navigating to login page...");
  await page.goto("http://localhost:3001");
  await page.waitForTimeout(2000);

  console.log("Capturing Login Page...");
  await page.screenshot({ path: path.join(screenshotDir, "1_login_page.png") });

  console.log("Entering credentials...");
  const emailInput = page.locator(
    'input[placeholder="OPERATOR_ID (Username)"]',
  );
  await emailInput.fill("Creator");
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill("@LoveAlways11646");

  console.log("Submitting login form...");
  const loginButton = page.locator("button", {
    hasText: "INITIALIZE SECURE ACCESS",
  });
  await loginButton.click();

  // Wait for login redirection
  await page.waitForSelector("text=SYSTEM_STATUS_REPORT", { timeout: 15000 });
  // Extra wait for animations to settle
  await page.waitForTimeout(2000);

  console.log("Capturing Dashboard - Low Threat Level (Cyan theme)...");
  await page.screenshot({
    path: path.join(screenshotDir, "2_dashboard_low.png"),
  });

  console.log("Updating Threat Level to Medium (Amber theme)...");
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent("spartanai-security-core-threat-level", {
        detail: { level: "medium" },
      }),
    );
  });
  await page.waitForTimeout(1000);
  console.log("Capturing Dashboard - Medium Threat Level (Amber theme)...");
  await page.screenshot({
    path: path.join(screenshotDir, "3_dashboard_medium.png"),
  });

  console.log("Updating Threat Level to Critical (Red theme)...");
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent("spartanai-security-core-threat-level", {
        detail: { level: "critical" },
      }),
    );
  });
  await page.waitForTimeout(1000);
  console.log("Capturing Dashboard - Critical Threat Level (Red theme)...");
  await page.screenshot({
    path: path.join(screenshotDir, "4_dashboard_critical.png"),
  });

  // Restore threat level to low for other pages
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent("spartanai-security-core-threat-level", {
        detail: { level: "low" },
      }),
    );
  });
  await page.waitForTimeout(500);

  // Click Enclave Tab
  console.log("Navigating to Operational Enclave Tab...");
  const enclaveTab = page.locator("button", { hasText: "OP_ENCLAVE" });
  await enclaveTab.click();
  await page.waitForTimeout(1500);
  console.log("Capturing Operational Enclave...");
  await page.screenshot({
    path: path.join(screenshotDir, "5_operational_enclave.png"),
  });

  // Click Metasploit Tab
  console.log("Navigating to Metasploit Framework Tab...");
  const msfTab = page.locator("button", { hasText: "MSF_FRAMEWORK" });
  await msfTab.click();
  await page.waitForTimeout(1500);
  console.log("Capturing Metasploit Framework...");
  await page.screenshot({
    path: path.join(screenshotDir, "6_metasploit_framework.png"),
  });

  // Click Jarvis Tab
  console.log("Navigating to Jarvis/Models Tab...");
  const jarvisTab = page.locator("button", { hasText: "JARVIS" });
  await jarvisTab.click();
  await page.waitForTimeout(1500);
  console.log("Capturing Jarvis Models Manager...");
  await page.screenshot({
    path: path.join(screenshotDir, "7_jarvis_models.png"),
  });

  console.log("Screenshots captured successfully!");
  await browser.close();

  // Create preview page
  generatePreviewPage(screenshotDir);
}

function generatePreviewPage(dir: string) {
  console.log("Generating dashboard_preview.html...");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".png"))
    .sort();

  const cardsHtml = files
    .map((file) => {
      const title = file
        .replace(/^\d+_/, "")
        .replace(".png", "")
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return `
      <div class="card">
        <div class="card-header">${title}</div>
        <div class="card-body">
          <img src="screenshots/${file}" alt="${title}">
        </div>
      </div>
    `;
    })
    .join("\n");

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SpartanAI Security Suite UI Screenshots Preview</title>
  <style>
    :root {
      --bg-color: #060810;
      --card-bg: #0d111d;
      --border-color: #1e293b;
      --text-color: #f8fafc;
      --text-muted: #64748b;
      --primary-color: #06b6d4;
      --primary-glow: rgba(6, 182, 212, 0.2);
    }
    
    body {
      background-color: var(--bg-color);
      color: var(--text-color);
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    header {
      text-align: center;
      margin-bottom: 40px;
      max-width: 800px;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 10px 0;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, #06b6d4, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-transform: uppercase;
    }

    p.subtitle {
      font-size: 1.1rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.6;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
      max-width: 1200px;
      width: 100%;
    }

    @media (min-width: 900px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    }

    .card:hover {
      border-color: var(--primary-color);
      box-shadow: 0 15px 30px -5px var(--primary-glow);
      transform: translateY(-2px);
    }

    .card-header {
      padding: 16px 24px;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-bottom: 1px solid var(--border-color);
      background-color: rgba(255,255,255,0.02);
      color: var(--primary-color);
      font-family: monospace;
    }

    .card-body {
      padding: 0;
      line-index: 0;
    }

    .card-body img {
      width: 100%;
      height: auto;
      display: block;
      transition: opacity 0.3s ease;
    }
    
    footer {
      margin-top: 60px;
      color: var(--text-muted);
      font-size: 0.85rem;
      font-family: monospace;
      text-align: center;
      border-top: 1px solid var(--border-color);
      padding-top: 20px;
      width: 100%;
      max-width: 1200px;
    }
  </style>
</head>
<body>
  <header>
    <h1>SpartanAI Security Suite</h1>
    <p class="subtitle">Autonomous Security Operations Center (ASOC) - User Interface and Threat-Level Theme Showcase</p>
  </header>

  <div class="grid">
    ${cardsHtml}
  </div>

  <footer>
    SPARTANAI SECURITY SUITE // ENCLAVE STATUS: DEPLOYED AND VERIFIED
  </footer>
</body>
</html>
  `;

  fs.writeFileSync(
    path.join(process.cwd(), "dashboard_preview.html"),
    htmlContent,
  );
  console.log("dashboard_preview.html generated successfully!");
}

main().catch(console.error);
