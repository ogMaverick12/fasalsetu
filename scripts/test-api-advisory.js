async function testAdvisories() {
  console.log('--- Test 1: Nashik, Maharashtra (Tomato, Hindi) ---');
  const res1 = await fetch('http://localhost:3006/api/advisory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state: 'Maharashtra',
      district: 'Nashik',
      crop_type: 'Tomato',
      language: 'hi',
    }),
  });
  console.log('Status 1:', res1.status);
  const data1 = await res1.json();
  console.log('Location 1:', data1.district, data1.state);
  console.log('Weather 1:', data1.weather_snapshot.temperature_c + 'C', data1.weather_snapshot.humidity_percent + '% humidity', 'Rain risk:', data1.weather_snapshot.rain_probability_max + '%');
  console.log('Advisory 1:', data1.advisory_text);
  console.log('Audio 1 length:', data1.audio_base64?.length);

  console.log('\n--- Test 2: Hooghly, West Bengal (Potato, Bengali) ---');
  const res2 = await fetch('http://localhost:3006/api/advisory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state: 'West Bengal',
      district: 'Hooghly',
      crop_type: 'Potato',
      language: 'bn',
    }),
  });
  console.log('Status 2:', res2.status);
  const data2 = await res2.json();
  console.log('Location 2:', data2.district, data2.state);
  console.log('Weather 2:', data2.weather_snapshot.temperature_c + 'C', data2.weather_snapshot.humidity_percent + '% humidity');
  console.log('Advisory 2:', data2.advisory_text);
  console.log('Audio 2 length:', data2.audio_base64?.length);
}

testAdvisories().catch(console.error);
