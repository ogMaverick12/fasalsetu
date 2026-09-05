const puppeteer = require('puppeteer-core');
const path = require('path');

async function runAdvisoryE2E() {
  console.log('Launching headless Chrome at 390px viewport for Phase 3 Advisory...');
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

  const baseUrl = process.argv[2] || 'http://localhost:3006';
  const artifactDir = 'C:/Users/sreej/.gemini/antigravity/brain/c0542fe5-0896-41ff-a236-7ceb4860c809';

  // 1. Open /advisory in Hindi
  console.log('1. Loading /advisory form in Hindi...');
  await page.goto(`${baseUrl}/advisory`, { waitUntil: 'networkidle0' });

  const formScreenshot = path.join(artifactDir, 'phase3_advisory_form_390px.png');
  await page.screenshot({ path: formScreenshot, fullPage: false });
  console.log(`Saved Form Screenshot: ${formScreenshot}`);

  // 2. Submit for Nashik, Maharashtra (Tomato)
  console.log('2. Generating advisory for Nashik (Tomato)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const submitBtn = buttons.find(b => b.innerText.includes('सलाह पाएं') || b.innerText.includes('Get Farm Advisory'));
    if (submitBtn) submitBtn.click();
  });

  await page.waitForFunction(
    () => document.body.innerText.includes('वर्तमान मौसम स्थिति') || document.body.innerText.includes('सिंचाई सलाह') || document.body.innerText.includes('समयोचित सलाह'),
    { timeout: 15000 }
  );

  await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));

  const nashikScreenshot = path.join(artifactDir, 'phase3_advisory_nashik_hindi_390px.png');
  await page.screenshot({ path: nashikScreenshot, fullPage: false });
  console.log(`Saved Nashik Advisory Screenshot: ${nashikScreenshot}`);

  // 3. Reset and test West Bengal / Hooghly / Potato in Bengali
  console.log('3. Resetting and testing Hooghly, West Bengal in Bengali...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const resetBtn = buttons.find(b => b.innerText.includes('दूसरे जिले') || b.innerText.includes('Check Another'));
    if (resetBtn) resetBtn.click();
  });

  await page.evaluate(() => new Promise((r) => setTimeout(r, 600)));

  // Switch to Bengali
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bnBtn = buttons.find(b => b.innerText.includes('বাংলা'));
    if (bnBtn) bnBtn.click();
  });

  await page.evaluate(() => new Promise((r) => setTimeout(r, 600)));

  // Select West Bengal in State dropdown, Hooghly in District, Potato in Crop
  const selects = await page.$$('select');
  if (selects.length >= 3) {
    await selects[0].select('West Bengal');
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));

    // Re-query selects in case district options updated
    const updatedSelects = await page.$$('select');
    await updatedSelects[1].select('Hooghly');
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));

    await updatedSelects[2].select('Potato');
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
  }

  // Click Submit
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const submitBtn = buttons.find(b => b.innerText.includes('পরামর্শ') || b.innerText.includes('Get Farm Advisory'));
    if (submitBtn) submitBtn.click();
  });

  await page.waitForFunction(
    () => document.body.innerText.includes('বর্তমান আবহাওয়া') || document.body.innerText.includes('সেচ পরামর্শ') || document.body.innerText.includes('প্রয়োজনীয় পরামর্শ'),
    { timeout: 15000 }
  );

  await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));

  const hooghlyScreenshot = path.join(artifactDir, 'phase3_advisory_hooghly_bengali_390px.png');
  await page.screenshot({ path: hooghlyScreenshot, fullPage: false });
  console.log(`Saved Hooghly Advisory Screenshot: ${hooghlyScreenshot}`);

  await browser.close();
  console.log('Phase 3 Advisory E2E tests completed successfully!');
}

runAdvisoryE2E().catch((err) => {
  console.error('Advisory E2E Error:', err);
  process.exit(1);
});
