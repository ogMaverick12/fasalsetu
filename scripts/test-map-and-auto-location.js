const puppeteer = require('puppeteer-core');
const path = require('path');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const artifactDir = 'C:/Users/sreej/.gemini/antigravity/brain/c0542fe5-0896-41ff-a236-7ceb4860c809';

  console.log(`Testing Realistic Google Satellite Map & Auto GPS Location on ${baseUrl}...`);

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

  const context = browser.defaultBrowserContext();
  await context.overridePermissions(baseUrl, ['geolocation']);

  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // Pre-seed local storage: dismiss initial guide modal, start with light mode and Hindi
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('fasalsetu_has_seen_guide', 'true');
    localStorage.setItem('fasalsetu_theme', 'light');
    localStorage.setItem('fasalsetu_lang', 'hi');
  });

  // 1. Set simulated Geolocation to Nashik, Maharashtra
  await page.setGeolocation({ latitude: 19.9975, longitude: 73.7898 });

  console.log('1. Loading /advisory with Realistic Map in Light Mode (Hindi)...');
  await page.goto(`${baseUrl}/advisory`, { waitUntil: 'networkidle2' });
  await sleep(1500);

  // Verify Leaflet Map Container loads
  await page.waitForSelector('#realistic-leaflet-map', { timeout: 10000 });
  console.log('Realistic Leaflet Map container rendered successfully!');

  // 2. Click Auto-Detect GPS Button
  console.log('2. Clicking Auto-Detect GPS Button (#auto-detect-gps-btn)...');
  await page.waitForSelector('#auto-detect-gps-btn', { timeout: 5000 });
  await page.click('#auto-detect-gps-btn');
  await sleep(2500);

  // Verify detected location banner
  await page.waitForSelector('#detected-location-banner', { timeout: 5000 });
  const detectedText = await page.$eval('#detected-location-banner', (el) => el.innerText);
  console.log('Detected Location Banner text:', detectedText.replace(/\n+/g, ' '));

  await page.screenshot({
    path: path.join(artifactDir, 'feature_map_gps_detected_light.png'),
  });
  console.log('Saved feature_map_gps_detected_light.png');

  // 3. Test Layer Switching: Switch to Google Roadmap
  console.log('3. Switching to Google Roadmap Layer (#map-layer-road-btn)...');
  const roadBtn = await page.$('#map-layer-road-btn');
  if (roadBtn) {
    await roadBtn.click();
    await sleep(1000);
  }

  // Click on the real Leaflet map
  const mapCanvas = await page.$('#realistic-leaflet-map');
  if (mapCanvas) {
    await mapCanvas.scrollIntoView();
    await sleep(300);
    const box = await mapCanvas.boundingBox();
    if (box) {
      // Click near center
      await page.mouse.click(box.x + box.width * 0.55, box.y + box.height * 0.45);
      await sleep(2000);
    }
  }

  await page.screenshot({
    path: path.join(artifactDir, 'feature_map_clicked_district.png'),
  });
  console.log('Saved feature_map_clicked_district.png');

  // 4. Test 1-Tap Instant Advisory
  console.log('4. Triggering 1-Tap Instant Advisory (#instant-advisory-btn)...');
  await page.waitForSelector('#instant-advisory-btn', { timeout: 5000 });
  await page.click('#instant-advisory-btn');

  // Wait for advisory result cards to appear
  await page.waitForSelector('#reset-advisory-btn', { timeout: 20000 });
  await sleep(1000);

  await page.screenshot({
    path: path.join(artifactDir, 'feature_map_instant_advisory_result.png'),
  });
  console.log('Saved feature_map_instant_advisory_result.png');

  // 5. Test Dark Mode & Bengali with Realistic Satellite Map
  console.log('5. Resetting and switching to Bengali & Forest Midnight Dark Mode...');
  await page.click('#reset-advisory-btn');
  await sleep(1000);

  // Switch to Bengali
  const bnBtn = await page.waitForSelector('#lang-btn-bn', { timeout: 5000 });
  if (bnBtn) await bnBtn.click();
  await sleep(800);

  // Switch to Dark Mode
  const themeBtn = await page.waitForSelector('#theme-toggle-btn', { timeout: 5000 });
  if (themeBtn) await themeBtn.click();
  await sleep(800);

  // Switch back to Satellite
  const satBtn = await page.$('#map-layer-satellite-btn');
  if (satBtn) await satBtn.click();
  await sleep(1200);

  await page.screenshot({
    path: path.join(artifactDir, 'feature_map_bengali_dark.png'),
  });
  console.log('Saved feature_map_bengali_dark.png');

  // 6. Test Manual List Mode
  console.log('6. Switching to Manual List mode tab (#tab-location-manual)...');
  await page.waitForSelector('#tab-location-manual', { timeout: 5000 });
  await page.click('#tab-location-manual');
  await sleep(800);

  await page.screenshot({
    path: path.join(artifactDir, 'feature_advisory_manual_tab.png'),
  });
  console.log('Saved feature_advisory_manual_tab.png');

  await browser.close();
  console.log('All Realistic Map & Accurate Geocoding tests completed successfully!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
