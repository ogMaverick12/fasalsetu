const puppeteer = require('puppeteer-core');
const path = require('path');

async function testBengaliHealthy() {
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

  await page.goto('http://localhost:3005/diagnose', { waitUntil: 'networkidle0' });

  // Click Bengali button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bn = buttons.find(b => b.innerText.includes('বাংলা'));
    if (bn) bn.click();
  });

  await page.evaluate(() => new Promise((r) => setTimeout(r, 600)));

  // Upload healthy tomato leaf
  const imagePath = path.join(__dirname, '..', 'test-assets', 'tomato_healthy.jpg');
  const fileInput = await page.$('input[type="file"]');
  await fileInput.uploadFile(imagePath);

  // Wait for Bengali diagnosis result
  await page.waitForFunction(
    () => document.body.innerText.includes('পরামর্শ') || document.body.innerText.includes('সুস্থ') || document.body.innerText.includes('টমেটো'),
    { timeout: 15000 }
  );

  await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));

  const outPath = 'C:/Users/sreej/.gemini/antigravity/brain/c0542fe5-0896-41ff-a236-7ceb4860c809/phase2_bengali_healthy_diagnosis_390px.png';
  await page.screenshot({ path: outPath, fullPage: false });
  console.log('Saved Bengali Healthy Screenshot:', outPath);

  await browser.close();
}

testBengaliHealthy().catch(console.error);
