import { motion } from 'framer-motion'

export function FloatingAudioControl({
  tracks,
  trackIndex,
  isPlaying,
  audioMissing,
  onToggle,
  onSelectTrack,
}) {
  const track = tracks[trackIndex]

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {audioMissing && (
        <p className="max-w-[220px] rounded-lg bg-[hsl(var(--color-surface)/90%)] border border-[hsl(var(--color-border))] px-3 py-2 text-xs text-[hsl(var(--color-text-muted))]">
          還沒在 <code>{track.src}</code> 找到錄音檔。
        </p>
      )}
      <div className="flex items-center gap-2 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface)/70%)] backdrop-blur px-2 py-2">
        {tracks.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTrack(i)}
            title={t.label}
            className={`h-2 w-2 rounded-full transition-colors duration-200 ${
              i === trackIndex ? 'bg-[hsl(var(--color-primary))]' : 'bg-[hsl(var(--color-border))]'
            }`}
          />
        ))}
        <motion.button
          type="button"
          onClick={onToggle}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--color-primary))] text-white text-sm"
        >
          {isPlaying ? '❚❚' : '▶'}
        </motion.button>
      </div>
    </div>
  )
}
