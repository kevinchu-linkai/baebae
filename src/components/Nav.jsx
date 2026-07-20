import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const links = [
  { to: '/', label: 'Home' },
  { to: '/gallery', label: 'Gallery' },
]

export function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-30 flex justify-center pt-6 pointer-events-none">
      <div className="pointer-events-auto flex gap-1 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface)/60%)] backdrop-blur px-2 py-2">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'}>
            {({ isActive }) => (
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className={`inline-block rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-[hsl(var(--color-primary))] text-white'
                    : 'text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]'
                }`}
              >
                {link.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
