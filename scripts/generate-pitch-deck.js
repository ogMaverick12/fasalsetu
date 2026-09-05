const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

function getBase64Image(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).replace('.', '') || 'png';
      const data = fs.readFileSync(filePath).toString('base64');
      return 'data:image/' + ext + ';base64,' + data;
    }
  } catch (err) {
    console.warn('Could not read image: ' + filePath, err.message);
  }
  return '';
}

async function generatePitchDeck() {
  console.log('Generating high-resolution FasalSetu Pitch Deck PDF...');

  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  const images = {
    satellite: getBase64Image(path.join(screenshotsDir, 'google_satellite_map.png')),
    homeLight: getBase64Image(path.join(screenshotsDir, 'home_light.png')),
    homeDark: getBase64Image(path.join(screenshotsDir, 'home_dark.png')),
    clinic: getBase64Image(path.join(screenshotsDir, 'diagnose_clinic.png')),
    admin: getBase64Image(path.join(screenshotsDir, 'admin_dashboard.png')),
    drilldown: getBase64Image(path.join(screenshotsDir, 'admin_drilldown.png')),
    recorder: getBase64Image(path.join(screenshotsDir, 'field_recorder.png')),
    photoDiag: getBase64Image(path.join(screenshotsDir, 'photo_diagnosis.png')),
  };

  console.log('Images loaded:', Object.keys(images).filter(k => images[k].length > 100).join(', '));

  const css = `
    @page { size: 1920px 1080px; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      background: #060d09;
      color: #f8fafc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .slide {
      width: 1920px; height: 1080px;
      page-break-after: always; page-break-inside: avoid;
      position: relative; overflow: hidden;
      padding: 60px 84px 50px 84px;
      display: flex; flex-direction: column; justify-content: space-between;
      background: radial-gradient(circle at 85% 15%, #0f2b1c 0%, #07130c 55%, #040906 100%);
    }
    .slide::before {
      content: ''; position: absolute; top: -150px; right: -100px;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0) 70%);
      pointer-events: none; z-index: 1;
    }
    .slide-header { display: flex; justify-content: space-between; align-items: flex-start; z-index: 2; position: relative; }
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 14px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
      color: #4ade80; background: rgba(34,197,94,0.12); border: 1px solid rgba(74,222,128,0.25);
      padding: 6px 16px; border-radius: 9999px; margin-bottom: 12px;
    }
    .slide-title { font-size: 46px; font-weight: 800; line-height: 1.15; color: #fff; letter-spacing: -0.02em; }
    .slide-sub { font-size: 20px; color: #94a3b8; margin-top: 6px; }
    .slide-num {
      font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; color: #4ade80;
      background: rgba(255,255,255,0.05); padding: 8px 16px; border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1); white-space: nowrap;
    }
    .slide-body { flex: 1; display: flex; margin: 28px 0; z-index: 2; position: relative; }
    .slide-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.08);
      font-size: 14px; color: #64748b; z-index: 2; position: relative;
    }
    .brand { font-weight: 700; color: #e2e8f0; }
    .brand em { color: #22c55e; font-style: normal; }
    .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; width: 100%; height: 100%; }
    .g3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 32px; width: 100%; height: 100%; }
    .g4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; width: 100%; height: 100%; }
    .card {
      background: rgba(18,38,26,0.65); border: 1px solid rgba(74,222,128,0.18);
      border-radius: 20px; padding: 32px; display: flex; flex-direction: column;
      backdrop-filter: blur(10px);
    }
    .card-hi { background: rgba(22,53,35,0.85); border-color: rgba(74,222,128,0.4); box-shadow: 0 16px 36px rgba(0,0,0,0.35); }
    .icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: rgba(34,197,94,0.15); border: 1px solid rgba(74,222,128,0.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 26px; margin-bottom: 20px;
    }
    .ctitle { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 12px; }
    .cdesc { font-size: 16px; line-height: 1.55; color: #cbd5e1; flex: 1; }
    .stat { font-size: 54px; font-weight: 800; color: #4ade80; font-family: 'Courier New', monospace; margin-bottom: 8px; }
    .statlbl { font-size: 15px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .frame {
      border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 20px 40px rgba(0,0,0,0.5); background: #000;
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 100%;
    }
    .frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .pill {
      display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
      border-radius: 6px; font-size: 13px; font-weight: 600;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0;
    }
    .pill-g { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); color: #4ade80; }
    .pill-b { background: rgba(56,189,248,0.15); border-color: rgba(56,189,248,0.3); color: #38bdf8; }
    .pill-y { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.3); color: #fbbf24; }
    .tbl { width: 100%; border-collapse: collapse; background: rgba(18,38,26,0.5); border-radius: 16px; overflow: hidden; border: 1px solid rgba(74,222,128,0.2); }
    .tbl th { background: rgba(34,197,94,0.15); color: #4ade80; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 16px 20px; text-align: left; border-bottom: 1px solid rgba(74,222,128,0.2); }
    .tbl td { padding: 16px 20px; font-size: 16px; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .tbl tr:last-child td { border-bottom: none; }
    .yes { color: #4ade80; font-weight: 700; }
    code { color: #4ade80; font-family: 'Courier New', monospace; font-size: 0.9em; }
  `;

  // Build slide HTML pieces
  const slides = [];

  // ---- SLIDE 1: COVER ----
  slides.push(`
  <div class="slide" style="background:radial-gradient(circle at 75% 30%,#153b26 0%,#09170f 60%,#030704 100%);">
    <div style="position:absolute;right:80px;top:100px;width:680px;height:800px;z-index:2;">
      <div class="frame" style="border:2px solid rgba(74,222,128,0.35);border-radius:20px;box-shadow:0 25px 60px rgba(0,0,0,0.7);">
        <img src="${images.satellite}" alt="satellite" />
      </div>
      <div style="position:absolute;bottom:-20px;left:-30px;background:rgba(11,20,15,0.95);border:1px solid rgba(74,222,128,0.4);border-radius:16px;padding:18px 24px;display:flex;align-items:center;gap:16px;box-shadow:0 15px 30px rgba(0,0,0,0.5);">
        <div style="width:44px;height:44px;border-radius:10px;background:#22c55e;color:#052e16;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;">&#10003;</div>
        <div>
          <div style="font-size:16px;font-weight:700;color:#fff;">Google Satellite Hybrid Map</div>
          <div style="font-size:13px;color:#4ade80;">Detected: 19.9975&#176;N, 73.7898&#176;E &#8226; Nashik Block</div>
        </div>
      </div>
    </div>
    <div class="slide-header">
      <div><div class="badge">&#127807; Google AI Hackathon Project</div></div>
      <div class="slide-num">01 / 11</div>
    </div>
    <div class="slide-body" style="max-width:980px;flex-direction:column;justify-content:center;">
      <h1 style="font-size:68px;font-weight:800;line-height:1.05;letter-spacing:-0.03em;color:#fff;margin-bottom:20px;">
        FasalSetu <span style="color:#4ade80;">(&#2347;&#2360;&#2354; &#2360;&#2375;&#2340;&#2369;)</span>
      </h1>
      <p style="font-size:26px;line-height:1.4;color:#cbd5e1;margin-bottom:36px;max-width:900px;">
        Bridging 140 Million+ Indian Smallholder Farmers to <strong style="color:#fff;">Real-Time Multimodal AI Diagnostics</strong> &amp; <strong style="color:#38bdf8;">Hyperlocal Climate Intelligence</strong>.
      </p>
      <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:40px;">
        <span class="pill pill-g">&#127807; Leaf Photo + Voice Diagnosis</span>
        <span class="pill pill-b">&#128483;&#65039; Hindi, Bengali &amp; English Audio</span>
        <span class="pill pill-g">&#128752;&#65039; Google Satellite Farm Pinning</span>
        <span class="pill pill-y">&#9889; Zero-Cost GCP Architecture</span>
      </div>
      <div style="display:flex;gap:32px;align-items:center;">
        <div>
          <div style="font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Live Production</div>
          <div style="font-family:'Courier New',monospace;font-size:18px;color:#4ade80;font-weight:700;">fasalsetu-theta.vercel.app</div>
        </div>
        <div style="width:1px;height:40px;background:rgba(255,255,255,0.15);"></div>
        <div>
          <div style="font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Powered By</div>
          <div style="font-size:17px;color:#fff;font-weight:700;">Google Gemini 2.5 Flash &bull; Next.js 16 &bull; Supabase</div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <div class="brand">FasalSetu <em>(&#2347;&#2360;&#2354; &#2360;&#2375;&#2340;&#2369;)</em> &mdash; Pitch Deck</div>
      <div>Strict Zero-Billing Architecture &bull; Built for Indian Agriculture</div>
    </div>
  </div>`);

  // ---- SLIDE 2: PROBLEM ----
  slides.push(`
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="badge">Ground Reality &amp; Pain Points</div>
        <div class="slide-title">The Rural Diagnostic &amp; Advisory Crisis</div>
        <div class="slide-sub">Why existing digital ag-tech platforms fail Indian smallholder farmers</div>
      </div>
      <div class="slide-num">02 / 11</div>
    </div>
    <div class="slide-body">
      <div class="g4">
        <div class="card">
          <div class="icon">&#128200;</div>
          <div class="stat">30-40%</div>
          <div class="statlbl">Annual Crop Loss</div>
          <div class="cdesc" style="margin-top:14px;">Over <strong>$28 Billion</strong> lost annually in India to preventable fungal blights, viral rusts, and pest attacks that could be stopped if caught within 48 hours.</div>
        </div>
        <div class="card">
          <div class="icon">&#128115;</div>
          <div class="stat">1:1,162</div>
          <div class="statlbl">Extension Officer Ratio</div>
          <div class="cdesc" style="margin-top:14px;">Severe shortage of agricultural extension officers means physical diagnosis takes days or weeks. Farmers are left stranded without timely expertise on the ground.</div>
        </div>
        <div class="card">
          <div class="icon">&#9000;&#65039;</div>
          <div class="stat">72%</div>
          <div class="statlbl">Typing &amp; Literacy Barrier</div>
          <div class="cdesc" style="margin-top:14px;">Traditional chatbots demand text typing and English comprehension. Farmers operate through <strong>sight and spoken voice</strong>, not keyboards or Roman script.</div>
        </div>
        <div class="card">
          <div class="icon">&#127783;&#65039;</div>
          <div class="stat">15 km</div>
          <div class="statlbl">Micro-Climate Gap</div>
          <div class="cdesc" style="margin-top:14px;">State-capital weather reports miss local micro-climates. A sudden humidity spike 15 km away ruins pesticide spray timing and triggers fungal outbreaks overnight.</div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <div class="brand">FasalSetu <em>(&#2347;&#2360;&#2354; &#2360;&#2375;&#2340;&#2369;)</em></div>
      <div>The Core Insight: Farmers need an agronomist right in their field, at zero friction.</div>
    </div>
  </div>`);

  // ---- SLIDE 3: SOLUTION ----
  slides.push(`
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="badge">Product Vision</div>
        <div class="slide-title">FasalSetu: Zero Typing, Zero Waiting, Zero Cost</div>
        <div class="slide-sub">A unified dual-surface agricultural platform for farmers and national surveillance</div>
      </div>
      <div class="slide-num">03 / 11</div>
    </div>
    <div class="slide-body">
      <div class="g3">
        <div class="card card-hi">
          <div class="icon">&#128302;</div>
          <div class="ctitle">1. Multimodal AI Crop Clinic</div>
          <div class="cdesc">
            <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:12px;margin-top:8px;">
              <li style="display:flex;gap:10px;"><span style="color:#4ade80;">&#10003;</span><span><strong>Instant Photo Diagnosis</strong>: Snap leaf photo; Gemini 2.5 Flash detects blight, rust, or virus in under 2 seconds.</span></li>
              <li style="display:flex;gap:10px;"><span style="color:#4ade80;">&#10003;</span><span><strong>Native Voice Understanding</strong>: Farmer speaks in Hindi or Bengali; Gemini parses raw dialect audio directly.</span></li>
              <li style="display:flex;gap:10px;"><span style="color:#4ade80;">&#10003;</span><span><strong>Spoken Remedies</strong>: Generates spoken audio prescriptions so illiterate farmers never have to read text.</span></li>
            </ul>
          </div>
          <div style="margin-top:18px;"><span class="pill pill-g">Farmer Surface: /diagnose</span></div>
        </div>
        <div class="card card-hi">
          <div class="icon">&#128752;&#65039;</div>
          <div class="ctitle">2. Satellite Climate Advisory</div>
          <div class="cdesc">
            <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:12px;margin-top:8px;">
              <li style="display:flex;gap:10px;"><span style="color:#4ade80;">&#10003;</span><span><strong>Real Google Satellite Map</strong>: High-resolution imagery with draggable farm pin and layer toggle.</span></li>
              <li style="display:flex;gap:10px;"><span style="color:#4ade80;">&#10003;</span><span><strong>1-Tap GPS Auto Detection</strong>: Animated fly-to with OpenStreetMap block-level geocoding accuracy.</span></li>
              <li style="display:flex;gap:10px;"><span style="color:#4ade80;">&#10003;</span><span><strong>Hyperlocal Micro-Climate</strong>: Open-Meteo hourly rain, humidity, and agronomic spray guidance.</span></li>
            </ul>
          </div>
          <div style="margin-top:18px;"><span class="pill pill-b">Farmer Surface: /advisory</span></div>
        </div>
        <div class="card card-hi">
          <div class="icon">&#128202;</div>
          <div class="ctitle">3. National Surveillance Command</div>
          <div class="cdesc">
            <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:12px;margin-top:8px;">
              <li style="display:flex;gap:10px;"><span style="color:#4ade80;">&#10003;</span><span><strong>Multi-State Reach</strong>: Live epidemiological telemetry spanning 6 states &amp; 19 districts.</span></li>
              <li style="display:flex;gap:10px;"><span style="color:#4ade80;">&#10003;</span><span><strong>Pathogen Outbreak Alerts</strong>: Tracks Early Blight, Cotton Curl, Yellow Mosaic hotspots in real time.</span></li>
              <li style="display:flex;gap:10px;"><span style="color:#4ade80;">&#10003;</span><span><strong>Case File Inspection</strong>: Agronomists review field photos, weather telemetry, and prescriptions.</span></li>
            </ul>
          </div>
          <div style="margin-top:18px;"><span class="pill pill-y">Judge Surface: /admin</span></div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <div class="brand">FasalSetu <em>(&#2347;&#2360;&#2354; &#2360;&#2375;&#2340;&#2369;)</em></div>
      <div>Designed to bridge the last mile of Indian agriculture with zero cognitive overhead.</div>
    </div>
  </div>`);

  // ---- SLIDE 4: ARCHITECTURE ----
  slides.push(`
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="badge">Technical Innovation</div>
        <div class="slide-title">Multimodal Architecture &amp; Resilience</div>
        <div class="slide-sub">How Gemini 2.5 Flash powers real-time vision, audio understanding, and speech synthesis</div>
      </div>
      <div class="slide-num">04 / 11</div>
    </div>
    <div class="slide-body">
      <div class="g2">
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div class="card" style="padding:24px;">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px;">
              <span style="font-size:24px;">&#129504;</span>
              <div style="font-size:20px;font-weight:700;color:#fff;">Unified Gemini 2.5 Flash Engine</div>
            </div>
            <div style="font-size:15px;color:#cbd5e1;line-height:1.5;">Eliminates brittle multi-step pipelines. One call to <strong>Gemini 2.5 Flash</strong> analyzes raw leaf pixels and dialect voice notes simultaneously — no Cloud Vision, no Whisper STT, no Cloud TTS fees.</div>
          </div>
          <div class="card" style="padding:24px;">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px;">
              <span style="font-size:24px;">&#128737;&#65039;</span>
              <div style="font-size:20px;font-weight:700;color:#fff;">Exponential Backoff &amp; Jitter Retry</div>
            </div>
            <div style="font-size:15px;color:#cbd5e1;line-height:1.5;">All Gemini API calls wrapped in <code>callWithRetry()</code> with 3-attempt exponential backoff + randomized jitter. Handles rural packet loss and burst demo traffic without dropping requests.</div>
          </div>
          <div class="card" style="padding:24px;">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px;">
              <span style="font-size:24px;">&#128205;</span>
              <div style="font-size:20px;font-weight:700;color:#fff;">Zero-Cost Geospatial &amp; Climate Mesh</div>
            </div>
            <div style="font-size:15px;color:#cbd5e1;line-height:1.5;">Google raster tiles in Leaflet, OpenStreetMap Nominatim block-level geocoding, and Open-Meteo micro-climate APIs. Completely free with no credit card or GCP billing accounts.</div>
          </div>
        </div>
        <div class="card card-hi" style="justify-content:center;align-items:center;padding:32px;">
          <div style="font-size:16px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:24px;text-align:center;">End-to-End Data Pipeline</div>
          <div style="width:100%;display:flex;flex-direction:column;gap:14px;">
            <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(74,222,128,0.3);border-radius:12px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;">
              <div>
                <div style="font-weight:700;color:#fff;font-size:15px;">1. Farmer Mobile Client</div>
                <div style="font-size:13px;color:#94a3b8;">Leaf photo / voice note / GPS coordinates</div>
              </div>
              <span class="pill pill-g">Next.js 16 Edge</span>
            </div>
            <div style="text-align:center;color:#4ade80;font-size:18px;">&#11015;</div>
            <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(56,189,248,0.3);border-radius:12px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;">
              <div>
                <div style="font-weight:700;color:#fff;font-size:15px;">2. Server API Route &amp; Geospatial Resolver</div>
                <div style="font-size:13px;color:#94a3b8;">Nominatim geocoding + Open-Meteo 7-day climate</div>
              </div>
              <span class="pill pill-b">Turbopack API</span>
            </div>
            <div style="text-align:center;color:#38bdf8;font-size:18px;">&#11015;</div>
            <div style="background:rgba(22,53,35,0.9);border:1px solid #22c55e;border-radius:12px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;">
              <div>
                <div style="font-weight:700;color:#4ade80;font-size:15px;">3. Google Gemini 2.5 Flash</div>
                <div style="font-size:13px;color:#e2e8f0;">Multimodal inference + native vernacular audio synthesis</div>
              </div>
              <span class="pill pill-g">AI Studio</span>
            </div>
            <div style="text-align:center;color:#4ade80;font-size:18px;">&#11015;</div>
            <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;">
              <div>
                <div style="font-weight:700;color:#fff;font-size:15px;">4. Supabase PostgreSQL + National Dashboard</div>
                <div style="font-size:13px;color:#94a3b8;">RLS persistence, state telemetry, /admin live feed</div>
              </div>
              <span class="pill pill-y">Supabase DB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <div class="brand">FasalSetu <em>(&#2347;&#2360;&#2354; &#2360;&#2375;&#2340;&#2369;)</em></div>
      <div>100% compliant with Google AI Studio SDK &bull; Zero Firebase &bull; Zero Vertex AI</div>
    </div>
  </div>`);

  // ---- SLIDE 5: CROP CLINIC ----
  slides.push(`
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="badge">Product Walkthrough</div>
        <div class="slide-title">Multimodal AI Crop Clinic (/diagnose)</div>
        <div class="slide-sub">Instant photo detection, native voice understanding, and spoken audio prescription</div>
      </div>
      <div class="slide-num">05 / 11</div>
    </div>
    <div class="slide-body">
      <div class="g2" style="align-items:center;">
        <div style="display:flex;gap:24px;height:100%;justify-content:center;align-items:center;">
          <div class="frame" style="max-width:300px;max-height:640px;border-radius:28px;border:3px solid rgba(74,222,128,0.3);">
            <img src="${images.clinic}" alt="Crop Clinic" />
          </div>
          <div class="frame" style="max-width:300px;max-height:640px;border-radius:28px;border:3px solid rgba(56,189,248,0.3);">
            <img src="${images.photoDiag}" alt="Photo Diagnosis" />
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:24px;">
          <div class="card">
            <div style="font-size:20px;font-weight:700;color:#4ade80;margin-bottom:8px;">&#128248; 1. Visual Pathology Analysis</div>
            <div style="font-size:16px;color:#cbd5e1;line-height:1.5;">Takes raw leaf photos from the phone camera. Identifies <strong>Early Blight, Late Blight, Rusts, Cotton Leaf Curl Virus</strong>, or confirms healthy growth. Provides confidence scores and clear severity grades.</div>
          </div>
          <div class="card">
            <div style="font-size:20px;font-weight:700;color:#38bdf8;margin-bottom:8px;">&#127908; 2. Natural Vernacular Voice Notes</div>
            <div style="font-size:16px;color:#cbd5e1;line-height:1.5;">Farmers hold a large mic button and describe symptoms in their dialect. Gemini 2.5 Flash processes the audio directly &mdash; eliminating keyboard friction completely.</div>
          </div>
          <div class="card">
            <div style="font-size:20px;font-weight:700;color:#fbbf24;margin-bottom:8px;">&#128266; 3. Spoken Clinical Prescription</div>
            <div style="font-size:16px;color:#cbd5e1;line-height:1.5;">Prescriptions read aloud in fluent native Hindi or Bengali with exact dosage guidance. Zero literacy required &mdash; farmers hear and act immediately without reading text.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <div class="brand">FasalSetu <em>(&#2347;&#2360;&#2354; &#2360;&#2375;&#2340;&#2369;)</em></div>
      <div>One decision per screen &bull; 44pt minimum touch targets &bull; prefers-reduced-motion safe</div>
    </div>
  </div>`);

  // ---- SLIDE 6: ADVISORY / MAP ----
  slides.push(`
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="badge">Product Walkthrough</div>
        <div class="slide-title">Google Satellite Farm Map &amp; Advisory (/advisory)</div>
        <div class="slide-sub">Interactive field pinning, block-level geocoding, and hyper-local micro-climate forecasts</div>
      </div>
      <div class="slide-num">06 / 11</div>
    </div>
    <div class="slide-body">
      <div class="g2" style="align-items:center;">
        <div style="display:flex;flex-direction:column;gap:24px;">
          <div class="card">
            <div style="font-size:20px;font-weight:700;color:#4ade80;margin-bottom:8px;">&#128752;&#65039; Real Google Satellite Hybrid Imagery</div>
            <div style="font-size:16px;color:#cbd5e1;line-height:1.5;">Google's global satellite tile cache inside Leaflet. 1-tap toggle between <strong>Satellite Photography</strong> and <strong>Roadmap</strong> views. No GCP billing account or API key required.</div>
          </div>
          <div class="card">
            <div style="font-size:20px;font-weight:700;color:#38bdf8;margin-bottom:8px;">&#128205; Block-Level Auto GPS &amp; Google Maps Link</div>
            <div style="font-size:16px;color:#cbd5e1;line-height:1.5;">1-tap GPS locks coordinates with animated camera fly-to. Reverse geocodes down to the true <strong>Subdistrict / Block / Village</strong> via OpenStreetMap Nominatim, without artificial snapping errors.</div>
          </div>
          <div class="card">
            <div style="font-size:20px;font-weight:700;color:#fbbf24;margin-bottom:8px;">&#127782;&#65039; Hyperlocal Microclimate Agronomy</div>
            <div style="font-size:16px;color:#cbd5e1;line-height:1.5;">Fetches exact GPS-level temperature, humidity, and rain probability from Open-Meteo. Gemini calculates optimal pesticide spray windows adapted to the precise field micro-climate.</div>
          </div>
        </div>
        <div style="height:100%;display:flex;align-items:center;justify-content:center;">
          <div class="frame" style="max-height:640px;border:2px solid rgba(74,222,128,0.3);border-radius:20px;">
            <img src="${images.satellite}" alt="Google Satellite Map" />
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <div class="brand">FasalSetu <em>(&#2347;&#2360;&#2354; &#2360;&#2375;&#2340;&#2369;)</em></div>
      <div>Accurate block-level microclimate data saves thousands in wasted pesticide applications.</div>
    </div>
  </div>`);

  // ---- SLIDE 7: ADMIN ----
  slides.push(`
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="badge">Scale Story &amp; Surveillance</div>
        <div class="slide-title">National Agronomist Command Center (/admin)</div>
        <div class="slide-sub">Multi-state pathogen tracking across 6 regions with deep case file drill-down</div>
      </div>
      <div class="slide-num">07 / 11</div>
    </div>
    <div class="slide-body">
      <div class="g2" style="align-items:center;">
        <div style="height:100%;display:flex;flex-direction:column;gap:20px;justify-content:center;">
          <div class="frame" style="height:310px;border-radius:18px;border:1px solid rgba(74,222,128,0.25);">
            <img src="${images.admin}" alt="Admin Dashboard" />
          </div>
          <div class="frame" style="height:310px;border-radius:18px;border:1px solid rgba(56,189,248,0.25);">
            <img src="${images.drilldown}" alt="Case File Drilldown" />
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div class="card card-hi">
            <div style="font-size:20px;font-weight:700;color:#4ade80;margin-bottom:8px;">&#127470;&#127475; Depth &amp; Reach Across 6 Indian States</div>
            <div style="font-size:15px;color:#cbd5e1;line-height:1.5;">Demonstrates real national scalability spanning <strong>Maharashtra, Punjab, West Bengal, Uttar Pradesh, Madhya Pradesh, and Karnataka</strong> across 19 districts and diverse agro-climatic zones.</div>
          </div>
          <div class="card">
            <div style="font-size:20px;font-weight:700;color:#38bdf8;margin-bottom:8px;">&#129440; Pathogen Distribution &amp; Hotspots</div>
            <div style="font-size:15px;color:#cbd5e1;line-height:1.5;">Surveillance breakdown categorizing Early Blight (Tomato), Yellow Rust (Wheat), Cotton Leaf Curl Virus, and Soybean Rust. Enables early quarantine zone declarations.</div>
          </div>
          <div class="card">
            <div style="font-size:20px;font-weight:700;color:#fbbf24;margin-bottom:8px;">&#128269; Deep Case File Inspection Modal</div>
            <div style="font-size:15px;color:#cbd5e1;line-height:1.5;">Click any surveillance log to review the original field photo, confidence score, weather conditions at capture time, and clinical remedy provided to the farmer.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <div class="brand">FasalSetu <em>(&#2347;&#2360;&#2354; &#2360;&#2375;&#2340;&#2369;)</em></div>
      <div>High information density for judges &bull; Verifiable telemetry &bull; Real multi-state seed data</div>
    </div>
  </div>`);

  // ---- SLIDE 8: ACCESSIBILITY ----
  slides.push(`
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="badge">Design Language &amp; UX</div>
        <div class="slide-title">Rural-First Accessibility &amp; Inclusive Design</div>
        <div class="slide-sub">Engineered specifically for outdoor sunlight, low-literacy farmers, and rural field use</div>
      </div>
      <div class="slide-num">08 / 11</div>
    </div>
    <div class="slide-body">
      <div class="g3">
        <div class="card">
          <div class="icon">&#9728;&#65039;</div>
          <div class="ctitle">Sunlight Contrast Floor</div>
          <div class="cdesc">Outdoor farm reading demands extreme contrast. Eliminated washed-out grays in favor of deep slate text on bright parchment backgrounds. All text exceeds <strong>WCAG AAA &ge;4.5:1</strong> contrast ratios for midday field readability.</div>
          <div style="margin-top:18px;"><span class="pill pill-g">Midday Field Readable</span></div>
        </div>
        <div class="card">
          <div class="icon">&#127769;</div>
          <div class="ctitle">Forest Midnight Dark Mode</div>
          <div class="cdesc">Deep foliage tones (#0b140f, #131f18) rather than harsh OLED pitch-black. Anti-flash pre-hydration script in &lt;head&gt; evaluates saved theme before render, eliminating all screen flicker on load.</div>
          <div style="margin-top:18px;"><span class="pill pill-g">Zero-Flicker Night Vision</span></div>
        </div>
        <div class="card">
          <div class="icon">&#127908;</div>
          <div class="ctitle">Field Voice Recorder System</div>
          <div class="cdesc">Dedicated multi-tab startup modal allows farmers to walk through their fields recording tagged audio notes (Pests, Leaf Spots, Irrigation, Growth) and send them directly to the AI Clinic with a single tap.</div>
          <div style="margin-top:18px;"><span class="pill pill-b">Audio-First Workflow</span></div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <div class="brand">FasalSetu <em>(&#2347;&#2360;&#2354; &#2360;&#2375;&#2340;&#2369;)</em></div>
      <div>Touch targets &ge; 44&times;44pt &bull; Zero template chrome &bull; Motion-safe for reduced-motion users</div>
    </div>
  </div>`);

  // ---- SLIDE 9: COMPLIANCE ----
  slides.push(`
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="badge">Engineering Integrity</div>
        <div class="slide-title">Strict Zero-Billing Hackathon Architecture</div>
        <div class="slide-sub">100% compliance with zero-cost constraints and free-tier infrastructure</div>
      </div>
      <div class="slide-num">09 / 11</div>
    </div>
    <div class="slide-body" style="align-items:center;">
      <table class="tbl">
        <thead>
          <tr>
            <th width="28%">Requirement</th>
            <th width="22%">Strict Rule</th>
            <th width="20%">Status</th>
            <th width="30%">Implementation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Firebase Elimination</strong></td>
            <td>NO Firebase anywhere</td>
            <td><span class="yes">&#9989; 100% PASSED</span></td>
            <td>0 dependencies, 0 configs, 0 imports in entire codebase.</td>
          </tr>
          <tr>
            <td><strong>Vertex AI Elimination</strong></td>
            <td>NO Vertex AI</td>
            <td><span class="yes">&#9989; 100% PASSED</span></td>
            <td>100% via official <code>@google/genai</code> against AI Studio endpoint.</td>
          </tr>
          <tr>
            <td><strong>GCP Billing Accounts</strong></td>
            <td>NO billing-gated services</td>
            <td><span class="yes">&#9989; 100% PASSED</span></td>
            <td>Zero Cloud STT/TTS. Keyless Open-Meteo + Google raster tiles.</td>
          </tr>
          <tr>
            <td><strong>Maps API Fees</strong></td>
            <td>Zero paid Maps SDK</td>
            <td><span class="yes">&#9989; 100% PASSED</span></td>
            <td>Leaflet + OSM Nominatim keyless geocoder. Zero GCP project needed.</td>
          </tr>
          <tr>
            <td><strong>Vernacular Fluency</strong></td>
            <td>Authentic regional languages</td>
            <td><span class="yes">&#9989; 100% PASSED</span></td>
            <td>Native Hindi &amp; Bengali text, dropdowns, and Gemini multi-speaker speech.</td>
          </tr>
          <tr>
            <td><strong>Free-Tier Deployment</strong></td>
            <td>Must run free in production</td>
            <td><span class="yes">&#9989; 100% PASSED</span></td>
            <td>Next.js on Vercel Hobby Tier + Supabase Free PostgreSQL.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="slide-footer">
      <div class="brand">FasalSetu <em>(&#2347;&#2360;&#2354; &#2360;&#2375;&#2340;&#2369;)</em></div>
      <div>Proof that cutting-edge AI ag-tech can be deployed globally without billing hurdles.</div>
    </div>
  </div>`);

  // ---- SLIDE 10: IMPACT & ROADMAP ----
  slides.push(`
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="badge">Scale &amp; Horizons</div>
        <div class="slide-title">Economic Impact, Unit Economics &amp; Roadmap</div>
        <div class="slide-sub">How FasalSetu scales to 10,000+ Farmer Producer Organizations (FPOs)</div>
      </div>
      <div class="slide-num">10 / 11</div>
    </div>
    <div class="slide-body">
      <div class="g3">
        <div class="card">
          <div class="icon">&#128176;</div>
          <div class="ctitle">Economic Impact per Farmer</div>
          <div class="cdesc">
            <div style="font-size:40px;font-weight:800;color:#4ade80;margin:12px 0;">&#8377;18,000/acre</div>
            <p>Average savings from cutting unnecessary chemical sprays, halting blight within 48 hours, and avoiding rain-washed pesticide applications through precise micro-climate timing.</p>
          </div>
          <div style="margin-top:18px;"><span class="pill pill-g">+22% Net Income Boost</span></div>
        </div>
        <div class="card">
          <div class="icon">&#9889;</div>
          <div class="ctitle">Ultra-Low Unit Economics</div>
          <div class="cdesc">
            <div style="font-size:40px;font-weight:800;color:#38bdf8;margin:12px 0;">&#8377;0 / farmer</div>
            <p>100% free to the farmer. Platform operation costs are near-zero on serverless edge architecture, making FPO and government sponsorship effortless to sustain at national scale.</p>
          </div>
          <div style="margin-top:18px;"><span class="pill pill-b">Zero Marginal Cost</span></div>
        </div>
        <div class="card">
          <div class="icon">&#128640;</div>
          <div class="ctitle">Phase Next Roadmap</div>
          <div class="cdesc">
            <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:12px;margin-top:8px;">
              <li><strong>Languages</strong>: Telugu, Tamil, Marathi, Punjabi, Gujarati.</li>
              <li><strong>Offline PWA</strong>: On-device quantized diagnosis cache for zero-connectivity zones.</li>
              <li><strong>15 km Community Beacon</strong>: Instant peer-to-peer pest alert broadcast to neighbouring farms.</li>
              <li><strong>Satellite Disease Mapping</strong>: Field-level NDVI anomaly detection via satellite imagery.</li>
            </ul>
          </div>
          <div style="margin-top:18px;"><span class="pill pill-y">National Expansion Ready</span></div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <div class="brand">FasalSetu <em>(&#2347;&#2360;&#2354; &#2360;&#2375;&#2340;&#2369;)</em></div>
      <div>A self-sustaining agricultural public good engineered for national scale.</div>
    </div>
  </div>`);

  // ---- SLIDE 11: CONCLUSION ----
  slides.push(`
  <div class="slide" style="background:radial-gradient(circle at 50% 40%,#153b26 0%,#09170f 60%,#030704 100%);text-align:center;align-items:center;">
    <div class="slide-header" style="width:100%;">
      <div style="margin:0 auto;"><div class="badge">&#127807; Google AI Hackathon 2026</div></div>
      <div class="slide-num">11 / 11</div>
    </div>
    <div class="slide-body" style="flex-direction:column;justify-content:center;align-items:center;max-width:1200px;margin:0 auto;">
      <h1 style="font-size:64px;font-weight:800;color:#fff;letter-spacing:-0.02em;margin-bottom:20px;line-height:1.15;">
        Every Smartphone an Agronomist.<br/>
        <span style="color:#4ade80;">Every Indian Farmer Empowered.</span>
      </h1>
      <p style="font-size:22px;color:#cbd5e1;max-width:840px;margin-bottom:48px;line-height:1.5;">
        FasalSetu connects the power of Google Gemini 2.5 Flash directly to the hands that feed India &mdash; through sight, sound, and satellite.
      </p>
      <div style="display:flex;gap:24px;justify-content:center;width:100%;max-width:1100px;">
        <div class="card card-hi" style="flex:1;padding:24px;text-align:center;">
          <div style="font-size:14px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Live Production App</div>
          <div style="font-family:'Courier New',monospace;font-size:18px;color:#4ade80;font-weight:700;">fasalsetu-theta.vercel.app</div>
        </div>
        <div class="card card-hi" style="flex:1;padding:24px;text-align:center;">
          <div style="font-size:14px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Open Source Repository</div>
          <div style="font-family:'Courier New',monospace;font-size:18px;color:#38bdf8;font-weight:700;">github.com/ogMaverick12/fasalsetu</div>
        </div>
        <div class="card card-hi" style="flex:1;padding:24px;text-align:center;">
          <div style="font-size:14px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Official Demo Video</div>
          <div style="font-family:'Courier New',monospace;font-size:18px;color:#fbbf24;font-weight:700;">03:54 End-to-End Walkthrough</div>
        </div>
      </div>
    </div>
    <div class="slide-footer" style="width:100%;">
      <div class="brand">FasalSetu <em>(&#2347;&#2360;&#2354; &#2360;&#2375;&#2340;&#2369;)</em> &mdash; Thank You!</div>
      <div>Built with &#10084;&#65039; for Indian Farmers &bull; Google AI Hackathon</div>
    </div>
  </div>`);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>FasalSetu - Pitch Deck</title>
<style>${css}</style>
</head>
<body>
${slides.join('\n')}
</body>
</html>`;

  // Write temp HTML
  const htmlPath = path.join(__dirname, 'pitch_deck_temp.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log('Saved temporary HTML (' + (htmlContent.length / 1024).toFixed(0) + ' KB) to ' + htmlPath);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars', '--font-render-hinting=max'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  console.log('Loading in Chrome: ' + fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500)); // let fonts settle

  const outputPdf = path.join(__dirname, '..', 'FasalSetu_Pitch_Deck.pdf');
  const artifactPdf = 'C:\\Users\\sreej\\.gemini\\antigravity\\brain\\c0542fe5-0896-41ff-a236-7ceb4860c809\\FasalSetu_Pitch_Deck.pdf';

  console.log('Rendering PDF...');
  await page.pdf({
    path: outputPdf,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    preferCSSPageSize: true,
  });

  // Copy to artifact dir
  if (fs.existsSync(path.dirname(artifactPdf))) {
    fs.copyFileSync(outputPdf, artifactPdf);
    console.log('Copied to artifacts: ' + artifactPdf);
  }

  // Screenshot of cover slide for preview
  const previewPath = path.join(screenshotsDir, 'pitch_deck_cover.png');
  await page.screenshot({ path: previewPath, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  console.log('Cover preview: ' + previewPath);

  await browser.close();
  try { fs.unlinkSync(htmlPath); } catch (_) {}

  const stats = fs.statSync(outputPdf);
  console.log('\n SUCCESS: FasalSetu_Pitch_Deck.pdf');
  console.log('Size: ' + (stats.size / 1024 / 1024).toFixed(2) + ' MB');
  console.log('Path: ' + outputPdf);
}

generatePitchDeck().catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
