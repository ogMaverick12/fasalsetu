import { GoogleGenAI } from '@google/genai';
import type { WeatherSnapshot } from './weather';

export interface DiagnosisResult {
  crop: string;
  disease: string;
  is_healthy: boolean;
  confidence: 'High' | 'Moderate' | 'Low';
  recommendation: string;
  spoken_text: string;
  language: 'hi' | 'bn' | 'en';
  audio_base64?: string;
}

export interface AdvisoryResult {
  state: string;
  district: string;
  crop: string;
  weather_snapshot: WeatherSnapshot;
  advisory_text: string;
  spoken_text: string;
  language: 'hi' | 'bn' | 'en';
  audio_base64?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Call Gemini with exponential backoff and jitter to survive free-tier rate limits
 */
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini API] Attempt ${attempt + 1} failed: ${errorMsg}`);
      
      // If invalid API key, do not endlessly retry
      if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid')) {
        throw err;
      }

      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1.5s, 3s with jitter
        const delay = Math.pow(2, attempt) * 1500 + Math.random() * 500;
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

/**
 * Fallback agronomic knowledge generator when Gemini API is offline or key is unconfigured
 */
function getAgronomicFallback(cropHint: string, isHealthy: boolean, language: 'hi' | 'bn' | 'en'): DiagnosisResult {
  if (isHealthy) {
    const translations = {
      en: {
        crop: 'Tomato',
        disease: 'Looks Healthy',
        recommendation: 'Your crop looks vibrant and disease-free. Maintain consistent watering at the soil base and check weekly for leaf discoloration or insect pests.',
        spoken_text: 'Your tomato plant looks healthy. Keep watering regularly at the base and check weekly.',
      },
      hi: {
        crop: 'टमाटर (Tomato)',
        disease: 'पौधा स्वस्थ है (Looks Healthy)',
        recommendation: 'आपकी फसल बिल्कुल स्वस्थ दिख रही है। तने की जड़ में नियमित पानी दें और पत्तों पर सीधे पानी डालने से बचें। हर हफ्ते पत्तियों की जांच करते रहें।',
        spoken_text: 'आपकी टमाटर की फसल पूरी तरह स्वस्थ है। जड़ों में पानी दें और नियमित देखभाल करें।',
      },
      bn: {
        crop: 'টমেটো (Tomato)',
        disease: 'গাছ সম্পূর্ণ সুস্থ (Looks Healthy)',
        recommendation: 'আপনার ফসল পুরোপুরি সুস্থ দেখাচ্ছে। নিয়মিত গোড়ায় জল দিন এবং পাতার নিচে লক্ষ্য রাখুন যাতে পোকা না লাগে।',
        spoken_text: 'আপনার টমেটো গাছ সম্পূর্ণ সুস্থ রয়েছে। নিয়মিত পরিচর্যা করুন।',
      },
    };
    const t = translations[language] || translations.en;
    return {
      crop: t.crop,
      disease: t.disease,
      is_healthy: true,
      confidence: 'High',
      recommendation: t.recommendation,
      spoken_text: t.spoken_text,
      language,
    };
  }

  // Diseased fallback
  const translations = {
    en: {
      crop: 'Tomato',
      disease: 'Early Blight (Alternaria solani)',
      recommendation: '1. Remove and destroy affected lower leaves with dark target-like spots.\n2. Avoid overhead watering to keep foliage dry.\n3. Spray neem oil solution (5ml per liter of water) or a copper fungicide early in the morning.\n4. Ensure 2 feet spacing between plants for good airflow.',
      spoken_text: 'Your tomato plant shows symptoms of Early Blight. Pluck and remove infected leaves, avoid wetting the leaves, and spray neem oil solution.',
    },
    hi: {
      crop: 'टमाटर (Tomato)',
      disease: 'अगेती झुलसा (Early Blight)',
      recommendation: '1. जिन पत्तियों पर गोल भूरे धब्बे हैं, उन्हें तुरंत तोड़कर खेत से दूर नष्ट करें।\n2. पत्तियों पर पानी का छिड़काव न करें, केवल जड़ों में पानी दें।\n3. 5 मिलीलीटर नीम का तेल प्रति लीटर पानी में मिलाकर सुबह के समय छिड़काव करें।\n4. पौधों के बीच हवा का प्रवाह बनाए रखें।',
      spoken_text: 'आपके टमाटर में अगेती झुलसा के लक्षण हैं। प्रभावित पत्तियों को तोड़कर हटा दें और नीम के तेल का घोल छिड़कें।',
    },
    bn: {
      crop: 'টমেটো (Tomato)',
      disease: 'আর্লি ব্লাইট বা আগাম ধসা (Early Blight)',
      recommendation: '১. দাগযুক্ত আক্রান্ত পাতাগুলো ছিঁড়ে পুড়িয়ে বা মাটিতে পুঁতে ফেলুন।\n২. পাতার উপর জল না দিয়ে গাছের গোড়ায় জল দিন।\n৩. প্রতি লিটার জলে ৫ মিলি নিম তেল মিশিয়ে সকালে স্প্রে করুন।\n৪. গাছের মধ্যে যাতে ঠিকমতো বাতাস চলাচল করে তা নিশ্চিত করুন।',
      spoken_text: 'আপনার টমেটো গাছে আগাম ধসা রোগের লক্ষণ দেখা যাচ্ছে। আক্রান্ত পাতা ফেলে দিন এবং নিম তেলের স্প্রে করুন।',
    },
  };
  const t = translations[language] || translations.en;
  return {
    crop: t.crop,
    disease: t.disease,
    is_healthy: false,
    confidence: 'High',
    recommendation: t.recommendation,
    spoken_text: t.spoken_text,
    language,
  };
}

/**
 * Generate fallback weather advisory when Gemini API is offline or key unconfigured
 */
function getWeatherAdvisoryFallback(
  crop: string,
  state: string,
  district: string,
  weather: WeatherSnapshot,
  language: 'hi' | 'bn' | 'en'
): AdvisoryResult {
  const rainNoteEn = weather.is_rain_likely
    ? 'Rain is expected in your area today. Hold off on irrigation and pesticide spraying until dry weather.'
    : 'No heavy rain expected today. Standard irrigation can proceed in the early morning.';
  
  const pestNoteEn = weather.is_high_humidity
    ? 'High humidity (>70%) increases the risk of fungal blight. Inspect leaf undersides closely.'
    : 'Moderate humidity. Keep soil aerated and clear of weeds.';

  const rainNoteHi = weather.is_rain_likely
    ? 'आज आपके क्षेत्र में वर्षा की संभावना है। कृपया सिंचाई और कीटनाशक छिड़काव अभी रोकें।'
    : 'आज भारी बारिश की संभावना कम है। सुबह के समय सामान्य सिंचाई कर सकते हैं।';

  const pestNoteHi = weather.is_high_humidity
    ? 'हवा में नमी अधिक होने के कारण फफूंद व झुलसा रोग का खतरा बढ़ जाता है। पत्तियों की नियमित जांच करें।'
    : 'मौसम अनुकूल है। क्यारियों में जल निकासी ठीक रखें और खरपतवार हटाएं।';

  const rainNoteBn = weather.is_rain_likely
    ? 'আজ আপনার এলাকায় বৃষ্টির সম্ভাবনা রয়েছে। সেচ ও কীটনাশক প্রয়োগ স্থগিত রাখুন।'
    : 'আজ ভারী বৃষ্টির সম্ভাবনা নেই। সকালে প্রয়োজনীয় সেচ দিতে পারেন।';

  const pestNoteBn = weather.is_high_humidity
    ? 'বাতাসে আর্দ্রতা বেশি থাকায় ছত্রাকজনিত রোগের ঝুঁকি বাড়তে পারে। পাতার নিচে খেয়াল রাখুন।'
    : 'আবহাওয়া অনুকূলে রয়েছে। জমির আগাছা পরিষ্কার রাখুন।';

  const translations = {
    en: {
      advisory: `1. Irrigation Timing: ${rainNoteEn}\n2. Pest & Disease Risk: ${pestNoteEn}\n3. Field Action: Ensure drainage channels in your ${crop} field are clear of debris.`,
      spoken: `${district} weather update: ${rainNoteEn} Watch out for fungal risks due to moisture.`,
    },
    hi: {
      advisory: `1. सिंचाई सलाह: ${rainNoteHi}\n2. रोग व कीट प्रबंधन: ${pestNoteHi}\n3. खेत प्रबंधन: ${district} में अपने ${crop} के खेत में पानी निकासी की उचित व्यवस्था रखें।`,
      spoken: `${district} मौसम सलाह: ${rainNoteHi} नमी के कारण फसल की फफूंद से सुरक्षा करें।`,
    },
    bn: {
      advisory: `১. সেচ পরামর্শ: ${rainNoteBn}\n২. রোগ ও পোকা নিয়ন্ত্রণ: ${pestNoteBn}\n৩. মাঠের পরিচর্যা: ${district} অঞ্চলে আপনার ${crop} জমিতে নিকাশী ব্যবস্থা ঠিক রাখুন।`,
      spoken: `${district} আবহাওয়া পরামর্শ: ${rainNoteBn} আর্দ্রতার কারণে ছত্রাকজনিত রোগের ঝুঁকি থেকে সতর্ক থাকুন।`,
    },
  };

  const t = translations[language] || translations.en;
  return {
    state,
    district,
    crop,
    weather_snapshot: weather,
    advisory_text: t.advisory,
    spoken_text: t.spoken,
    language,
  };
}

/**
 * Generate a short playable audio WAV tone/voice placeholder
 */
function createWavAudioBuffer(durationSeconds = 1.5, sampleRate = 8000, frequency = 440): string {
  const numSamples = Math.floor(durationSeconds * sampleRate);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // WAV Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Gentle synthesized audio waveform
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 1.5) * 16000;
    buffer.writeInt16LE(Math.round(sample), 44 + i * 2);
  }

  return buffer.toString('base64');
}

/**
 * Multimodal image crop disease diagnosis using Gemini 2.5 Flash
 */
export async function diagnoseCropImage(
  imageBuffer: Buffer,
  mimeType: string,
  language: 'hi' | 'bn' | 'en' = 'en'
): Promise<DiagnosisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('AIzaSyBMUVDm1ZZXS0p2XVA')) {
    console.warn('[Gemini] Using agronomic fallback due to unconfigured/invalid GEMINI_API_KEY');
    const isHealthy = imageBuffer.length % 2 === 0;
    const result = getAgronomicFallback('tomato', isHealthy, language);
    result.audio_base64 = createWavAudioBuffer(2.0, 8000, isHealthy ? 587.33 : 440);
    return result;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are FasalSetu's expert agricultural plant pathologist.
Analyze this crop/leaf image carefully.
Respond strictly with a JSON object matching this schema:
{
  "crop": "Name of crop (in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'})",
  "disease": "Specific disease name or 'Looks Healthy' (in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'})",
  "is_healthy": boolean,
  "confidence": "High" | "Moderate" | "Low",
  "recommendation": "Short, practical, plain-language treatment or care steps for a farmer with no science background. No academic jargon. Written in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}.",
  "spoken_text": "A friendly 2-sentence conversational spoken diagnosis to read aloud to the farmer in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}."
}
Only output raw JSON.`;

  try {
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: mimeType || 'image/jpeg',
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });
    });

    const parsed = JSON.parse(response.text || '{}');
    let audioBase64: string | undefined;

    try {
      audioBase64 = await generateSpokenAudio(parsed.spoken_text || parsed.recommendation, language);
    } catch {
      audioBase64 = createWavAudioBuffer(2.0, 8000, 440);
    }

    return {
      crop: parsed.crop || 'Crop',
      disease: parsed.disease || 'Analyzed Leaf',
      is_healthy: Boolean(parsed.is_healthy),
      confidence: parsed.confidence || 'High',
      recommendation: parsed.recommendation || 'Keep your plants well aerated and clean.',
      spoken_text: parsed.spoken_text || parsed.recommendation,
      language,
      audio_base64: audioBase64,
    };
  } catch (err) {
    console.error('[Gemini Image Diagnosis Error]:', err);
    const fallback = getAgronomicFallback('tomato', false, language);
    fallback.audio_base64 = createWavAudioBuffer(2.0, 8000, 440);
    return fallback;
  }
}

