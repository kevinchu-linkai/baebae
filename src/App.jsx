import { useEffect, useRef, useState } from 'react'
import { AmbientScene } from '@/components/AmbientScene'
import { FloatingAudioControl } from '@/components/FloatingAudioControl'
import { Intro } from '@/sections/Intro'
import { DualFrame } from '@/sections/DualFrame'
import { DualCities } from '@/sections/DualCities'
import { MemoryCards } from '@/sections/MemoryCards'
import { LoveList } from '@/sections/LoveList'
import { MiniGame } from '@/sections/MiniGame'
import { Letter } from '@/sections/Letter'
import { Finale } from '@/sections/Finale'

const DEFAULT_COLOR = '#ec4899'
const FALLBACK_PALETTE = ['#ec4899', '#f97316', '#a855f7', '#eab308', '#34d399', '#60a5fa']

const TRACKS = [
  { id: 'birthday', label: 'Birthday message', src: '/audio/birthday.m4a', cues: '/audio/birthday.cues.json' },
  { id: 'anniversary', label: 'Anniversary message', src: '/audio/anniversary.mp3', cues: '/audio/anniversary.cues.json' },
]

function App() {
  const audioRef = useRef(null)
  const cuesRef = useRef([])
  const activeCueIndexRef = useRef(-1)

  const [started, setStarted] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loveColor, setLoveColor] = useState(DEFAULT_COLOR)
  const [audioMissing, setAudioMissing] = useState(false)
  const [candlesBlown, setCandlesBlown] = useState(false)

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

  const play = async () => {
    try {
      await audioRef.current?.play()
      setIsPlaying(true)
    } catch {
      setAudioMissing(true)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      play()
    }
  }

  const selectTrack = (index) => {
    if (index === trackIndex) return
    audioRef.current?.pause()
    setIsPlaying(false)
    setTrackIndex(index)
  }

  const handleStart = () => {
    setStarted(true)
    play()
  }

  const handleReplay = () => {
    setCandlesBlown(false)
    setStarted(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <>
      <audio ref={audioRef} src={track.src} preload="none" loop />
      <AmbientScene audioRef={audioRef} loveColor={loveColor} />

      <Intro started={started} onStart={handleStart} />

      {started && (
        <main className="relative">
          <DualFrame />
          <DualCities />
          <MemoryCards />
          <LoveList />
          <MiniGame onUnlock={() => setCandlesBlown(true)} />
          <Letter unlocked={candlesBlown} />
          <Finale onReplay={handleReplay} />

          <FloatingAudioControl
            tracks={TRACKS}
            trackIndex={trackIndex}
            isPlaying={isPlaying}
            audioMissing={audioMissing}
            onToggle={togglePlay}
            onSelectTrack={selectTrack}
          />
        </main>
      )}
    </>
  )
}

export default App
