import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AnomalousMatterHero } from '@/components/ui/anomalous-matter-hero'
import { Countdown } from '@/components/Countdown'

const DEFAULT_COLOR = '#ec4899'
const FALLBACK_PALETTE = ['#ec4899', '#f97316', '#a855f7', '#eab308', '#34d399', '#60a5fa']

const TRACKS = [
  { id: 'birthday', label: 'Birthday message', src: '/audio/birthday.mp3', cues: '/audio/birthday.cues.json' },
  { id: 'anniversary', label: 'Anniversary message', src: '/audio/anniversary.mp3', cues: '/audio/anniversary.cues.json' },
]

const BIRTHDAY = new Date('2026-08-01T00:00:00')
const ANNIVERSARY = new Date('2026-08-03T00:00:00')

export default function Home() {
  const audioRef = useRef(null)
  const cuesRef = useRef([])
  const activeCueIndexRef = useRef(-1)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loveColor, setLoveColor] = useState(DEFAULT_COLOR)
  const [audioMissing, setAudioMissing] = useState(false)

  const track = TRACKS[trackIndex]

  useEffect(() => {
    let cancelled = false
    activeCueIndexRef.current = -1
    fetch(track.cues)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) cuesRef.current = Array.isArray(data) ? data : []
      })
      .catch(() => {
        if (!cancelled) cuesRef.current = []
      })
    return () => {
      cancelled = true
    }
  }, [track.cues])

  // Gentle color drift so the scene feels alive before real cues exist.
  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      if (cuesRef.current.length > 0) return
      i = (i + 1) % FALLBACK_PALETTE.length
      setLoveColor(FALLBACK_PALETTE[i])
    }, 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const audioEl = audioRef.current
    if (!audioEl) return undefined

    const handleTimeUpdate = () => {
      const cues = cuesRef.current
      if (!cues.length) return
      let idx = -1
      for (let i = 0; i < cues.length; i++) {
        if (cues[i].time <= audioEl.currentTime) idx = i
        else break
      }
      if (idx !== -1 && idx !== activeCueIndexRef.current) {
        activeCueIndexRef.current = idx
        setLoveColor(cues[idx].color)
      }
    }
    const handleError = () => setAudioMissing(true)
    const handleCanPlay = () => setAudioMissing(false)

    audioEl.addEventListener('timeupdate', handleTimeUpdate)
    audioEl.addEventListener('error', handleError)
    audioEl.addEventListener('canplay', handleCanPlay)
    return () => {
      audioEl.removeEventListener('timeupdate', handleTimeUpdate)
      audioEl.removeEventListener('error', handleError)
      audioEl.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  const togglePlay = async () => {
    const audioEl = audioRef.current
    if (!audioEl) return
    try {
      if (isPlaying) {
        audioEl.pause()
        setIsPlaying(false)
      } else {
        await audioEl.play()
        setIsPlaying(true)
      }
    } catch {
      setAudioMissing(true)
    }
  }

  const selectTrack = (index) => {
    if (index === trackIndex) return
    audioRef.current?.pause()
    setIsPlaying(false)
    setTrackIndex(index)
  }

  return (
    <>
      <audio ref={audioRef} src={track.src} preload="none" />
      <AnomalousMatterHero
        eyebrow="Aug 1 · Birthday — Aug 3 · Anniversary"
        title="Eliana, this whole sky turns for you."
        description="A little corner of the internet that listens, glows, and remembers — built for the two days that matter most this year."
        audioRef={audioRef}
        loveColor={loveColor}
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Countdown label="Her birthday" targetDate={BIRTHDAY} />
          <Countdown label="Our anniversary" targetDate={ANNIVERSARY} />
        </div>
      </AnomalousMatterHero>

      <section className="relative z-20 bg-[hsl(var(--color-bg))] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-xl md:text-2xl">Press play, and watch it glow.</h2>
          <p className="mt-2 text-[hsl(var(--color-text-muted))] text-sm leading-relaxed">
            Every recording moves the particles with its sound, and shifts color each time it hears
            "love" — in whatever language it's said.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {TRACKS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTrack(i)}
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors duration-200 ${
                    i === trackIndex
                      ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/15%)] text-[hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <motion.button
              type="button"
              onClick={togglePlay}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="rounded-full bg-[hsl(var(--color-primary))] text-white px-8 py-3 text-sm font-semibold shadow-lg shadow-[hsl(var(--color-primary)/30%)]"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </motion.button>

            {audioMissing && (
              <p className="text-xs text-[hsl(var(--color-text-muted))] max-w-xs">
                No recording found yet at <code>{track.src}</code> — drop an MP3 there to bring this to
                life.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
