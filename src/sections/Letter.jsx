import { motion, AnimatePresence } from 'framer-motion'
import { content } from '@/data/content'

export function Letter({ unlocked }) {
  return (
    <section className="relative z-10 px-4 py-24">
      <div className="mx-auto max-w-xl text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--color-primary)/85%)]">
          {content.letter.heading}
        </p>
        {!unlocked && (
          <p className="mt-2 text-sm text-[hsl(var(--color-text-muted))]">{content.letter.lockedHint}</p>
        )}
      </div>

      <div className="relative mx-auto max-w-xl">
        <motion.div
          animate={{ filter: unlocked ? 'blur(0px)' : 'blur(14px)' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface)/60%)] px-6 py-10 md:px-10 space-y-5"
        >
          {content.letter.paragraphs.map((p, i) => (
            <p key={i} className="text-sm md:text-base leading-relaxed text-[hsl(var(--color-text))]">
              {p}
            </p>
          ))}
          <p className="pt-2 text-sm italic text-[hsl(var(--color-text-muted))]">{content.letter.signOff}</p>
        </motion.div>

        <AnimatePresence>
          {!unlocked && (
            <motion.div
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[hsl(var(--color-bg)/35%)]"
            >
              <span className="text-3xl">🔒</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
