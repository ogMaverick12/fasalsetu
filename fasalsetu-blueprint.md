# FasalSetu — Build Blueprint
### Build with AI: Code for Communities · Agricultural Intelligence track

This is a living document. It gets extended phase by phase as the build progresses — don't expect the whole thing to be final on day one.

---

## 1. Stack, and why

| Layer | Choice | Why |
|---|---|---|
| AI | Google AI Studio Gemini API (`gemini-2.5-flash` primary, `gemini-2.5-flash-lite` where request volume matters more than quality) | Free tier needs no billing account at all. One key covers multimodal image understanding (crop diagnosis), text reasoning (advisory), native audio input understanding, and native multi-speaker TTS output — no separate voice stack needed. |
| Backend / DB / Auth / Storage | Supabase (free tier) | Postgres + Auth + Storage + Edge Functions, no credit card. Direct drop-in for what Firebase would have done. |
| Frontend hosting | Vercel (or Netlify) free tier | No card, good PWA support — matters for budget-Android/offline-ish use. |
| Weather | Open-Meteo (free, no key) as the default; IMD public data as an India-specific enrichment if time allows | Zero-friction to integrate; no auth flow to build at all. |
| Crop disease reference data | PlantVillage / PlantDoc public image sets | Well-established, large, labeled — good for validation and few-shot grounding if the raw Gemini call needs steering. |
| Geospatial (stretch, not core path) | Google Earth Engine | Useful for satellite-derived soil/vegetation signal, but generally wants a linked Cloud project — treat as a bonus layer, not something the core flow depends on. |

**Explicitly not in the stack:** Firebase, Vertex AI, Cloud Speech-to-Text, Cloud Text-to-Speech, Cloud Translation API, Cloud Run. All of these sit under a GCP project that wants a billing account attached even when actual spend is ₹0 — that's the whole reason they're out, not a stylistic preference. Antigravity will have plenty of GCP-flavored training data and may reach for one of these out of habit — every phase prompt below says explicitly not to.

## 2. Constraints to design around, not discover later

- **Gemini free-tier rate limits are genuinely tight** (Google cut them 50–80% in December 2025). Expect single-to-low-double-digit requests/minute on the cheap models. Fine for building and for a judge clicking through once. Not fine if fifty people hit the live link at once on Demo Day. Build a simple retry/backoff into every Gemini call from Phase 1 onward, and keep a recorded fallback path (the demo video) so a 429 mid-live-demo isn't fatal.
- **Supabase free projects auto-pause after 7 days of inactivity.** Doesn't matter during active building; matters if there's a lull before Demo Day — open the dashboard the day before to wake it up.
- **Two UI surfaces, on purpose.** A sharp, dense view for the judge-facing demo/dashboard, and a near-zero-text, voice-first flow for the actual farmer end user. Don't let one drift into doing the other's job — that tension gets resolved in Phase 5, but every earlier phase should keep the farmer-facing surface radically simple by default.

## Design Language
### (governs every phase, including 0–3 already written above — if any of those get revisited, hold them to this too)

**What to avoid — these are the tells that make an interface read as AI-generated on sight, not aesthetic opinions:**

- Warm cream/sand/beige backgrounds (the near-`#F4F1EA` family), especially paired with a terracotta accent — currently the single most common AI-app tell there is.
- The "SaaS-card kit": everything chopped into identical rounded cards, one border-radius on everything regardless of hierarchy, the same soft grey shadow under each, gradient washes as decoration. Nested cards are always wrong.
- Template chrome: tracked-out ALL-CAPS eyebrow labels over every heading, meta text joined with middle-dots, "WORD — fragment" spaced-em-dash labels, monospace for small data labels, a → tacked onto every button and link.
- Two lookalike sans-serifs paired together (e.g. Inter + system-default) — that's not a typographic decision, it's the absence of one.
- Numbered 01/02/03 markers on content that isn't actually a sequence.
- The same fade-and-slide-up reveal applied identically to every card or section on scroll — the tell isn't motion, it's the uniform reflex.
- Emoji standing in for real icons.
- Gray-on-near-white body text "for elegance" — the single biggest reason AI interfaces end up hard to read.

**What to commit to instead:**

