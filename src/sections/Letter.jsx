import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { content } from '@/data/content'

const CHAR_MS = 34
const PUNCT_PAUSE_MS = 260
const PUNCTUATION = new Set(['。', ',', ',', '、', '!', '!', '?', '?', ';', ';', ':', ':', '.'])

const paragraphs = content.letter.paragraphs

export function Letter({ unlocked }) {
  const [lineIndex, setLineIndex] = useState(0)
  const [charCount, setCharCount] = useState(0)
  // 'typing' -> current line still being typed out
  // 'waiting' -> line finished, waiting for a click to continue
  // 'done'    -> every line finished, sign-off revealed
  const [phase, setPhase] = useState('typing')

  useEffect(() => {
    if (!unlocked) {
      setLineIndex(0)
      setCharCount(0)
      setPhase('typing')
    }
  }, [unlocked])

  useEffect(() => {
    if (!unlocked || phase !== 'typing') return undefined
    const line = paragraphs[lineIndex] ?? ''
    if (charCount >= line.length) {
      setPhase('waiting')
      return undefined
    }
    const nextChar = line[charCount]
    const delay = PUNCTUATION.has(nextChar) ? CHAR_MS + PUNCT_PAUSE_MS : CHAR_MS
    const id = setTimeout(() => setCharCount((c) => c + 1), delay)
    return () => clearTimeout(id)
  }, [unlocked, phase, charCount, lineIndex])

  const handleAdvance = () => {
    if (!unlocked) return
    if (phase === 'typing') {
      setCharCount(paragraphs[lineIndex].length)
      setPhase('waiting')
    } else if (phase === 'waiting') {
      if (lineIndex + 1 < paragraphs.length) {
        setLineIndex((i) => i + 1)
        setCharCount(0)
        setPhase('typing')
      } else {
        setPhase('done')
      }
    }
  }

  return (
    <section className="relative z-10 px-4 py-24">
      <div className="mx-auto max-w-xl text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--color-primary)/85%)]">
          {content.letter.heading}
        </p>
        {!unlocked && (
          <p className="mt-2 text-base text-[hsl(var(--color-text-muted))]">{content.letter.lockedHint}</p>
        )}
        {unlocked && phase === 'typing' && lineIndex === 0 && charCount === 0 && (
          <p className="mt-2 text-base text-[hsl(var(--color-text-muted))]">{content.letter.readHint}</p>
        )}
      </div>

      <div className="relative mx-auto max-w-xl">
        <motion.div
          role="button"
          tabIndex={0}
          onClick={handleAdvance}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleAdvance()
            }
          }}
          layout
          animate={{ filter: unlocked ? 'blur(0px)' : 'blur(14px)' }}
          transition={{ filter: { duration: 1, ease: 'easeOut' }, layout: { duration: 0.4, ease: 'easeOut' } }}
          className="block w-full cursor-pointer rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface)/60%)] px-6 py-10 text-left md:px-10 space-y-5"
        >
          {paragraphs.slice(0, lineIndex).map((p, i) => (
            <p key={i} className="text-base md:text-lg leading-relaxed text-[hsl(var(--color-text))]">
              {p}
            </p>
          ))}

          {unlocked && lineIndex < paragraphs.length && (
            <p className="text-base md:text-lg leading-relaxed text-[hsl(var(--color-text))]">
              {paragraphs[lineIndex].slice(0, charCount)}
              {phase === 'typing' && (
                <span className="ml-0.5 inline-block w-[2px] h-[1em] align-middle bg-[hsl(var(--color-primary))] animate-pulse" />
              )}
            </p>
          )}

          <AnimatePresence>
            {phase === 'done' && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="pt-2 text-base italic text-[hsl(var(--color-text-muted))]"
              >
                {content.letter.signOff}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {unlocked && phase === 'waiting' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="pt-2 text-sm text-[hsl(var(--color-primary)/85%)]"
              >
                點一下繼續 ↓
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {!unlocked && (
            <motion.div
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-[hsl(var(--color-bg)/35%)]"
            >
              <span className="text-3xl">🔒</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
