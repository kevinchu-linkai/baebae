import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Confetti } from '@/components/Confetti'
import { Candle } from '@/components/Candle'
import { content } from '@/data/content'

function Quiz() {
  const [revealed, setRevealed] = useState(() => new Set())

  const toggle = (i) => {
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--color-primary)/85%)]">
          猜猜我的答案
        </p>
        <h2 className="mt-3 text-xl md:text-2xl">一個不太公平的小測驗</h2>
      </div>
      <div className="space-y-3">
        {content.quiz.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
            className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface)/50%)] px-5 py-4"
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="text-base font-medium">{q.question}</span>
              <span className="text-xs text-[hsl(var(--color-primary))]">
                {revealed.has(i) ? '收起' : '看答案'}
              </span>
            </button>
            <AnimatePresence>
              {revealed.has(i) && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="mt-2 text-base text-[hsl(var(--color-text-muted))] overflow-hidden"
                >
                  {q.answer}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// All candles stay in a single row so they visually sit on one continuous
// cake surface — more candles just means each one gets thinner, not a new
// row (a grid that wraps reads as candles stacked in mid-air, not on a cake).
function candleScale(total) {
  if (total <= 6) return 1
  if (total <= 10) return 0.8
  if (total <= 16) return 0.6
  return 0.42
}

function Cake({ onAllBlown }) {
  const [blown, setBlown] = useState(() => new Set())
  const total = content.cake.candleCount
  const scale = candleScale(total)

  const blowCandle = (i) => {
    setBlown((prev) => {
      const next = new Set(prev)
      next.add(i)
      if (next.size === total) onAllBlown()
      return next
    })
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-[hsl(var(--color-primary)/85%)]">
        {content.cake.heading}
      </p>
      <p className="mt-2 text-base text-[hsl(var(--color-text-muted))]">{content.cake.subheading}</p>

      {/* Scales the whole candle+cake group down on narrow screens so a
          single unbroken row of candles never overflows or wraps. */}
      <div className="mx-auto mt-6 w-fit origin-top scale-[0.55] sm:scale-75 md:scale-100">
        <div className="flex items-end justify-center gap-px">
          {Array.from({ length: total }, (_, i) => (
            <Candle key={i} index={i} scale={scale} blown={blown.has(i)} onBlow={() => blowCandle(i)} />
          ))}
        </div>

        {/* Single wide tier the candles actually stand on, plus a base for weight */}
        <div className="mx-auto -mt-2 h-14 w-[36rem] rounded-t-[2.5rem] bg-gradient-to-b from-[hsl(var(--color-surface))] to-[hsl(var(--color-surface)/70%)] border border-[hsl(var(--color-border))]" />
        <div className="mx-auto h-10 w-[40rem] rounded-b-2xl bg-gradient-to-b from-[hsl(var(--color-surface))] to-[hsl(var(--color-surface)/55%)] border border-t-0 border-[hsl(var(--color-border))]" />
        <div className="mx-auto h-3 w-[42rem] rounded-full bg-[hsl(var(--color-border)/40%)] blur-sm" />
      </div>
    </div>
  )
}

export function MiniGame({ onUnlock }) {
  const [confettiActive, setConfettiActive] = useState(false)

  useEffect(() => {
    if (!confettiActive) return undefined
    const id = setTimeout(() => setConfettiActive(false), 2200)
    return () => clearTimeout(id)
  }, [confettiActive])

  const handleAllBlown = () => {
    setConfettiActive(true)
    onUnlock()
  }

  return (
    <section className="relative z-10 px-4 py-24 space-y-20">
      <Quiz />
      <Cake onAllBlown={handleAllBlown} />
      <Confetti active={confettiActive} />
    </section>
  )
}
