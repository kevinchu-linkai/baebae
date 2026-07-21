// Words meaning "love" (as a word or common phrase) across languages,
// each mapped to a color pulled from the romantic palette. Matching is
// case-insensitive substring matching against transcribed words.
// Colors are hex so they can be fed straight into THREE.Color.
export const LOVE_WORDS = [
  { word: 'love', lang: 'English', color: '#ec4899' },
  { word: 'amor', lang: 'Spanish', color: '#f97316' },
  { word: 'amour', lang: 'French', color: '#a855f7' },
  { word: "t'aime", lang: 'French', color: '#a855f7' },
  { word: 'liebe', lang: 'German', color: '#eab308' },
  { word: 'amore', lang: 'Italian', color: '#f43f5e' },
  { word: 'amo', lang: 'Italian', color: '#f43f5e' },
  { word: 'te amo', lang: 'Spanish', color: '#f97316' },
  { word: 'aimer', lang: 'French', color: '#a855f7' },
  { word: 'paixao', lang: 'Portuguese', color: '#22d3ee' },
  { word: 'amo-te', lang: 'Portuguese', color: '#22d3ee' },
  { word: 'lyubov', lang: 'Russian', color: '#84cc16' },
  { word: 'любовь', lang: 'Russian', color: '#84cc16' },
  { word: 'ai', lang: 'Mandarin', color: '#38bdf8' },
  { word: '愛', lang: 'Mandarin', color: '#38bdf8' }, // Traditional
  { word: '爱', lang: 'Mandarin', color: '#38bdf8' }, // Simplified (Whisper often outputs this even for zh-Hant speech)
  { word: 'sarang', lang: 'Korean', color: '#fb7185' },
  { word: '사랑', lang: 'Korean', color: '#fb7185' },
  { word: 'ai suru', lang: 'Japanese', color: '#facc15' },
  { word: '愛してる', lang: 'Japanese', color: '#facc15' },
  { word: 'pyaar', lang: 'Hindi', color: '#fb923c' },
  { word: 'prem', lang: 'Hindi', color: '#fb923c' },
  { word: 'hubb', lang: 'Arabic', color: '#34d399' },
  { word: 'حب', lang: 'Arabic', color: '#34d399' },
  { word: 'ahava', lang: 'Hebrew', color: '#60a5fa' },
  { word: 'אהבה', lang: 'Hebrew', color: '#60a5fa' },
]

export function findLoveWordMatch(token) {
  const clean = token.toLowerCase().replace(/[.,!?;:"']/g, '').trim()
  if (!clean) return null
  return LOVE_WORDS.find(
    (entry) => clean === entry.word.toLowerCase() || clean.includes(entry.word.toLowerCase()),
  )
}
