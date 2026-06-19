import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(root, '../..');
const audioDir = join(root, 'audio');
const run = promisify(execFile);
const ffmpeg = '/opt/homebrew/bin/ffmpeg';
const ffprobe = '/opt/homebrew/bin/ffprobe';
const say = '/usr/bin/say';
const locale = process.argv[2] ?? 'fr';

const campaign = {
  fr: {
    voice: 'Thomas',
    rate: '180',
    video: join(projectRoot, 'public/assets/videos/photocalia-summer-campaign-fr.mp4'),
    text:
      'Cet ete, les dates arrivent de partout : examens, camps, voyages, festivals. ' +
      'Oubliez la saisie manuelle. Prenez une photo, PhotoCalia detecte les dates, ' +
      'les horaires et les lieux, puis organise tout dans votre agenda. ' +
      'PhotoCalia. Une photo. Tout votre ete dans votre agenda.',
  },
  en: {
    voice: 'Samantha',
    rate: '178',
    video: join(projectRoot, 'public/assets/videos/photocalia-summer-campaign-en.mp4'),
    text:
      'This summer, dates are coming from everywhere: exams, camps, trips, and festivals. ' +
      'Forget manual typing. Take a photo, and PhotoCalia detects the dates, times, and places, ' +
      'then organizes everything on your calendar. ' +
      'PhotoCalia. One photo. Your whole summer on your calendar.',
  },
};

if (!campaign[locale]) {
  throw new Error('Locale must be "fr" or "en".');
}

await mkdir(audioDir, { recursive: true });

const duration = Number(
  (
    await run(ffprobe, [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      campaign[locale].video,
    ])
  ).stdout.trim(),
);

const musicFile = join(audioDir, `${locale}-music.wav`);
const voiceFile = join(audioDir, `${locale}-voice.aiff`);
const mixedFile = join(audioDir, `${locale}-with-audio.mp4`);

await writeMusicWav(musicFile, duration);
await run(say, [
  '-v',
  campaign[locale].voice,
  '-r',
  campaign[locale].rate,
  '-o',
  voiceFile,
  campaign[locale].text,
]);

await run(ffmpeg, [
  '-y',
  '-i',
  campaign[locale].video,
  '-i',
  musicFile,
  '-i',
  voiceFile,
  '-filter_complex',
  [
    '[1:a]volume=0.23[music]',
    '[2:a]adelay=750|750,volume=1.35,apad[voice]',
    '[music][voice]amix=inputs=2:duration=first:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]',
  ].join(';'),
  '-map',
  '0:v:0',
  '-map',
  '[a]',
  '-c:v',
  'copy',
  '-c:a',
  'aac',
  '-b:a',
  '160k',
  '-movflags',
  '+faststart',
  '-shortest',
  mixedFile,
]);

await writeFile(campaign[locale].video, await readFile(mixedFile));
console.log(`Audio added: ${campaign[locale].video}`);

async function writeMusicWav(filePath, seconds) {
  const sampleRate = 48_000;
  const channels = 2;
  const bytesPerSample = 2;
  const totalSamples = Math.ceil(seconds * sampleRate);
  const data = Buffer.alloc(totalSamples * channels * bytesPerSample);
  const bpm = 110;
  const beat = 60 / bpm;
  const chords = [
    [196.0, 246.94, 329.63],
    [174.61, 220.0, 293.66],
    [207.65, 261.63, 349.23],
    [146.83, 196.0, 246.94],
  ];

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    const beatPosition = t / beat;
    const chord = chords[Math.floor(beatPosition / 4) % chords.length];
    const eighth = Math.floor(beatPosition * 2);
    const arpeggioFrequency = chord[eighth % chord.length] * (eighth % 4 === 3 ? 2 : 1);
    const beatPhase = beatPosition % 1;
    const eighthPhase = (beatPosition * 2) % 1;
    const padEnvelope = 0.5 + 0.5 * Math.sin(2 * Math.PI * t * 0.18);
    const pluckEnvelope = Math.exp(-eighthPhase * 7);
    const kickEnvelope = Math.exp(-beatPhase * 18);
    const snareBeat = Math.floor(beatPosition) % 4 === 1 || Math.floor(beatPosition) % 4 === 3;
    const snareEnvelope = snareBeat ? Math.exp(-beatPhase * 22) : 0;
    const hatEnvelope = Math.exp(-eighthPhase * 35);
    const noise = seededNoise(i);

    let sample = 0;
    for (const frequency of chord) {
      sample += 0.045 * padEnvelope * softSine(frequency, t);
      sample += 0.018 * softSine(frequency * 2, t + 0.004);
    }

    sample += 0.1 * pluckEnvelope * softSine(arpeggioFrequency, t);
    sample += 0.16 * kickEnvelope * softSine(54 - 20 * beatPhase, t);
    sample += 0.055 * snareEnvelope * noise;
    sample += 0.025 * hatEnvelope * noise;
    sample += 0.012 * Math.sin(2 * Math.PI * 0.08 * t);

    const fadeIn = Math.min(1, t / 1.2);
    const fadeOut = Math.min(1, (seconds - t) / 1.4);
    sample *= Math.max(0, Math.min(fadeIn, fadeOut));
    sample = Math.max(-0.82, Math.min(0.82, sample));

    const left = Math.round(sample * 32767);
    const right = Math.round(
      (sample * 0.94 + 0.02 * softSine(arpeggioFrequency * 1.005, t)) * 32767,
    );
    const offset = i * channels * bytesPerSample;
    data.writeInt16LE(left, offset);
    data.writeInt16LE(right, offset + 2);
  }

  const header = createWavHeader(data.length, sampleRate, channels, bytesPerSample);
  await writeFile(filePath, Buffer.concat([header, data]));
}

function softSine(frequency, time) {
  return Math.tanh(1.35 * Math.sin(2 * Math.PI * frequency * time));
}

function seededNoise(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function createWavHeader(dataSize, sampleRate, channels, bytesPerSample) {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * bytesPerSample;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(channels * bytesPerSample, 32);
  header.writeUInt16LE(bytesPerSample * 8, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  return header;
}
