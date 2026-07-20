import { useEffect, useRef } from 'react'

const BAND_COUNT = 8

/**
 * Wires an <audio> element up to a Web Audio AnalyserNode and hands back
 * a ref you can read from inside a requestAnimationFrame loop — avoids
 * re-rendering React on every audio frame.
 */
export function useAudioAnalyser(audioRef) {
  const bandsRef = useRef(new Float32Array(BAND_COUNT))
  const levelRef = useRef(0)
  const setupDoneRef = useRef(false)

  useEffect(() => {
    const audioEl = audioRef.current
    if (!audioEl || setupDoneRef.current) return undefined

    let audioCtx
    let analyser
    let source
    let freqData

    const setup = () => {
      if (setupDoneRef.current) return
      setupDoneRef.current = true

      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.82
      freqData = new Uint8Array(analyser.frequencyBinCount)

      source = audioCtx.createMediaElementSource(audioEl)
      source.connect(analyser)
      analyser.connect(audioCtx.destination)
    }

    const resume = () => {
      if (!setupDoneRef.current) setup()
      if (audioCtx?.state === 'suspended') audioCtx.resume()
    }

    audioEl.addEventListener('play', resume)

    let frameId
    const tick = () => {
      if (analyser) {
        analyser.getByteFrequencyData(freqData)
        const binsPerBand = Math.floor(freqData.length / BAND_COUNT)
        let total = 0
        for (let b = 0; b < BAND_COUNT; b++) {
          let sum = 0
          for (let i = 0; i < binsPerBand; i++) {
            sum += freqData[b * binsPerBand + i]
          }
          const avg = sum / binsPerBand / 255
          bandsRef.current[b] = avg
          total += avg
        }
        levelRef.current = total / BAND_COUNT
      }
      frameId = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      audioEl.removeEventListener('play', resume)
      cancelAnimationFrame(frameId)
      source?.disconnect()
      analyser?.disconnect()
      audioCtx?.close()
      setupDoneRef.current = false
    }
  }, [audioRef])

  return { bandsRef, levelRef, bandCount: BAND_COUNT }
}
