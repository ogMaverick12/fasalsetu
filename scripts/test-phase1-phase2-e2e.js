const puppeteer = require('puppeteer-core');
const path = require('path');

async function runE2ETests() {
  console.log('Launching headless Chrome at 390px viewport...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const baseUrl = process.argv[2] || 'http://localhost:3005';
  console.log(`Navigating to ${baseUrl}/diagnose ...`);
  await page.goto(`${baseUrl}/diagnose`, { waitUntil: 'networkidle0' });

  const artifactDir = 'C:/Users/sreej/.gemini/antigravity/brain/c0542fe5-0896-41ff-a236-7ceb4860c809';

  // 1. Screenshot Language Picker & Initial State
  console.log('1. Capturing Language Picker state...');
  const langScreenshot = path.join(artifactDir, 'phase2_language_picker_390px.png');
  await page.screenshot({ path: langScreenshot, fullPage: false });
  console.log(`Saved: ${langScreenshot}`);

  // 2. Test Photo Flow with authentic PlantVillage Tomato Early Blight
  console.log('2. Testing Photo Diagnosis with Tomato Early Blight image...');
  const imagePath = path.join(__dirname, '..', 'test-assets', 'tomato_early_blight.jpg');
  const fileInput = await page.$('input[type="file"]');
  await fileInput.uploadFile(imagePath);

  // Wait for diagnosis result to appear
  console.log('Waiting for diagnosis result...');
  await page.waitForFunction(
    () => document.body.innerText.includes('समाधान') || document.body.innerText.includes('Advice') || document.body.innerText.includes('झुलसा'),
    { timeout: 15000 }
  );

  await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));

  const photoScreenshot = path.join(artifactDir, 'phase1_photo_diagnosis_390px.png');
  await page.screenshot({ path: photoScreenshot, fullPage: false });
  console.log(`Saved: ${photoScreenshot}`);

  // 3. Reset and test Voice Note Flow
  console.log('3. Resetting to test Voice Note diagnosis flow...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const resetBtn = buttons.find(b => b.innerText.includes('दूसरी फसल') || b.innerText.includes('Check Another'));
    if (resetBtn) resetBtn.click();
  });

  await page.evaluate(() => new Promise((r) => setTimeout(r, 800)));

  // Switch to Voice tab
  console.log('Switching to Voice tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const voiceTab = buttons.find(b => b.innerText.includes('आवाज') || b.innerText.includes('Voice'));
    if (voiceTab) voiceTab.click();
  });

  await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));

  // Screenshot the Voice Tab ready state
  const voiceReadyScreenshot = path.join(artifactDir, 'phase2_voice_entry_390px.png');
  await page.screenshot({ path: voiceReadyScreenshot, fullPage: false });
  console.log(`Saved: ${voiceReadyScreenshot}`);

  // Click voice record button
  console.log('Starting voice note recording...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const micBtn = buttons.find(b => b.innerText.includes('बोलकर बताएं') || b.innerText.includes('tell me what'));
    if (micBtn) micBtn.click();
  });

  // Wait 1.5s recording
  await page.evaluate(() => new Promise((r) => setTimeout(r, 1500)));

  // Stop recording
  console.log('Stopping voice note recording to trigger diagnosis...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const stopBtn = buttons.find(b => b.innerText.includes('समाप्त') || b.innerText.includes('Finish'));
    if (stopBtn) stopBtn.click();
  });

  // Wait for diagnosis result to appear
  await page.waitForFunction(
    () => document.body.innerText.includes('समाधान') || document.body.innerText.includes('Advice') || document.body.innerText.includes('झुलसा'),
    { timeout: 15000 }
  );

  await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));

  const voiceScreenshot = path.join(artifactDir, 'phase2_voice_diagnosis_390px.png');
  await page.screenshot({ path: voiceScreenshot, fullPage: false });
  console.log(`Saved: ${voiceScreenshot}`);

  await browser.close();
  console.log('All end-to-end tests and screenshots completed successfully!');
}

runE2ETests().catch((err) => {
  console.error('E2E Test Error:', err);
  process.exit(1);
});
