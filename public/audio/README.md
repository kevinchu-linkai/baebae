Drop your recordings here:

- `birthday.mp3` — plays on the "Birthday message" tab
- `anniversary.mp3` — plays on the "Anniversary message" tab

Then generate the color cues for each one (requires `ffmpeg` — `brew install ffmpeg`):

```
npm run detect-love-words -- public/audio/birthday.mp3
npm run detect-love-words -- public/audio/anniversary.mp3
```

Each run downloads a local speech-recognition model once (~150-300MB, cached
after that), transcribes the recording, finds every "love" word across
languages, and writes `birthday.cues.json` / `anniversary.cues.json` next to
the mp3. The site picks these up automatically — no code changes needed.

Until a cues file exists, the background gently cycles through the romantic
palette on its own, so the site still looks alive.
