import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'

const NAV = [
  { label: 'Dashboard',     path: '/admin/dashboard',     mark: '◆' },
  { label: 'Publicaciones', path: '/admin/publicaciones', mark: '▬' },
  { label: 'Artistas',      path: '/admin/artistas',      mark: '◈' },
  { label: 'Equipo',        path: '/admin/equipo',        mark: '◐' },
  { label: 'Shows',         path: '/admin/shows',         mark: '◎' },
  { label: 'Mensajes',      path: '/admin/contacto',      mark: '◻' },
]

function navClass({ isActive }) {
  return [
    'flex items-center gap-3 px-3 py-2.5 border-l-2',
    'font-ui text-xs uppercase tracking-[0.2em] transition-colors duration-150',
    isActive
      ? 'border-rojo text-rojo'
      : 'border-transparent text-negro/90 hover:text-negro hover:border-gris-mid',
  ].join(' ')
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const logout = useAuthStore(s => s.logout)
  const user = useAuthStore(s => s.user)

  async function handleLogout() {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-crema flex">

      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-gris-mid bg-gris fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-7 border-b border-gris-mid">
          <NavLink to="/admin/dashboard">
            <span className="font-grunge text-4xl text-rojo leading-none">RE</span>
            <p className="font-ui text-[9px] text-negro/90 uppercase tracking-[0.4em] mt-0.5">Admin</p>
          </NavLink>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <NavLink key={item.path} to={item.path} className={navClass}>
              <span className="text-[9px] opacity-50 shrink-0">{item.mark}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-5 border-t border-gris-mid">
          {user?.email && (
            <p className="font-mono text-[9px] text-negro/90 mb-3 truncate">{user.email}</p>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left font-ui text-[10px] text-negro/90 uppercase tracking-[0.2em] px-3 py-2.5 border border-gris-mid hover:border-rojo hover:text-rojo transition-colors duration-200"
          >
            ↪ Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Mobile topbar ────────────────────────────────────── */}
      <header className="lg:hidden fixed inset-x-0 top-0 z-40 h-14 bg-gris border-b border-gris-mid flex items-center justify-between px-5">
        <NavLink to="/admin/dashboard">
          <span className="font-grunge text-3xl text-rojo leading-none">RE</span>
        </NavLink>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
          className="font-ui text-[10px] text-negro/90 uppercase tracking-widest"
        >
          ☰ Menú
        </button>
      </header>

      {/* ── Mobile drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-crema/80 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-60 bg-gris border-r border-gris-mid flex flex-col"
            >
              <div className="px-6 py-6 border-b border-gris-mid flex items-center justify-between">
                <span className="font-grunge text-3xl text-rojo">RE</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Cerrar menú"
                  className="font-mono text-xs text-negro/90"
                >
                  ✕
                </button>
              </div>

              <nav className="flex-1 px-4 py-5 space-y-0.5 overflow-y-auto">
                {NAV.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                    className={navClass}
                  >
                    <span className="text-[9px] opacity-50 shrink-0">{item.mark}</span>
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="px-5 py-5 border-t border-gris-mid">
                {user?.email && (
                  <p className="font-mono text-[9px] text-negro/90 mb-3 truncate">{user.email}</p>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left font-ui text-[10px] text-negro/90 uppercase tracking-[0.2em] px-3 py-2.5 border border-gris-mid"
                >
                  ↪ Cerrar sesión
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 lg:ml-56 min-h-screen pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
