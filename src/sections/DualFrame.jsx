import { motion } from 'framer-motion'
import { Countdown } from '@/components/Countdown'
import { content } from '@/data/content'

const BIRTHDAY = new Date('2026-08-01T00:00:00')
const ANNIVERSARY = new Date('2026-08-03T00:00:00')

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export function DualFrame() {
  return (
    <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="max-w-2xl"
      >
        <motion.p variants={item} className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--color-primary)/85%)]">
          Episode one
        </motion.p>
        <motion.h2 variants={item} className="mt-4 text-2xl md:text-4xl leading-snug">
          {content.dualFrame.heading}
        </motion.h2>
        <motion.p variants={item} className="mt-5 text-[hsl(var(--color-text-muted))] leading-relaxed">
          {content.dualFrame.body}
        </motion.p>
        <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Countdown label="Her birthday" targetDate={BIRTHDAY} />
          <Countdown label="Our anniversary" targetDate={ANNIVERSARY} />
        </motion.div>
      </motion.div>
    </section>
  )
}
