#!/usr/bin/env node
// Offline, automatic "love word" cue detection.
//
// Browsers can't run speech recognition on a pre-recorded audio file during
// playback (Web Speech API only listens to a live microphone), so this runs
// once, locally, ahead of time: it transcribes the recording with a local
// multilingual Whisper model (no API key, no network calls except the
// one-time model download), finds every occurrence of "love" across
// languages (see src/data/loveWords.js), and writes out timestamped color
// cues that the site reads during playback.
//
// Usage:
//   npm run detect-love-words -- public/audio/birthday.mp3
//   (writes public/audio/birthday.cues.json alongside it)
//
// Requires ffmpeg on PATH (brew install ffmpeg) to decode the mp3.

import { pipeline } from '@huggingface/transformers'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { LOVE_WORDS } from '../src/data/loveWords.js'

// Whisper's own language auto-detection isn't reliable in this pipeline (it
// silently defaults to English), so instead we transcribe the same audio
// once per language present in the dictionary and keep whatever matches
// come out of each pass — this is what actually catches a language switch
// mid-recording.
const WHISPER_LANGUAGE_CODE = {
  English: 'english',
  Spanish: 'spanish',
  French: 'french',
  German: 'german',
  Italian: 'italian',
  Portuguese: 'portuguese',
  Russian: 'russian',
  Mandarin: 'chinese',
  Korean: 'korean',
  Japanese: 'japanese',
  Hindi: 'hindi',
  Arabic: 'arabic',
  Hebrew: 'hebrew',
}

const [, , inputPath, outputPathArg] = process.argv

if (!inputPath) {
  console.error('Usage: npm run detect-love-words -- <path/to/recording.mp3> [output.cues.json]')
  process.exit(1)
}

function convertToWav(mp3Path) {
  const dir = mkdtempSync(path.join(tmpdir(), 'love-detect-'))
  const wavPath = path.join(dir, 'audio.wav')
  const result = spawnSync(
    'ffmpeg',
    ['-y', '-i', mp3Path, '-ar', '16000', '-ac', '1', '-f', 'wav', wavPath],
    { stdio: 'inherit' },
  )
  if (result.status !== 0) {
    throw new Error('ffmpeg conversion failed — is ffmpeg installed? Try: brew install ffmpeg')
  }
  return wavPath
}

function readWavAsFloat32(wavPath) {
  const buffer = readFileSync(wavPath)
  let offset = 12
  let dataOffset = -1
  let dataSize = 0
  while (offset < buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4)
    const chunkSize = buffer.readUInt32LE(offset + 4)
    if (chunkId === 'data') {
      dataOffset = offset + 8
      dataSize = chunkSize
      break
    }
    offset += 8 + chunkSize + (chunkSize % 2)
  }
  if (dataOffset === -1) throw new Error('Could not find WAV data chunk')
  const samples = new Float32Array(dataSize / 2)
  for (let i = 0; i < samples.length; i++) {
    samples[i] = buffer.readInt16LE(dataOffset + i * 2) / 32768
  }
  return samples
}

async function main() {
  console.log(`Converting ${inputPath} to 16kHz mono WAV...`)
  const wavPath = convertToWav(path.resolve(inputPath))
  const audio = readWavAsFloat32(wavPath)

  console.log('Loading multilingual Whisper (first run downloads the model, ~150-300MB)...')
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base')

  const languages = [...new Set(LOVE_WORDS.map((entry) => entry.lang))]
  const allCues = []

  for (const lang of languages) {
    const whisperLanguage = WHISPER_LANGUAGE_CODE[lang]
    if (!whisperLanguage) continue
    console.log(`Transcribing as ${lang}...`)
    const result = await transcriber(audio, {
      language: whisperLanguage,
      task: 'transcribe',
      return_timestamps: 'word',
      chunk_length_s: 6,
      stride_length_s: 1,
    })
    const chunks = result.chunks ?? []
    for (const chunk of chunks) {
      const clean = (chunk.text ?? '')
        .toLowerCase()
        .replace(/[.,!?;:"']/g, '')
        .trim()
      if (!clean) continue
      const match = LOVE_WORDS.find(
        (entry) =>
          entry.lang === lang &&
          (clean === entry.word.toLowerCase() || clean.includes(entry.word.toLowerCase())),
      )
      const start = chunk.timestamp?.[0]
      if (match && start != null) {
        allCues.push({ time: Number(start.toFixed(2)), word: match.word, lang: match.lang, color: match.color })
      }
    }
  }

  // Same moment can surface across more than one forced-language pass —
  // keep only the first cue within any 0.5s window.
  allCues.sort((a, b) => a.time - b.time)
  const cues = []
  for (const cue of allCues) {
    const prev = cues[cues.length - 1]
    if (prev && cue.time - prev.time < 0.5) continue
    cues.push(cue)
  }

  const outPath = outputPathArg
    ? path.resolve(outputPathArg)
    : path.resolve(path.dirname(inputPath), `${path.basename(inputPath, path.extname(inputPath))}.cues.json`)
  writeFileSync(outPath, JSON.stringify(cues, null, 2))
  console.log(`Found ${cues.length} love-word cue(s) across ${languages.length} languages checked. Wrote ${outPath}`)
  if (cues.length === 0) {
    console.log('No matches found — the site will fall back to a gentle automatic color drift.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
