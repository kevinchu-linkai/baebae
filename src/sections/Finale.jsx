import { motion } from 'framer-motion'
import { content } from '@/data/content'

export function Finale({ onReplay }) {
  return (
    <section className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg text-xl md:text-2xl leading-snug"
      >
        {content.finale.line}
      </motion.p>
      <motion.button
        type="button"
        onClick={onReplay}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="mt-10 rounded-full border border-[hsl(var(--color-border))] px-8 py-3 text-sm font-medium text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors duration-200"
      >
        {content.finale.replayLabel}
      </motion.button>
    </section>
  )
}
