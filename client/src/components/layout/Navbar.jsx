import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const LINKS = [
  { to: '/entrevistas', label: 'Entrevistas' },
  { to: '/shows', label: 'Shows' },
  { to: '/podcast', label: 'Podcast' },
  { to: '/sobre-nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-crema/95 backdrop-blur-sm border-b border-negro/15'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-grunge text-3xl text-rojo hover:text-negro transition-colors duration-150 glitch"
          data-text="EMERGENTE"
          onClick={() => setMenuOpen(false)}
        >
          EMERGENTE
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `font-ui text-lg uppercase tracking-widest transition-colors duration-150 relative group ${
                    isActive ? 'text-rojo' : 'text-negro hover:text-rojo'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-0.5 bg-rojo transition-all duration-200 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span
            className={`block w-full h-0.5 bg-negro origin-center transition-transform duration-200 ${
              menuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-full h-0.5 bg-negro transition-opacity duration-200 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-full h-0.5 bg-negro origin-center transition-transform duration-200 ${
              menuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-crema border-b border-negro/15 overflow-hidden"
          >
            <ul className="px-6 py-8 flex flex-col gap-6">
              {LINKS.map(({ to, label }, i) => (
                <motion.li
                  key={to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <NavLink
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `font-display text-4xl uppercase tracking-wide transition-colors duration-150 ${
                        isActive ? 'text-rojo' : 'text-negro hover:text-rojo'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
