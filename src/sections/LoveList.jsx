import { motion } from 'framer-motion'
import { content } from '@/data/content'

export function LoveList() {
  return (
    <section className="relative z-10 px-4 py-24">
      <div className="mx-auto max-w-2xl text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--color-primary)/85%)]">
          今年
        </p>
        <h2 className="mt-3 text-xl md:text-2xl">關於妳,我愛的十件事</h2>
      </div>
      <ol className="mx-auto max-w-xl space-y-4">
        {content.loveList.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: (i % 5) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex gap-4 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface)/50%)] px-5 py-4"
          >
            <span className="text-[hsl(var(--color-primary))] font-semibold tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-sm leading-relaxed text-[hsl(var(--color-text-muted))]">{item}</span>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
