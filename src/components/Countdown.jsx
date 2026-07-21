import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function getRemaining(targetDate) {
  const diff = Math.max(0, targetDate.getTime() - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds, done: diff === 0 }
}

const unitLabel = { days: '天', hours: '時', minutes: '分', seconds: '秒' }

export function Countdown({ label, targetDate }) {
  const [remaining, setRemaining] = useState(() => getRemaining(targetDate))

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface)/70%)] px-6 py-5 min-w-[220px]"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--color-text-muted))]">
        {label}
      </p>
      {remaining.done ? (
        <p className="mt-2 text-lg font-semibold text-[hsl(var(--color-primary))]">就是今天 ♥</p>
      ) : (
        <div className="mt-2 flex gap-3">
          {(['days', 'hours', 'minutes', 'seconds']).map((unit) => (
            <div key={unit} className="text-center">
              <div className="text-xl font-bold tabular-nums">{remaining[unit]}</div>
              <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--color-text-muted))]">
                {unitLabel[unit]}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