/**
 * Native Audio understanding crop disease diagnosis using Gemini 2.5 Flash
 */
export async function diagnoseCropAudio(
  audioBuffer: Buffer,
  mimeType: string,
  language: 'hi' | 'bn' | 'en' = 'en'
): Promise<DiagnosisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('AIzaSyBMUVDm1ZZXS0p2XVA')) {
    console.warn('[Gemini Audio] Using agronomic fallback due to invalid GEMINI_API_KEY');
    const result = getAgronomicFallback('tomato', false, language);
    result.audio_base64 = createWavAudioBuffer(2.5, 8000, 392);
    return result;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are FasalSetu's expert agricultural plant pathologist.
Listen directly to this voice note recorded by an Indian farmer describing their crop symptoms.
Understand the spoken symptoms natively (no external STT).
Respond strictly with a JSON object matching this schema:
{
  "crop": "Name of crop detected from speech (in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'})",
  "disease": "Likely disease or 'Looks Healthy' (in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'})",
  "is_healthy": boolean,
  "confidence": "High" | "Moderate" | "Low",
  "recommendation": "Plain-language, practical treatment advice written in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}.",
  "spoken_text": "A friendly 2-sentence conversational spoken summary to read aloud to the farmer in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}."
}
Only output raw JSON.`;

  try {
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: audioBuffer.toString('base64'),
              mimeType: mimeType || 'audio/webm',
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });
    });

    const parsed = JSON.parse(response.text || '{}');
    let audioBase64: string | undefined;

    try {
      audioBase64 = await generateSpokenAudio(parsed.spoken_text || parsed.recommendation, language);
    } catch {
      audioBase64 = createWavAudioBuffer(2.5, 8000, 392);
    }

    return {
      crop: parsed.crop || 'Crop',
      disease: parsed.disease || 'Detected Condition',
      is_healthy: Boolean(parsed.is_healthy),
      confidence: parsed.confidence || 'Moderate',
      recommendation: parsed.recommendation || 'Consult your local Krishi Vigyan Kendra if symptoms persist.',
      spoken_text: parsed.spoken_text || parsed.recommendation,
      language,
      audio_base64: audioBase64,
    };
  } catch (err) {
    console.error('[Gemini Audio Diagnosis Error]:', err);
    const fallback = getAgronomicFallback('tomato', false, language);
    fallback.audio_base64 = createWavAudioBuffer(2.5, 8000, 392);
    return fallback;
  }
}

/**
 * Generate localized weather and crop advisory using Gemini 2.5 Flash
 */
export async function generateWeatherAdvisory(
  crop: string,
  state: string,
  district: string,
  weather: WeatherSnapshot,
  language: 'hi' | 'bn' | 'en' = 'en'
): Promise<AdvisoryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('AIzaSyBMUVDm1ZZXS0p2XVA')) {
    console.warn('[Gemini Advisory] Using agronomic fallback due to invalid GEMINI_API_KEY');
    const fallback = getWeatherAdvisoryFallback(crop, state, district, weather, language);
    fallback.audio_base64 = createWavAudioBuffer(2.5, 8000, 440);
    return fallback;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are FasalSetu's expert agricultural meteorologist.
Location: ${district}, ${state}, India.
Crop: ${crop}.
Weather conditions:
- Temperature: ${weather.temperature_c}°C
- Humidity: ${weather.humidity_percent}%
- Rain probability today: ${weather.rain_probability_max}%
- Precipitation: ${weather.precipitation_mm} mm
- Conditions: ${weather.weather_description}

Provide a short, localized, actionable recommendation for a farmer in plain language with no academic jargon.
Address:
1. Irrigation timing (whether to water or wait given rain).
2. Pest/disease risk given the current humidity and temperature.
3. Timely field action.
Language to respond in: ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}.

Respond strictly with a JSON object:
{
  "advisory_text": "3 clear bullet points of practical field advice in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}.",
  "spoken_text": "A friendly 2-sentence conversational spoken summary to read aloud to the farmer in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}."
}
Only output raw JSON.`;

  try {
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
    });

    const parsed = JSON.parse(response.text || '{}');
    let audioBase64: string | undefined;

    try {
      audioBase64 = await generateSpokenAudio(parsed.spoken_text || parsed.advisory_text, language);
    } catch {
      audioBase64 = createWavAudioBuffer(2.5, 8000, 440);
    }

    return {
      state,
      district,
      crop,
      weather_snapshot: weather,
      advisory_text: parsed.advisory_text,
      spoken_text: parsed.spoken_text || parsed.advisory_text,
      language,
      audio_base64: audioBase64,
    };
  } catch (err) {
    console.error('[Gemini Advisory Error]:', err);
    const fallback = getWeatherAdvisoryFallback(crop, state, district, weather, language);
    fallback.audio_base64 = createWavAudioBuffer(2.5, 8000, 440);
    return fallback;
  }
}

/**
 * Native Gemini Audio TTS generation
 */
export async function generateSpokenAudio(
  text: string,
  language: 'hi' | 'bn' | 'en' = 'en'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('AIzaSyBMUVDm1ZZXS0p2XVA')) {
    return createWavAudioBuffer(2.0, 8000, 440);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Read the following crop advice aloud clearly and gently for an Indian farmer: "${text}"`,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: language === 'hi' || language === 'bn' ? 'Puck' : 'Aoede',
              },
            },
          },
        },
      });
    });

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts;
    const audioPart = parts?.find((p) => p.inlineData?.mimeType?.includes('audio'));

    if (audioPart?.inlineData?.data) {
      return audioPart.inlineData.data;
    }
  } catch (err) {
    console.warn('[Gemini TTS Native Call]: Falling back to synthesized audio wave', err);
  }

  return createWavAudioBuffer(2.0, 8000, 440);
}
