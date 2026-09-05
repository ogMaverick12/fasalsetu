const puppeteer = require('puppeteer-core');
const path = require('path');

async function captureScreenshot(url, outputPath) {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: outputPath, fullPage: false });

  await browser.close();
  console.log(`Screenshot saved to ${outputPath}`);
}

const targetUrl = process.argv[2] || 'http://localhost:3001';
const destination = process.argv[3] || path.join(__dirname, 'screenshot-390.png');

captureScreenshot(targetUrl, destination).catch((err) => {
  console.error('Failed to capture screenshot:', err);
  process.exit(1);
});
