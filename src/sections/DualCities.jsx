import { motion } from 'framer-motion'
import { content } from '@/data/content'

function CityColumn({ city, notes, align }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: align === 'left' ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface)/55%)] p-6 md:p-8"
    >
      <p className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--color-primary)/85%)]">
        From {city}
      </p>
      <ul className="mt-5 space-y-4">
        {notes.map((note, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
            className="text-sm leading-relaxed text-[hsl(var(--color-text-muted))]"
          >
            {note}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}

export function DualCities() {
  return (
    <section className="relative z-10 px-4 py-24">
      <div className="mx-auto max-w-4xl text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--color-primary)/85%)]">
          Two cities, one story
        </p>
        <h2 className="mt-3 text-xl md:text-2xl">
          {content.cities.yours} and {content.cities.hers}
        </h2>
      </div>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 md:flex-row">
        <CityColumn city={content.cities.yours} notes={content.dualCities.yours} align="left" />
        <CityColumn city={content.cities.hers} notes={content.dualCities.hers} align="right" />
      </div>
    </section>
  )
}
