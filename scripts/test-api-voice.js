const fs = require('fs');
const path = require('path');

async function testVoiceApi() {
  console.log('Testing /api/diagnose with Voice Note...');
  const audioPath = path.join(__dirname, '..', 'test-assets', 'hindi_voice_note.wav');
  const audioBuffer = fs.readFileSync(audioPath);
  const blob = new Blob([audioBuffer], { type: 'audio/wav' });

  const formData = new FormData();
  formData.append('audio', blob, 'hindi_voice_note.wav');
  formData.append('language', 'hi');

  const res = await fetch('http://localhost:3005/api/diagnose', {
    method: 'POST',
    body: formData,
  });

  console.log('Voice API Status:', res.status);
  const data = await res.json();
  console.log('Diagnosis Crop:', data.crop);
  console.log('Diagnosis Disease:', data.disease);
  console.log('Is Healthy:', data.is_healthy);
  console.log('Spoken Text:', data.spoken_text);
  console.log('Audio base64 length:', data.audio_base64?.length);
}

testVoiceApi().catch(console.error);
