const { GoogleGenAI } = require('@google/genai');

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key present:', !!apiKey, 'prefix:', apiKey ? apiKey.substring(0, 8) : 'none');
  const ai = new GoogleGenAI({ apiKey });

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Respond with a simple JSON: {"status":"ok","model":"gemini-2.5-flash"}',
      config: {
        responseMimeType: 'application/json',
      }
    });
    console.log('Gemini 2.5 flash response:', res.text);
  } catch (err) {
    console.error('Error with gemini-2.5-flash:', err.message);
  }
}

test();
