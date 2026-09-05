const puppeteer = require('puppeteer-core');
const path = require('path');

async function runAdminE2E() {
  console.log('Launching headless Chrome for Reviewer Dashboard (/admin)...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 800,
    deviceScaleFactor: 2,
  });

  const baseUrl = process.argv[2] || 'http://localhost:3007';
  const artifactDir = 'C:/Users/sreej/.gemini/antigravity/brain/c0542fe5-0896-41ff-a236-7ceb4860c809';

  console.log(`Navigating to ${baseUrl}/admin ...`);
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle0' });

  // Wait for data load
  await page.waitForFunction(
    () => document.body.innerText.includes('State-by-State Diagnosis Volume') && document.body.innerText.includes('Maharashtra'),
    { timeout: 15000 }
  );

  await page.evaluate(() => new Promise((r) => setTimeout(r, 1200)));

  // 1. Screenshot Main Dashboard View
  console.log('1. Capturing Main Dashboard View...');
  const dashScreenshot = path.join(artifactDir, 'phase4_admin_dashboard.png');
  await page.screenshot({ path: dashScreenshot, fullPage: false });
  console.log(`Saved Dashboard Screenshot: ${dashScreenshot}`);

  // 2. Click on the first record row to open Drill-down Modal
  console.log('2. Clicking on first diagnosis record row for drill-down...');
  await page.waitForSelector('tbody tr button');
  await page.click('tbody tr button');

  // Wait for drill-down modal to appear
  await page.waitForFunction(
    () => document.body.innerText.toLowerCase().includes('case file') && document.body.innerText.toLowerCase().includes('weather snapshot'),
    { timeout: 10000 }
  );

  await page.evaluate(() => new Promise((r) => setTimeout(r, 800)));

  // Screenshot Drill-Down View
  console.log('3. Capturing Record Drill-down Case File View...');
  const drillScreenshot = path.join(artifactDir, 'phase4_admin_drilldown.png');
  await page.screenshot({ path: drillScreenshot, fullPage: false });
  console.log(`Saved Drill-down Screenshot: ${drillScreenshot}`);

  await browser.close();
  console.log('Phase 4 Admin E2E tests completed successfully!');
}

runAdminE2E().catch((err) => {
  console.error('Admin E2E Error:', err);
  process.exit(1);
});
