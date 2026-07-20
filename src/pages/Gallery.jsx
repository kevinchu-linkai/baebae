import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Drop real photos into public/gallery/ and replace `src: null` below with
// e.g. src: '/gallery/01.jpg'. `span` controls the tile's footprint in the
// masonry-style grid so the layout stays asymmetric, not a uniform grid.
const PHOTOS = [
  { id: 1, caption: 'First hello', src: null, span: 'md:row-span-2' },
  { id: 2, caption: 'That trip', src: null, span: '' },
  { id: 3, caption: 'Her laugh', src: null, span: 'md:col-span-2' },
  { id: 4, caption: 'Quiet mornings', src: null, span: '' },
  { id: 5, caption: 'A year of us', src: null, span: 'md:row-span-2' },
  { id: 6, caption: 'Somewhere new', src: null, span: '' },
]

const GRADIENTS = [
  'from-[hsl(var(--color-primary)/50%)] to-[hsl(var(--color-accent)/40%)]',
  'from-[hsl(var(--color-accent)/45%)] to-[hsl(var(--color-primary)/35%)]',
  'from-[hsl(var(--color-primary)/35%)] to-[hsl(var(--color-bg))]',
]

export default function Gallery() {
  const [selected, setSelected] = useState(null)

  return (
    <section className="min-h-screen bg-[hsl(var(--color-bg))] px-4 pt-32 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-3xl text-center mb-14"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--color-primary)/85%)]">
          Every last one
        </p>
        <h1 className="mt-3 text-2xl md:text-3xl">A trail of moments</h1>
        <p className="mt-3 text-sm text-[hsl(var(--color-text-muted))]">
          Placeholder tiles for now — drop photos into{' '}
          <code className="text-[hsl(var(--color-text))]">public/gallery/</code> and wire up their{' '}
          <code className="text-[hsl(var(--color-text))]">src</code> in{' '}
          <code className="text-[hsl(var(--color-text))]">src/pages/Gallery.jsx</code>.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-5xl auto-rows-[160px] grid-cols-2 gap-4 md:grid-cols-4">
        {PHOTOS.map((photo, i) => (
          <motion.button
            key={photo.id}
            type="button"
            layoutId={`photo-${photo.id}`}
            onClick={() => setSelected(photo)}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: (i % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            className={`group relative overflow-hidden rounded-2xl border border-[hsl(var(--color-border))] text-left ${photo.span}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} transition-transform duration-500 group-hover:scale-110`}
            />
            {photo.src && (
              <img
                src={photo.src}
                alt={photo.caption}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="absolute bottom-3 left-4 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {photo.caption}
            </span>
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
              layoutId={`photo-${selected.id}`}
              className={`relative w-full max-w-2xl aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br ${GRADIENTS[selected.id % GRADIENTS.length]}`}
            >
              {selected.src && (
                <img
                  src={selected.src}
                  alt={selected.caption}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <span className="absolute bottom-5 left-6 text-lg font-medium text-white">
                {selected.caption}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
