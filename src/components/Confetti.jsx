import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#ec4899', '#f97316', '#eab308', '#a855f7', '#34d399', '#60a5fa']

export function Confetti({ active }) {
  const pieces = useMemo(() => {
    if (!active) return []
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 700,
      y: -(Math.random() * 400 + 150),
      rotate: Math.random() * 360,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.25,
    }))
    // Recompute a fresh burst every time `active` flips true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {pieces.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rotate }}
              transition={{ duration: 1.7, delay: p.delay, ease: 'easeOut' }}
              style={{
                background: p.color,
                position: 'absolute',
                top: '45%',
                left: '50%',
                width: 8,
                height: 14,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
