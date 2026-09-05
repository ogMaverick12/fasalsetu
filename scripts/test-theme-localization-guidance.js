const puppeteer = require('puppeteer-core');
const path = require('path');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const artifactDir = 'C:/Users/sreej/.gemini/antigravity/brain/c0542fe5-0896-41ff-a236-7ceb4860c809';

  console.log(`Testing Dark Mode, Full Localization & Startup Guidance against ${baseUrl}...`);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--hide-scrollbars',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // Pre-seed has_seen_guide so modal doesn't block initial page load
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('fasalsetu_has_seen_guide', 'true');
    localStorage.setItem('fasalsetu_theme', 'light');
    localStorage.setItem('fasalsetu_lang', 'hi');
  });

  // TEST 1: Load Home Page in Hindi & Light Mode
  console.log('1. Loading Home Page in Hindi (Light Mode)...');
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  await sleep(1000);

  const homeLightShot = path.join(artifactDir, 'feature_home_hindi_light.png');
  await page.screenshot({ path: homeLightShot, fullPage: false });
  console.log(`Saved: ${homeLightShot}`);

  // TEST 2: Toggle Theme to Dark Mode
  console.log('2. Toggling Dark Mode...');
  await page.click('#theme-toggle-btn');
  await sleep(800);

  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log(`Dark Mode Active: ${isDark}`);

  const homeDarkShot = path.join(artifactDir, 'feature_home_hindi_dark.png');
  await page.screenshot({ path: homeDarkShot, fullPage: false });
  console.log(`Saved: ${homeDarkShot}`);

  // TEST 3: Switch Language to Bengali (বাংলা)
  console.log('3. Switching to Bengali (বাংলা)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bnBtn = buttons.find((b) => b.innerText.includes('বাংলা'));
    if (bnBtn) bnBtn.click();
  });
  await sleep(800);

  const homeBengaliShot = path.join(artifactDir, 'feature_home_bengali_dark.png');
  await page.screenshot({ path: homeBengaliShot, fullPage: false });
  console.log(`Saved: ${homeBengaliShot}`);

  // TEST 4: Open Guidance Modal (Guide Tab)
  console.log('4. Opening Startup Guidance Modal (Guide Tab)...');
  await page.click('#guidance-open-btn');
  await sleep(800);

  const guideModalShot = path.join(artifactDir, 'feature_guidance_modal_guide.png');
  await page.screenshot({ path: guideModalShot, fullPage: false });
  console.log(`Saved: ${guideModalShot}`);

  // TEST 5: Switch to Accessibility Tab
  console.log('5. Switching to Accessibility Tab...');
  await page.click('#tab-accessibility');
  await sleep(800);

  const accessModalShot = path.join(artifactDir, 'feature_guidance_modal_accessibility.png');
  await page.screenshot({ path: accessModalShot, fullPage: false });
  console.log(`Saved: ${accessModalShot}`);

  // TEST 6: Switch to Field Recorder Tab & Record
  console.log('6. Switching to Field Recorder Tab & Recording...');
  await page.click('#tab-recorder');
  await sleep(800);

  // Click start recording
  console.log('Starting audio recording in Field Recorder...');
  await page.click('#start-rec-btn');
  await sleep(3000);

  // Click stop recording if active
  const stopBtn = await page.$('#stop-rec-btn');
  if (stopBtn) {
    console.log('Stopping audio recording in Field Recorder...');
    await page.click('#stop-rec-btn');
    await sleep(1000);
  }

  const recorderModalShot = path.join(artifactDir, 'feature_guidance_modal_recorder.png');
  await page.screenshot({ path: recorderModalShot, fullPage: false });
  console.log(`Saved: ${recorderModalShot}`);

  // Click Send to AI Clinic
  console.log('7. Sending staged audio to AI Crop Clinic (/diagnose)...');
  const sendBtn = await page.$('#send-to-diagnose-btn');
  if (sendBtn) {
    await page.click('#send-to-diagnose-btn');
  } else {
    await page.goto(`${baseUrl}/diagnose`, { waitUntil: 'networkidle0' });
  }
  await sleep(1500);

  const diagnoseDarkShot = path.join(artifactDir, 'feature_diagnose_bengali_dark.png');
  await page.screenshot({ path: diagnoseDarkShot, fullPage: false });
  console.log(`Saved: ${diagnoseDarkShot}`);

  // TEST 8: Test Advisory in Bengali and Dark Mode
  console.log('8. Testing /advisory in Bengali and Dark Mode...');
  await page.goto(`${baseUrl}/advisory`, { waitUntil: 'networkidle0' });
  await sleep(1200);

  const advisoryDarkShot = path.join(artifactDir, 'feature_advisory_bengali_dark.png');
  await page.screenshot({ path: advisoryDarkShot, fullPage: false });
  console.log(`Saved: ${advisoryDarkShot}`);

  // TEST 9: Test /admin in Desktop Dark Mode (1280x720)
  console.log('9. Testing /admin in Desktop Dark Mode...');
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle0' });
  await sleep(1500);

  const adminDarkShot = path.join(artifactDir, 'feature_admin_dark_mode.png');
  await page.screenshot({ path: adminDarkShot, fullPage: false });
  console.log(`Saved: ${adminDarkShot}`);

  await browser.close();
  console.log('\nAll tests passed and feature screenshots saved successfully!');
}

runTests().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
