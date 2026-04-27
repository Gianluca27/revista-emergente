import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getRecentShows } from '../../services/publications'

function ShowCard({ show, large = false }) {
  const image = show.cover_image || null

  return (
    <Link
      to={`/shows/${show.slug}`}
      className={`group relative overflow-hidden bg-gris block ${large ? 'h-[420px] sm:h-[520px]' : 'h-[200px] sm:h-[252px]'}`}
    >
      {image ? (
        <img
          src={image}
          alt={show.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-crema flex items-center justify-center">
          <span className="font-display text-negro/50 text-5xl">R</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-crema/90 via-crema/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-400" />

      {/* Title — slides up on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        {show.date && (
          <p className="font-ui text-[10px] tracking-[0.25em] text-rojo uppercase mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {show.date ? new Date(show.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'short' }) : ''}
          </p>
        )}
        <h3 className={`font-display text-negro uppercase leading-tight ${large ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
          {show.title}
        </h3>
        {show.venue && (
          <p className="font-mono text-xs text-negro/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
            {show.venue}
          </p>
        )}
      </div>

      {/* Red corner accent */}
      <div className="absolute top-3 right-3 w-2 h-2 bg-rojo opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </Link>
  )
}

export default function RecentShows() {
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRecentShows({ limit: 3 })
      .then(data => setShows(Array.isArray(data) ? data : data.shows ?? []))
      .catch(() => setShows([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && shows.length === 0) return null

  return (
    <section className="px-6 sm:px-10 py-20 bg-crema">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="font-ui text-xs tracking-[0.25em] text-rojo uppercase mb-2">
            — En vivo
          </p>
          <h2
            className="font-display text-5xl sm:text-6xl text-negro uppercase leading-none glitch"
            data-text="Coberturas"
          >
            Coberturas
          </h2>
        </div>
        <Link
          to="/shows"
          className="hidden sm:inline-flex font-ui text-xs tracking-widest uppercase text-negro/50 hover:text-rojo transition-colors duration-200 pb-1 border-b border-gris-mid hover:border-rojo"
        >
          Ver todas →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gris-mid">
          <div className="bg-crema h-[420px] animate-pulse" />
          <div className="grid grid-rows-2 gap-px bg-gris-mid">
            <div className="bg-crema animate-pulse" />
            <div className="bg-crema animate-pulse" />
          </div>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gris-mid"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Large card — first show */}
          <div className="bg-crema">
            {shows[0] && <ShowCard show={shows[0]} large />}
          </div>

          {/* Two stacked small cards */}
          <div className="grid grid-rows-2 gap-px bg-gris-mid">
            <div className="bg-crema">
              {shows[1] && <ShowCard show={shows[1]} />}
            </div>
            <div className="bg-crema">
              {shows[2] && <ShowCard show={shows[2]} />}
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-8 sm:hidden text-center">
        <Link
          to="/shows"
          className="font-ui text-xs tracking-widest uppercase text-negro/50 hover:text-rojo transition-colors duration-200"
        >
          Ver todas las coberturas →
        </Link>
      </div>
    </section>
  )
}
