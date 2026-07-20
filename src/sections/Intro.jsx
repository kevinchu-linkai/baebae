import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { content } from '@/data/content'

function DodgeButton() {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const dodge = () => {
    setPos({
      x: (Math.random() - 0.5) * 180,
      y: (Math.random() - 0.5) * 60,
    })
  }

  return (
    <motion.button
      type="button"
      animate={{ x: pos.x, y: pos.y }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onMouseEnter={dodge}
      onTouchStart={dodge}
      className="rounded-full border border-[hsl(var(--color-border))] px-5 py-2 text-xs text-[hsl(var(--color-text-muted))]"
    >
      {content.intro.dodgeLabel}
    </motion.button>
  )
}

export function Intro({ started, onStart }) {
  return (
    <AnimatePresence>
      {!started && (
        <motion.section
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[hsl(var(--color-bg))] px-4 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs uppercase tracking-[0.35em] text-[hsl(var(--color-primary)/85%)]"
          >
            {content.intro.loaderLine}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-5 max-w-lg text-2xl md:text-3xl leading-snug"
          >
            {content.intro.tagline}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-col items-center gap-5"
          >
            <motion.button
              type="button"
              onClick={onStart}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="rounded-full bg-[hsl(var(--color-primary))] text-white px-10 py-3.5 text-sm font-semibold shadow-lg shadow-[hsl(var(--color-primary)/30%)]"
            >
              {content.intro.startLabel}
            </motion.button>
            <DodgeButton />
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
