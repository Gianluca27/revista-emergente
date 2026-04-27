import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'

function StatCard({ to, label, value, accent, hint, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <Link
        to={to}
        className={[
          'block group border bg-gris/40 px-5 py-6 transition-colors duration-150',
          accent ? 'border-rojo/60 hover:border-rojo' : 'border-gris-mid hover:border-blanco/40',
        ].join(' ')}
      >
        <p className="font-ui text-[9px] uppercase tracking-[0.3em] text-gris-mid mb-3">{label}</p>
        <p className={[
          'font-display text-6xl leading-none tracking-wide',
          accent ? 'text-rojo' : 'text-blanco',
        ].join(' ')}>
          {value === null ? '—' : value}
        </p>
        {hint && (
          <p className="font-mono text-[10px] text-gris-mid mt-3">{hint}</p>
        )}
      </Link>
    </motion.div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const [stats, setStats] = useState({
    pubsTotal: null,
    pubsDraft: null,
    pubsPublished: null,
    artists: null,
    podcast: null,
    shows: null,
    contactsPending: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [allPubs, drafts, published, artists, podcast, shows, pending] = await Promise.all([
          api.get('/admin/publications', { params: { limit: 1 } }),
          api.get('/admin/publications', { params: { status: 'draft', limit: 1 } }),
          api.get('/admin/publications', { params: { status: 'published', limit: 1 } }),
          api.get('/artists'),
          api.get('/admin/podcast'),
          api.get('/admin/shows'),
          api.get('/admin/contact', { params: { status: 'pending' } }),
        ])
        if (cancelled) return
        setStats({
          pubsTotal:     allPubs.data.pagination?.total ?? 0,
          pubsDraft:     drafts.data.pagination?.total ?? 0,
          pubsPublished: published.data.pagination?.total ?? 0,
          artists:       artists.data.length,
          podcast:       podcast.data.length,
          shows:         shows.data.length,
          contactsPending: pending.data.length,
        })
      } catch {
        // 401 → interceptor handles redirect
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="px-6 py-8 max-w-6xl">

      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[11px] text-gris-mid mb-1">
          {user?.email && <>Hola, <span className="text-blanco">{user.email}</span></>}
        </p>
        <h1 className="font-display text-5xl sm:text-6xl text-blanco tracking-wide leading-none">
          DASHBOARD
        </h1>
        <p className="font-mono text-[11px] text-gris-mid mt-3 max-w-md">
          Estado del sitio en un vistazo. Todo lo que necesitás está en el menú lateral.
        </p>
      </div>

      {/* Pending contacts banner */}
      {stats.contactsPending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 border border-rojo bg-rojo/10 px-5 py-4 flex items-center justify-between gap-4"
        >
          <div>
            <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-rojo mb-1">
              Mensajes nuevos
            </p>
            <p className="font-mono text-[12px] text-blanco">
              Hay {stats.contactsPending} {stats.contactsPending === 1 ? 'mensaje sin leer' : 'mensajes sin leer'} en la bandeja.
            </p>
          </div>
          <Link
            to="/admin/contacto"
            className="font-ui text-[10px] uppercase tracking-[0.25em] text-blanco border border-rojo px-3 py-2 hover:bg-rojo transition-colors duration-150 shrink-0"
          >
            Ver bandeja →
          </Link>
        </motion.div>
      )}

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          to="/admin/publicaciones"
          label="Publicaciones"
          value={loading ? null : stats.pubsTotal}
          hint={loading ? 'Cargando…' : `${stats.pubsPublished} publicadas · ${stats.pubsDraft} en borrador`}
          delay={0}
        />
        <StatCard
          to="/admin/publicaciones"
          label="Borradores"
          value={loading ? null : stats.pubsDraft}
          hint={loading ? null : 'Esperando para publicar'}
          accent={stats.pubsDraft > 0}
          delay={0.05}
        />
        <StatCard
          to="/admin/contacto"
          label="Mensajes pendientes"
          value={loading ? null : stats.contactsPending}
          hint={loading ? null : stats.contactsPending === 0 ? 'Bandeja al día' : 'Click para revisar'}
          accent={stats.contactsPending > 0}
          delay={0.1}
        />
        <StatCard
          to="/admin/artistas"
          label="Artistas"
          value={loading ? null : stats.artists}
          hint={loading ? null : 'Perfiles cargados'}
          delay={0.15}
        />
        <StatCard
          to="/admin/podcast"
          label="Podcast"
          value={loading ? null : stats.podcast}
          hint={loading ? null : 'Episodios totales'}
          delay={0.2}
        />
        <StatCard
          to="/admin/shows"
          label="Shows"
          value={loading ? null : stats.shows}
          hint={loading ? null : 'Coberturas cargadas'}
          delay={0.25}
        />
      </div>

      {/* Quick actions */}
      <div className="mt-12">
        <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-gris-mid mb-4">
          Atajos
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/publicaciones/nueva"
            className="px-4 py-2.5 bg-rojo font-ui text-[11px] uppercase tracking-[0.25em] text-blanco hover:bg-red-800 transition-colors duration-150"
          >
            + Nueva publicación
          </Link>
          <Link
            to="/admin/artistas"
            className="px-4 py-2.5 border border-gris-mid font-ui text-[11px] uppercase tracking-[0.25em] text-gris-mid hover:border-blanco hover:text-blanco transition-colors duration-150"
          >
            + Cargar artista
          </Link>
          <Link
            to="/admin/podcast"
            className="px-4 py-2.5 border border-gris-mid font-ui text-[11px] uppercase tracking-[0.25em] text-gris-mid hover:border-blanco hover:text-blanco transition-colors duration-150"
          >
            + Episodio
          </Link>
          <Link
            to="/admin/shows"
            className="px-4 py-2.5 border border-gris-mid font-ui text-[11px] uppercase tracking-[0.25em] text-gris-mid hover:border-blanco hover:text-blanco transition-colors duration-150"
          >
            + Cobertura
          </Link>
        </div>
      </div>

      {/* Identity strip */}
      <div className="mt-12 pt-6 border-t border-gris-mid">
        <p className="font-display text-3xl text-rojo tracking-widest leading-none">REVISTA EMERGENTE</p>
        <p className="font-mono text-[10px] text-gris-mid mt-2">
          Punk · DIY · independiente — gestionando contenido desde {new Date().getFullYear()}.
        </p>
      </div>
    </div>
  )
}
