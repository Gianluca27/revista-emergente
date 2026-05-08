import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getShows } from '../services/publications'
import { formatDate } from '../utils/formatDate'
import { resolveImageUrl } from '../utils/imageUrl'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

function ShowSkeleton() {
  return (
    <div className="aspect-[4/3] bg-gris animate-pulse" />
  )
}

function ShowCard({ show }) {
  return (
    <motion.div variants={itemVariants}>
      <Link to={`/shows/${show.slug}`} className="block relative aspect-[4/3] overflow-hidden group">
        <img
          src={resolveImageUrl(show.cover_image)}
          alt={show.title}
          className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-crema/60 group-hover:bg-crema/40 transition" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-rojo opacity-0 group-hover:opacity-100 transition" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="font-display text-negro uppercase text-xl group-hover:border-b-2 group-hover:border-rojo leading-tight pb-0.5 transition-all duration-200">
            {show.title}
          </h2>
          <p className="font-ui text-base text-negro/90 mt-1">
            {show.venue}
            {show.venue && show.event_date && ' — '}
            {show.event_date && formatDate(show.event_date)}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export default function ShowsPage() {
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getShows()
      .then((data) => {
        setShows(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setShows([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-crema text-negro">
      <header className="pt-24 pb-8 px-6">
        <h1
          className="font-display text-negro uppercase text-6xl sm:text-8xl leading-none tracking-tight glitch"
          data-text="SHOWS"
        >
          SHOWS
        </h1>
        <div className="mt-3 h-0.5 w-16 bg-rojo" />
      </header>

      <main className="px-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gris-mid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-crema">
                <ShowSkeleton />
              </div>
            ))}
          </div>
        ) : shows.length === 0 ? (
          <p className="font-mono text-negro/90 text-lg mt-8">
            No hay coberturas disponibles todavía.
          </p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gris-mid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {shows.map((show) => (
              <div key={show.id} className="bg-crema">
                <ShowCard show={show} />
              </div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}
