import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Confetti } from '@/components/Confetti'
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
              <span className="text-sm font-medium">{q.question}</span>
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
                  className="mt-2 text-sm text-[hsl(var(--color-text-muted))] overflow-hidden"
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

function Candle({ blown, onBlow, index }) {
  return (
    <button
      type="button"
      onClick={onBlow}
      disabled={blown}
      className="relative flex flex-col items-center"
      aria-label={`第 ${index + 1} 根蠟燭`}
    >
      <div className="h-8 w-6 flex items-center justify-center">
        <AnimatePresence>
          {!blown && (
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                scale: [1, 1.15, 0.95, 1],
                rotate: [0, -4, 4, 0],
              }}
              exit={{ opacity: 0, scale: 0, y: -10 }}
              transition={{
                scale: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' },
                exit: { duration: 0.3 },
              }}
              className="h-4 w-3 rounded-full bg-[hsl(var(--color-accent))]"
              style={{ boxShadow: '0 0 10px 2px hsl(var(--color-accent)/70%)' }}
            />
          )}
        </AnimatePresence>
      </div>
      <div className="h-10 w-3 rounded-sm bg-[hsl(var(--color-primary))]" />
    </button>
  )
}

function Cake({ onAllBlown }) {
  const [blown, setBlown] = useState(() => new Set())
  const total = content.cake.candleCount

  const blowCandle = (i) => {
    setBlown((prev) => {
      const next = new Set(prev)
      next.add(i)
      if (next.size === total) onAllBlown()
      return next
    })
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--color-primary)/85%)]">
        {content.cake.heading}
      </p>
      <p className="mt-2 text-sm text-[hsl(var(--color-text-muted))]">{content.cake.subheading}</p>

      <div className="mt-8 flex justify-center gap-3">
        {Array.from({ length: total }, (_, i) => (
          <Candle key={i} index={i} blown={blown.has(i)} onBlow={() => blowCandle(i)} />
        ))}
      </div>
      <div className="mx-auto mt-1 h-16 w-64 rounded-t-[40%] bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))]" />
      <div className="mx-auto h-6 w-72 rounded-b-xl bg-[hsl(var(--color-surface))] border border-t-0 border-[hsl(var(--color-border))]" />
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
