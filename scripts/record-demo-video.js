const puppeteer = require('puppeteer-core');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const ffmpeg = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const cp = require('child_process');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function recordDemo() {
  const baseUrl = process.argv[2] || 'https://fasalsetu-theta.vercel.app';
  const artifactDir = 'C:/Users/sreej/.gemini/antigravity/brain/c0542fe5-0896-41ff-a236-7ceb4860c809';
  const finalVideoPath = path.join(artifactDir, 'fasalsetu_demo_walkthrough.mp4');

  const mobileRaw = path.join(__dirname, 'mobile_raw.mp4');
  const mobilePadded = path.join(__dirname, 'mobile_padded.mp4');
  const desktopRaw = path.join(__dirname, 'desktop_raw.mp4');
  const desktopReady = path.join(__dirname, 'desktop_ready.mp4');
  const concatList = path.join(__dirname, 'concat_list.txt');

  console.log(`Starting FasalSetu Demo Video Recording against ${baseUrl}...`);
  console.log(`Using ffmpeg at: ${ffmpeg}`);

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

  // ==========================================
  // PART A: MOBILE VIEWPORT (Scenes 1, 2, 3)
  // Target: ~130 seconds
  // ==========================================
  console.log('\n--- PART A: Mobile Viewport (390x844) ---');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const mobileRecorder = new PuppeteerScreenRecorder(mobilePage, {
    ffmpeg_Path: ffmpeg,
    fps: 25,
    videoFrame: { width: 390, height: 844 },
  });

  await mobileRecorder.start(mobileRaw);
  console.log('Mobile recorder started.');

  // SCENE 1: Landing Page & Core Photo Diagnosis
  console.log('Scene 1: Loading Landing Page (/) ...');
  await mobilePage.goto(baseUrl, { waitUntil: 'networkidle0' });
  await sleep(8000);

  console.log('Scene 1: Navigating to /diagnose ...');
  await mobilePage.click('a[href="/diagnose"]');
  await mobilePage.waitForNavigation({ waitUntil: 'networkidle0' });
  await sleep(4000);

  console.log('Scene 1: Setting language to Hindi (हिन्दी)...');
  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const hiBtn = buttons.find((b) => b.innerText.includes('हिन्दी'));
    if (hiBtn) hiBtn.click();
  });
  await sleep(3000);

  console.log('Scene 1: Uploading tomato early blight test image...');
  const testImagePath = path.join(__dirname, '..', 'test-assets', 'tomato_early_blight.jpg');
  const fileInput = await mobilePage.$('input[type="file"]');
  if (fileInput) {
    await fileInput.uploadFile(testImagePath);
  }

  console.log('Scene 1: Waiting for AI multimodal diagnosis results...');
  try {
    await mobilePage.waitForFunction(
      () =>
        document.body.innerText.includes('समाधान') ||
        document.body.innerText.includes('टमाटर') ||
        document.body.innerText.includes('झुलसा') ||
        document.body.innerText.includes('लक्षण'),
      { timeout: 25000 }
    );
    console.log('Scene 1: Diagnosis rendered successfully.');
  } catch (err) {
    console.warn('Diagnosis timeout or already displayed:', err.message);
  }

  // Allow viewer to inspect clinical result, treatment protocol, and spoken audio (20s)
  console.log('Scene 1: Inspecting clinical diagnosis and treatment plan (20s)...');
  await sleep(20000);

  // Click check another crop to demonstrate reset
  console.log('Scene 1: Resetting for next workflow...');
  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const resetBtn = buttons.find((b) => b.innerText.includes('दूसरी फसल') || b.innerText.includes('Check Another'));
    if (resetBtn) resetBtn.click();
  });
  await sleep(4000);

  // SCENE 2: Native Voice Layer & Multilingual Bengali Flow
  console.log('\nScene 2: Switching to Bengali (বাংলা)...');
  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bnBtn = buttons.find((b) => b.innerText.includes('বাংলা'));
    if (bnBtn) bnBtn.click();
  });
  await sleep(4000);

  console.log('Scene 2: Switching to Voice Tab (আওয়াজে বলুন)...');
  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const voiceTab = buttons.find((b) => b.innerText.includes('আওয়াজ') || b.innerText.includes('মুখে'));
    if (voiceTab) voiceTab.click();
  });
  await sleep(5000);

  console.log('Scene 2: Starting voice note recording...');
  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const micBtn = buttons.find((b) => b.innerText.includes('মুখে বলে জানান') || b.innerText.includes('বলুন'));
    if (micBtn) micBtn.click();
  });

  // Recording waveform in action (6s)
  console.log('Scene 2: Recording audio note (6s)...');
  await sleep(6000);

  console.log('Scene 2: Stopping voice note recording...');
  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const stopBtn = buttons.find((b) => b.innerText.includes('সমাপ্ত') || b.innerText.includes('Finish'));
    if (stopBtn) stopBtn.click();
  });

  console.log('Scene 2: Waiting for Gemini native audio diagnosis...');
  try {
    await mobilePage.waitForFunction(
      () =>
        document.body.innerText.includes('প্রতিকার') ||
        document.body.innerText.includes('টমেটো') ||
        document.body.innerText.includes('রোগের লক্ষণ') ||
        document.body.innerText.includes('পরামর্শ') ||
        document.body.innerText.includes('সুস্থ'),
      { timeout: 25000 }
    );
    console.log('Scene 2: Bengali diagnosis arrived successfully.');
  } catch (err) {
    console.warn('Voice diagnosis wait completed:', err.message);
  }

  // Allow viewer to inspect Bengali output and spoken replay (20s)
  console.log('Scene 2: Inspecting Bengali output and voice response (20s)...');
  await sleep(20000);

  // SCENE 3: Hyperlocal Advisory Progressive Disclosure (/advisory)
  console.log('\nScene 3: Navigating to /advisory ...');
  await mobilePage.goto(`${baseUrl}/advisory`, { waitUntil: 'networkidle0' });
  await sleep(4000);

  console.log('Scene 3: Selecting Hindi language...');
  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const hiBtn = buttons.find((b) => b.innerText.includes('हिन्दी'));
    if (hiBtn) hiBtn.click();
  });
  await sleep(3000);

  console.log('Scene 3: Step 1 - Selecting State: Maharashtra...');
  const stateSelect = await mobilePage.$('select');
  if (stateSelect) {
    await stateSelect.select('Maharashtra');
  }
  await sleep(4000);

  console.log('Scene 3: Clicking Next to proceed to District...');
  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const nextBtn = buttons.find((b) => b.innerText.includes('आगे बढ़ें') || b.innerText.includes('Next'));
    if (nextBtn) nextBtn.click();
  });
  await sleep(4000);

  console.log('Scene 3: Step 2 - Selecting District: Nashik...');
  const districtSelect = await mobilePage.$('select');
  if (districtSelect) {
    await districtSelect.select('Nashik');
  }
  await sleep(4000);

  console.log('Scene 3: Clicking Next to proceed to Crop...');
  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const nextBtn = buttons.find((b) => b.innerText.includes('आगे बढ़ें') || b.innerText.includes('Next'));
    if (nextBtn) nextBtn.click();
  });
  await sleep(4000);

  console.log('Scene 3: Step 3 - Selecting Crop: Tomato...');
  const cropSelect = await mobilePage.$('select');
  if (cropSelect) {
    await cropSelect.select('Tomato');
  }
  await sleep(3000);

  console.log('Scene 3: Submitting Advisory request...');
  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const submitBtn = buttons.find(
      (b) => b.innerText.includes('सलाह') || b.innerText.includes('Get Farm Advisory')
    );
    if (submitBtn) submitBtn.click();
  });

  console.log('Scene 3: Waiting for Open-Meteo & Gemini advisory results...');
  try {
    await mobilePage.waitForFunction(
      () =>
        document.body.innerText.includes('वर्तमान मौसम स्थिति') ||
        document.body.innerText.includes('सिंचाई सलाह') ||
        document.body.innerText.includes('समयोचित सलाह'),
      { timeout: 25000 }
    );
    console.log('Scene 3: Advisory received.');
  } catch (err) {
    console.warn('Advisory wait completed:', err.message);
  }

  // Allow viewer to inspect weather cards and agronomic advice (22s)
  console.log('Scene 3: Inspecting Open-Meteo weather cards & Gemini advisory (22s)...');
  await sleep(22000);

  console.log('Stopping mobile recorder...');
  await mobileRecorder.stop();
  await mobilePage.close();
  console.log('Part A recording complete.');

  // ==========================================
  // PART B: DESKTOP VIEWPORT (Scene 4)
  // Target: ~84 seconds
  // ==========================================
  console.log('\n--- PART B: Desktop Viewport (1280x720) ---');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({
    width: 1280,
    height: 720,
    deviceScaleFactor: 2,
  });

  const desktopRecorder = new PuppeteerScreenRecorder(desktopPage, {
    ffmpeg_Path: ffmpeg,
    fps: 25,
    videoFrame: { width: 1280, height: 720 },
  });

  await desktopRecorder.start(desktopRaw);
  console.log('Desktop recorder started.');

  console.log('Scene 4: Loading /admin dashboard...');
  await desktopPage.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle0' });

  try {
    await desktopPage.waitForFunction(
      () =>
        document.body.innerText.includes('State-by-State Diagnosis Volume') &&
        document.body.innerText.includes('Maharashtra'),
      { timeout: 25000 }
    );
    console.log('Scene 4: Admin data rendered.');
  } catch (err) {
    console.warn('Admin page loaded with content:', err.message);
  }

  // Inspect nationwide KPIs & State distribution (16s)
  console.log('Scene 4: Inspecting National Scale KPI cards & State distribution (16s)...');
  await sleep(16000);

  // Scroll down to Pathogen Surveillance & Disease Breakdown (14s)
  console.log('Scene 4: Scrolling to National Pathogen Surveillance & Disease Breakdown...');
  await desktopPage.evaluate(() => {
    window.scrollBy({ top: 320, behavior: 'smooth' });
  });
  await sleep(14000);

  // Scroll down to records table
  console.log('Scene 4: Scrolling to Telemetry & Records Log...');
  await desktopPage.evaluate(() => {
    window.scrollBy({ top: 380, behavior: 'smooth' });
  });
  await sleep(4000);

  // Filter by Punjab (12s)
  console.log('Scene 4: Filtering surveillance by Punjab (12s)...');
  await desktopPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const punjabBtn = buttons.find((b) => b.innerText.includes('Punjab'));
    if (punjabBtn) punjabBtn.click();
  });
  await sleep(12000);

  // Inspect Case File modal (16s)
  console.log('Scene 4: Opening Deep-Dive Case File Inspection modal...');
  await desktopPage.waitForSelector('tbody tr button');
  await desktopPage.click('tbody tr button');
  await sleep(16000);

  // Close Case File modal
  console.log('Scene 4: Closing Case File modal...');
  await desktopPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const closeBtn = buttons.find((b) => b.innerText.includes('Close') || b.innerText.includes('×'));
    if (closeBtn) closeBtn.click();
  });
  await sleep(4000);

  // Reset filter to All States (14s)
  console.log('Scene 4: Resetting filter to All States...');
  await desktopPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const allBtn = buttons.find((b) => b.innerText.includes('All States'));
    if (allBtn) allBtn.click();
  });
  await sleep(14000);

  console.log('Stopping desktop recorder...');
  await desktopRecorder.stop();
  await desktopPage.close();
  await browser.close();
  console.log('Part B recording complete.');

  // ==========================================
  // PART C: VIDEO COMPOSITING WITH FFMPEG
  // ==========================================
  console.log('\n--- PART C: Assembling Unified 1280x720 MP4 via FFmpeg ---');

  // 1. Pad mobile raw to 1280x720 centered with brand emerald/slate background (0x091b15)
  // Mobile width in 720 height: 390 * 720 / 844 = 332
  console.log('Step C.1: Scaling & padding mobile recording to 1280x720...');
  const padCmd = cp.spawnSync(ffmpeg, [
    '-y',
    '-i',
    mobileRaw,
    '-vf',
    'scale=332:720,pad=1280:720:(1280-332)/2:0:color=0x091b15',
    '-r',
    '25',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    mobilePadded,
  ]);
  if (padCmd.status !== 0) {
    console.error('Pad command error:', padCmd.stderr.toString());
  } else {
    console.log('Mobile video padded successfully.');
  }

  // 2. Re-encode desktop video to 1280x720 with matching codec/params
  console.log('Step C.2: Re-encoding desktop recording to matching 1280x720 stream...');
  const deskCmd = cp.spawnSync(ffmpeg, [
    '-y',
    '-i',
    desktopRaw,
    '-vf',
    'scale=1280:720',
    '-r',
    '25',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    desktopReady,
  ]);
  if (deskCmd.status !== 0) {
    console.error('Desktop re-encode error:', deskCmd.stderr.toString());
  } else {
    console.log('Desktop video re-encoded successfully.');
  }

  // 3. Concatenate mobile and desktop into final walkthrough video
  console.log('Step C.3: Concatenating scenes into final walkthrough MP4...');
  const concatContent = `file '${mobilePadded.replace(/\\/g, '/')}'\nfile '${desktopReady.replace(/\\/g, '/')}'\n`;
  fs.writeFileSync(concatList, concatContent, 'utf-8');

  const concatCmd = cp.spawnSync(ffmpeg, [
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    concatList,
    '-c',
    'copy',
    finalVideoPath,
  ]);

  if (concatCmd.status !== 0) {
    console.error('Concat command error:', concatCmd.stderr.toString());
  } else {
    console.log(`Final video generated at: ${finalVideoPath}`);
  }

  // Check file stats and duration
  if (fs.existsSync(finalVideoPath)) {
    const stats = fs.statSync(finalVideoPath);
    console.log(`File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

    const probe = cp.spawnSync(ffmpeg, ['-i', finalVideoPath]);
    const probeOutput = probe.stderr.toString();
    const durationMatch = probeOutput.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    if (durationMatch) {
      const minutes = parseInt(durationMatch[2], 10);
      const seconds = parseFloat(durationMatch[3]);
      const totalSec = minutes * 60 + seconds;
      console.log(`Duration: ${durationMatch[1]}:${durationMatch[2]}:${durationMatch[3]} (${totalSec.toFixed(1)} seconds)`);
    }
  }

  // Clean up intermediate files
  console.log('Cleaning up temporary recordings...');
  [mobileRaw, mobilePadded, desktopRaw, desktopReady, concatList].forEach((file) => {
    try {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    } catch (e) {
      // ignore
    }
  });

  console.log('\nDemo recording process finished successfully!');
}

recordDemo().catch((err) => {
  console.error('Fatal demo recording error:', err);
  process.exit(1);
});
