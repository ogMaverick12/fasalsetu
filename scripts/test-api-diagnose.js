const fs = require('fs');
const path = require('path');

async function testApi() {
  console.log('Testing /api/diagnose with Tomato Early Blight image...');
  const imagePath = path.join(__dirname, '..', 'test-assets', 'tomato_early_blight.jpg');
  const imageBuffer = fs.readFileSync(imagePath);
  const blob = new Blob([imageBuffer], { type: 'image/jpeg' });

  const formData = new FormData();
  formData.append('image', blob, 'tomato_early_blight.jpg');
  formData.append('language', 'hi');

  const res = await fetch('http://localhost:3005/api/diagnose', {
    method: 'POST',
    body: formData,
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Diagnosis Crop:', data.crop);
  console.log('Diagnosis Disease:', data.disease);
  console.log('Is Healthy:', data.is_healthy);
  console.log('Spoken Text:', data.spoken_text);
  console.log('Audio base64 length:', data.audio_base64?.length);
}

testApi().catch(console.error);