- One real typographic decision: a distinctive display face paired with a refined body face on an actual contrast axis (serif + sans, or geometric + humanist) — not two similar sans-serifs side by side.
- A small, deliberate color system (4–6 tokens, OKLCH), with exactly one thing in the interface allowed to be bold and everything around it quiet and disciplined.
- Real vector icons only — one style (filled or outline, not mixed) per hierarchy level, consistent stroke weight, sized as tokens not arbitrary values.
- One well-orchestrated motion moment rather than scattered hover/reveal effects everywhere — motion that responds to what someone just did (opened, confirmed, submitted), ease-out curves, no bounce or elastic, `prefers-reduced-motion` always respected.

**Accessibility numbers — floors, not aspirations:**

- Body text contrast ≥4.5:1, and push meaningfully past that here specifically — this gets read outdoors, in direct sunlight, on a budget screen. "Technically passes WCAG" is the floor, not the target.
- Touch targets ≥44×44pt, ≥8px between adjacent ones.
- Color never carries meaning alone — "healthy" vs "diseased" needs an icon and a word, never just green vs red.
- Base text size 16px minimum, 1.5 line-height.
- One decision on screen at a time on every farmer-facing surface — progressive disclosure, never a form showing every field at once. This matters more than any amount of visual polish for someone who isn't a confident smartphone user.

**The two-surface split, restated with this in mind:** the judge-facing dashboard (Phase 4) can carry more density and information per screen — that's normal for an analyst surface. The farmer-facing surfaces (Phases 1–3) should stay premium in craft — typography, spacing, motion, icon quality — while staying minimal in how many choices sit on screen at once. Premium and simple aren't actually in tension. Cheap-looking and simple are what's in tension, and that's the mistake to avoid.

## 3. Phase roadmap

