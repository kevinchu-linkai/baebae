import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { content } from '@/data/content'

const GRADIENTS = [
  'from-[hsl(var(--color-primary)/50%)] to-[hsl(var(--color-accent)/40%)]',
  'from-[hsl(var(--color-accent)/45%)] to-[hsl(var(--color-primary)/35%)]',
  'from-[hsl(var(--color-primary)/35%)] to-[hsl(var(--color-bg))]',
]

export function MemoryCards() {
  const [selected, setSelected] = useState(null)

  return (
    <section className="relative z-10 px-4 py-24">
      <div className="mx-auto max-w-3xl text-center mb-14">
        <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--color-primary)/85%)]">
          A trail of moments
        </p>
        <h2 className="mt-3 text-xl md:text-2xl">Tap one to open it</h2>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-5 md:grid-cols-3">
        {content.memories.map((memory, i) => (
          <motion.button
            key={memory.id}
            type="button"
            layoutId={`memory-${memory.id}`}
            onClick={() => setSelected(memory)}
            initial={{ opacity: 0, y: 24, rotate: i % 2 === 0 ? -2 : 2 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.03, rotate: 0 }}
            className="group relative aspect-[4/5] overflow-hidden rounded-xl border-4 border-[hsl(var(--color-surface))] shadow-lg text-left"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`} />
            {memory.photo && (
              <img src={memory.photo} alt={memory.caption} className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-[hsl(var(--color-surface)/90%)] px-3 py-2">
              <p className="text-xs font-medium text-[hsl(var(--color-text))]">{memory.caption}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              layoutId={`memory-${selected.id}`}
              className={`relative w-full max-w-md aspect-[4/5] overflow-hidden rounded-2xl border-8 border-[hsl(var(--color-surface))] bg-gradient-to-br ${GRADIENTS[selected.id % GRADIENTS.length]}`}
            >
              {selected.photo && (
                <img src={selected.photo} alt={selected.caption} className="absolute inset-0 h-full w-full object-cover" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-[hsl(var(--color-surface)/90%)] px-4 py-3">
                <p className="text-sm font-medium">{selected.caption}</p>
                <p className="text-xs text-[hsl(var(--color-text-muted))]">{selected.date}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
