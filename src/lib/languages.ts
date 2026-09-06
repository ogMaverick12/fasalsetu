/**
 * SUPPORTED_LANGUAGES — single source of truth for all language configuration.
 *
 * To add a new language (e.g. Marathi), add one entry here.
 * No changes needed in gemini.ts, Navbar.tsx, or AppContext.tsx.
 *
 * Fields:
 *  code        — BCP-47 short code, used as the Language type and localStorage key
 *  nativeLabel — Label shown on the language picker button (native script)
 *  englishName — Full English name, used in aria-labels and logs
 *  promptName  — Exact word to inject into Gemini prompts ("respond in X")
 *  voiceName   — Gemini TTS voice to use for this language; 'Puck' handles Indic scripts
 *  rtl         — true for right-to-left scripts (Arabic, Urdu, etc.)
 *  i18nKey     — Key in the I18N record; must exist in i18n.ts before activating
 */
export interface LanguageConfig {
  code: string;
  nativeLabel: string;
  englishName: string;
  promptName: string;
  voiceName: string;
  /** BCP-47 locale tag for Web Speech API / HTML lang attributes */
  bcp47: string;
  /** Key used to read localised district name from geo data (e.g. dist.name_hi) */
  districtNameKey: 'name' | 'name_hi' | 'name_bn';
  rtl: boolean;
  i18nKey: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'hi',
    nativeLabel: 'हिन्दी',
    englishName: 'Hindi',
    promptName: 'Hindi',
    voiceName: 'Puck',
    bcp47: 'hi-IN',
    districtNameKey: 'name_hi',
    rtl: false,
    i18nKey: 'hi',
  },
  {
    code: 'bn',
    nativeLabel: 'বাংলা',
    englishName: 'Bengali',
    promptName: 'Bengali',
    voiceName: 'Puck',
    bcp47: 'bn-IN',
    districtNameKey: 'name_bn',
    rtl: false,
    i18nKey: 'bn',
  },
  {
    code: 'en',
    nativeLabel: 'EN',
    englishName: 'English',
    promptName: 'English',
    voiceName: 'Aoede',
    bcp47: 'en-US',
    districtNameKey: 'name',
    rtl: false,
    i18nKey: 'en',
  },
  // ── Add new languages below this line ───────────────────────────────────
  // Example — uncomment and add the matching i18n key to add Marathi:
  // {
  //   code: 'mr',
  //   nativeLabel: 'मराठी',
  //   englishName: 'Marathi',
  //   promptName: 'Marathi',
  //   voiceName: 'Puck',
  //   rtl: false,
  //   i18nKey: 'mr',
  // },
  // Example — Telugu:
  // {
  //   code: 'te',
  //   nativeLabel: 'తెలుగు',
  //   englishName: 'Telugu',
  //   promptName: 'Telugu',
  //   voiceName: 'Puck',
  //   rtl: false,
  //   i18nKey: 'te',
  // },
];

/** Set of valid language codes — used for runtime validation */
export const VALID_LANGUAGE_CODES: Set<string> = new Set(
  SUPPORTED_LANGUAGES.map((l) => l.code)
);

/**
 * Look up a language config by code.
 * Falls back to English so callers never get undefined.
 */
export function getLang(code: string): LanguageConfig {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) ?? SUPPORTED_LANGUAGES[2];
}

/**
 * Derive the Language union type from the config array at the type level.
 * When a new entry is added to SUPPORTED_LANGUAGES, this type automatically
 * expands — no manual union update needed.
 */
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];