- **Phase 0 — Scaffold:** repo, Supabase project, a deployed "hello world," the whole pipe (local → git → live URL) proven before any AI feature exists.
- **Phase 1 — Core flow:** photo in → Gemini diagnosis + plain-language treatment out. This is the track's "core use case" per the rubric — it gets built and proven first, everything else is secondary.
- **Phase 2 — Voice layer:** native Gemini audio in/out wrapping the diagnosis flow, at least Hindi + one regional language (Bengali is a natural first pick given where you're testing from — swap freely).
- **Phase 3 — Advisory layer:** weather + basic soil input → localized, spoken recommendation, same voice pipeline as Phase 2.
- **Phase 4 — Scale story:** seed the Supabase table with sample data spanning multiple states, build one simple aggregate view (disease trends by state) — this is what actually answers "Depth & Reach Across India" for a judge, not a claim in the pitch deck.
- **Phase 5 — Polish:** the dual-UI-surface split for real, demo video, pitch deck, final deployed link.

All five phases are specced below. Pitch deck (10–12 slides, part of the submission package) is deliberately not here — it's a separate deliverable, not an Antigravity task, and it's worth drafting once there's a real app and real data to show in it rather than before.

## 4. Phase 0 — Scaffold (Antigravity-ready)

```
Scaffold FasalSetu, a crop-disease-diagnosis PWA for Indian farmers.

Hard constraints — do not deviate:
- No Firebase, anywhere.
- No Vertex AI. All AI calls go through the Gemini API via Google AI Studio
  (API key auth, not a GCP service account or Vertex endpoint).
- No Google Cloud service that requires a billing-account-linked project
  (that rules out Cloud Run, Cloud Speech-to-Text, Cloud Text-to-Speech,
  Translation API too, for later phases).

Stack: Next.js (App Router) + TypeScript + Tailwind, deployed to Vercel
free tier. Supabase (free tier) for Postgres + Auth.

Tasks:
1. Initialize a Next.js 14+ App Router project, TypeScript, Tailwind.
2. Create a Supabase project (free tier) and wire up the client SDK.
   Create one table, `diagnoses`: id, created_at, image_url,
   crop_type (nullable), diagnosis_text (nullable), state (nullable),
   language (default 'en').
3. Build a minimal landing page: one clear call-to-action button,
   "Check my crop," routing to /diagnose (the page itself can be a
   placeholder for now).
4. Add an API route /api/health returning { status: "ok", timestamp }.
5. Deploy to Vercel free tier. Confirm the deployed URL is live and
   /api/health returns 200.
6. Open the deployed URL in a real browser at a 390px-wide viewport
   (this app's real users are on budget Android phones) and confirm
   the landing page renders cleanly. Screenshot it.

Acceptance: live deployed URL, /api/health returns 200, landing page
readable and uncluttered at 390px width. Provide the deployed URL and
the mobile screenshot as proof.
```

## 5. Phase 1 — Core diagnosis flow (Antigravity-ready)

```
Build the core diagnosis flow for FasalSetu. Phase 0's scaffold
(Next.js + Supabase + Vercel) is already live.

Hard constraints — same as Phase 0, still apply: no Firebase, no
Vertex AI, no billing-account-gated GCP service. All AI calls use the
current official Gemini SDK against the Google AI Studio endpoint,
authenticated with a GEMINI_API_KEY env var. Confirm the exact current
package/method names yourself (check npm / the official docs) rather
than assuming — this SDK has moved fast.

Tasks:
1. Build /diagnose: mobile-first, one large button to open the camera
   or pick a photo (native file input, capture=environment), then a
   clear loading state while the diagnosis runs.
2. Create /api/diagnose: accepts an uploaded image, sends it to
   gemini-2.5-flash in a single multimodal call. Prompt the model to
   return structured JSON: likely crop, likely disease (or "looks
   healthy"), a confidence note, and a short plain-language treatment
   recommendation — written for a farmer with no agri-science
   background, no jargon.
3. Wrap the Gemini call in retry/backoff (rate limits are real on the
   free tier — see the blueprint's constraints section). On failure,
   show a plain "couldn't check that, try again" message, never a raw
   error or stack trace.
4. Store each diagnosis in the Supabase `diagnoses` table (image_url
   from Supabase Storage).
5. Render the result in large, simple typography: crop, diagnosis,
   recommendation. No dashboard chrome on this surface — that's a
   different phase, different audience.
6. Test end-to-end for real: find 3–4 sample leaf images (mix of
   healthy and at least one common disease — PlantVillage/PlantDoc
   are good sources if none are supplied locally), upload each through
   the actual UI, and confirm each produces a sensible result.

Acceptance: a real photo, uploaded through the real UI, returns a
diagnosis and recommendation in farmer-plain language within a
reasonable wait, and the result is stored in Supabase. Provide
screenshots of at least two successful diagnoses.
```

## 6. Phase 2 — Voice layer (Antigravity-ready)

```
Add the voice layer to FasalSetu, wrapping the existing /diagnose flow
from Phase 1. That flow stays intact and keeps working without voice
enabled — voice is additive, not a replacement.

Hard constraints — same as Phases 0 and 1: no Firebase, no Vertex AI,
no billing-account-gated GCP service. Voice input and output both go
through the Gemini API's native audio capabilities (native audio
understanding for input, native multi-speaker text-to-speech
generation for output) — do not add Cloud Speech-to-Text or Cloud
Text-to-Speech, they need a billing account and Gemini already does
both natively.

Tasks:
1. Add a language picker to the top of /diagnose: 2–3 buttons showing
   language names in their own script (हिन्दी, বাংলা, English to
   start — easy to extend), not an English-only dropdown. Default to
   whichever is tapped; persist the choice for the session.
2. After a diagnosis is returned (Phase 1's flow, unchanged), generate
   a spoken version of the diagnosis + recommendation in the selected
   language using Gemini's native TTS, and auto-play it with a replay
   button. If the diagnosis text itself isn't already in the target
   language, have the same Gemini call produce it in that language
   rather than translating client-side.
3. Add a second entry point on /diagnose: a large "or tell me what's
   wrong" mic button, mutually exclusive with the photo flow for a
   given session (record a short voice note in-browser). Send the
   audio directly to Gemini using its native audio understanding —
   don't transcribe to text as a separate step. Route the result
   through the same diagnosis-rendering and spoken-output path as the
   photo flow.
4. Keep the retry/backoff and plain-language error handling from
   Phase 1 for every new Gemini call this phase adds.
5. Test end-to-end in a real browser: record a short voice note
   describing a crop problem (in at least one non-English language),
   confirm a sensible diagnosis comes back, and confirm it's both
   displayed and spoken aloud in the selected language.

Acceptance: language picker works and persists; a photo-based
diagnosis is read aloud in the selected language; a voice-note query
produces a diagnosis through the same pipeline. Screenshot the
language picker and provide a description of what was heard on
playback (Antigravity can note this even without shipping the audio
file itself).
```

## 7. Phase 3 — Advisory layer (Antigravity-ready)

```
Add the localized advisory layer to FasalSetu — a second, standalone
flow alongside /diagnose, not a replacement for it.

Hard constraints — same as every prior phase: no Firebase, no Vertex
AI, no billing-account-gated GCP service. Weather comes from
Open-Meteo (free, keyless REST API) — no auth flow to build. Voice
output reuses the same native Gemini TTS pipeline from Phase 2; don't
build a second voice pipeline.

Tasks:
1. Create a new Supabase table, `advisories`: id, created_at, state,
   district, crop_type (nullable), weather_snapshot (jsonb),
   advisory_text, language.
2. Build /advisory: a simple form — state, district (plain
   dropdowns or typeaheads, not free text; low-literacy users
   shouldn't have to type), and crop type (reuse whatever crop list
   or free-text the diagnosis flow already established). Same
   language picker as Phase 2, shared state if the user came from
   /diagnose.
3. Create /api/advisory: given state/district, geocode to
   approximate coordinates (a static lookup table for India's states
   and major districts is enough — no need for a geocoding API) and
   call Open-Meteo for current + short forecast conditions. Pass
   crop type, location, and the weather data to Gemini, prompting for
   a short, localized, actionable recommendation (irrigation timing,
   pest/disease risk given the forecast, anything time-sensitive) in
   plain language, in the selected language.
4. Store the result in `advisories` and render it the same way
   Phase 1/2 render a diagnosis — plain typography, spoken aloud via
   the Phase 2 TTS pipeline, no dashboard chrome on this surface.
5. Reuse retry/backoff and plain-language error handling from prior
   phases for both the Open-Meteo call and the Gemini call.
6. Test end-to-end: pick 2–3 different state/district combinations,
   confirm each returns a plausible, weather-grounded recommendation,
   in text and read aloud.

Acceptance: selecting a state/district/crop returns a localized,
weather-grounded recommendation, stored in Supabase, shown and spoken
in the selected language. Screenshot the form and the rendered result
for at least two different districts.
```

## 8. Phase 4 — Scale story (Antigravity-ready)

```
Build the scale-story dashboard for FasalSetu: a separate surface,
/admin, for judges and reviewers — not for farmers.

Hard constraints — same as every prior phase: no Firebase, no Vertex
AI, no billing-account-gated GCP service. Follow this blueprint's
Design Language section for the visual system. Note explicitly:
/admin is the denser, judge-facing surface — more information per
screen is appropriate here in a way it deliberately isn't on
/diagnose or /advisory. Don't import the farmer-facing minimalism
here; don't import dashboard density there.

Tasks:
1. Seed the `diagnoses` and `advisories` tables with realistic sample
   data spanning at least 5–6 states across different regions of
   India — not just wherever real testing happened. Vary crops,
   diseases, and dates. This is what actually demonstrates "Depth &
   Reach Across India" to a judge; a single-state dataset undercuts
   that criterion no matter what the pitch deck claims.
2. Build /admin: a real dashboard — a state-by-state breakdown of
   diagnosis volume, a simple trend view of the most common diseases
   detected, and a way to drill into any individual diagnosis or
   advisory record. A map view is a nice-to-have, not required.
3. Keep this surface's navigation entirely separate from the farmer
   flows — no shared chrome that would blur the two audiences.
4. Test end-to-end: confirm the dashboard reflects the seeded
   multi-state data accurately and that drilling into a record shows
   the right detail.

Acceptance: /admin shows a genuine multi-state view of the seeded
data, not a single-city demo dressed up. Screenshot the main
dashboard view and one drill-down.
```

## 9. Phase 5 — Polish (Antigravity-ready)

```
Final pass before Demo Day — polish, not new features.

Tasks:
1. Walk every surface (/, /diagnose, /advisory, /admin) against this
   blueprint's Design Language section specifically — the avoid-list
   and the accessibility numbers. Fix whatever slipped: gray-on-white
   text, mixed icon styles, missing touch-target spacing, motion that
   ignores prefers-reduced-motion.
2. Audit the farmer-facing surfaces for one-decision-at-a-time —
   flag any screen showing more than the essential choice at once.
3. Confirm retry/backoff is actually wired into every Gemini call
   across all phases, not just Phase 1 — Demo Day traffic is exactly
   when this matters.
4. Record the 3–5 minute demo video: core diagnosis flow working
   end-to-end on a phone-sized viewport first, then voice, then
   advisory, then /admin last. That order matches the rubric's own
   weighting — technical execution and the core use case come first,
   reach/scale is supporting evidence after, not the headline.
5. Confirm the deployed link is live and the Supabase project isn't
   paused.

Acceptance: a recorded demo showing every phase working, a live
deployed link, and a final pass that holds every surface to this
blueprint's own design and accessibility bar.
```
