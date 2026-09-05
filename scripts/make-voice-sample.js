const fs = require('fs');
const path = require('path');

function createSampleVoiceNote() {
  const sampleRate = 8000;
  const duration = 2; // seconds
  const numSamples = sampleRate * duration;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const val = Math.sin(2 * Math.PI * 300 * t) * 8000;
    buffer.writeInt16LE(Math.round(val), 44 + i * 2);
  }

  const outPath = path.join(__dirname, '..', 'test-assets', 'hindi_voice_note.wav');
  fs.writeFileSync(outPath, buffer);
  console.log('Created voice note:', outPath);
}

createSampleVoiceNote();
