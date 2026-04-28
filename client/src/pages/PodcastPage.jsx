import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getPodcastEpisodes } from '../services/publications'

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

function EpisodeSkeleton() {
  return (
    <div className="flex items-center gap-6 px-6 py-5 border-b border-gris-mid animate-pulse">
      <div className="w-16 h-16 bg-gris flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-6 bg-gris w-1/2" />
        <div className="h-3 bg-gris w-3/4" />
      </div>
      <div className="w-16 h-4 bg-gris" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Episode row
// ---------------------------------------------------------------------------

function EpisodeRow({ episode }) {
  const num = String(episode.episode_number).padStart(2, '0')

  return (
    <motion.div
      variants={rowVariants}
      className="flex items-center gap-6 px-6 py-5 border-b border-gris-mid hover:bg-gris transition-colors"
    >
      {/* Episode number */}
      <span className="font-display text-rojo text-5xl sm:text-6xl leading-none flex-shrink-0 w-16 text-center select-none">
        {num}
      </span>

      {/* Center: title + description */}
      <div className="flex-1 min-w-0">
        <p className="font-display text-negro uppercase text-xl sm:text-2xl leading-tight truncate">
          {episode.title}
        </p>
        {episode.description && (
          <p className="font-mono text-base text-negro/90 mt-1 line-clamp-2 leading-relaxed">
            {episode.description}
          </p>
        )}
      </div>

      {/* Right: duration + links */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {episode.duration_min != null && (
          <span className="font-ui text-base text-negro/90 whitespace-nowrap">
            {episode.duration_min} MIN
          </span>
        )}
        <div className="flex items-center gap-3">
          {episode.youtube_url && (
            <a
              href={episode.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-negro/90 hover:text-rojo transition-colors"
            >
              <span className="font-ui text-base uppercase tracking-widest">YouTube</span>
            </a>
          )}
          {episode.spotify_url && (
            <a
              href={episode.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-negro/90 hover:text-rojo transition-colors"
            >
              <span className="font-ui text-base uppercase tracking-widest">Spotify</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPodcastEpisodes()
      .then(data => setEpisodes(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-crema text-negro">
      {/* Page header */}
      <header className="pt-24 pb-8 px-6">
        <h1
          className="font-display text-negro uppercase text-6xl sm:text-7xl leading-none tracking-tight glitch"
          data-text="PODCAST"
        >
          PODCAST
        </h1>
        <div className="mt-3 h-1 w-16 bg-rojo" />
      </header>

      {/* Episode list */}
      <section>
        {loading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <EpisodeSkeleton key={i} />
            ))}
          </>
        ) : episodes.length === 0 ? (
          <p className="font-mono text-negro/90 px-6 py-12 text-lg">
            No hay episodios disponibles todavía.
          </p>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {episodes.map(ep => (
              <EpisodeRow key={ep.id} episode={ep} />
            ))}
          </motion.div>
        )}
      </section>
    </main>
  )
}
