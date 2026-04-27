import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getLatestPodcastEpisodes } from '../../services/publications'

const MARQUEE_TEXT = 'EMERGENTE PODCAST — MÚSICA INDEPENDIENTE — CONVERSACIONES EN PROFUNDIDAD — '

function MarqueeTrack({ text, repeat = 4 }) {
  const content = Array.from({ length: repeat }, () => text).join('')
  return (
    <div className="overflow-hidden whitespace-nowrap py-3 border-t border-rojo/30">
      <div className="marquee-inner inline-block">
        <span className="font-display text-negro/80 text-lg sm:text-xl tracking-widest">
          {content}{content}
        </span>
      </div>
    </div>
  )
}

export default function PodcastBanner() {
  const [episode, setEpisode] = useState(null)

  useEffect(() => {
    getLatestPodcastEpisodes()
      .then(data => {
        const list = Array.isArray(data) ? data : data.episodes ?? []
        if (list.length > 0) setEpisode(list[0])
      })
      .catch(() => {})
  }, [])

  return (
    <motion.section
      className="bg-rojo overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
    >
      <MarqueeTrack text={MARQUEE_TEXT} />

      <div className="px-6 sm:px-10 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        {/* Left: episode info */}
        <div className="flex-1">
          <p className="font-ui text-xs tracking-[0.25em] text-negro/85 uppercase mb-3">
            Último episodio
          </p>
          {episode ? (
            <>
              <p className="font-ui text-xs text-negro/85 uppercase tracking-widest mb-1">
                EP. {episode.episode_number}
              </p>
              <h3 className="font-display text-3xl sm:text-4xl text-negro uppercase leading-tight">
                {episode.title}
              </h3>
              {episode.duration_min && (
                <p className="font-mono text-xs text-negro/85 mt-2">
                  {episode.duration_min} min
                </p>
              )}
            </>
          ) : (
            <h3 className="font-display text-3xl sm:text-4xl text-negro uppercase leading-tight">
              Emergente Podcast
            </h3>
          )}
        </div>

        {/* Right: CTA links */}
        <div className="flex flex-col gap-3">
          {episode?.youtube_url ? (
            <a
              href={episode.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 font-ui text-sm tracking-widest uppercase bg-crema text-negro px-6 py-3 hover:bg-crema/80 transition-colors duration-200"
            >
              Ver en YouTube →
            </a>
          ) : null}
          {episode?.spotify_url ? (
            <a
              href={episode.spotify_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 font-ui text-xs tracking-widest uppercase text-negro border border-negro/30 px-6 py-3 hover:bg-crema/10 transition-colors duration-200"
            >
              Escuchar en Spotify
            </a>
          ) : null}
          <Link
            to="/podcast"
            className="font-ui text-xs tracking-widest uppercase text-negro/85 hover:text-negro transition-colors duration-200"
          >
            Ver todos los episodios →
          </Link>
        </div>
      </div>

      <MarqueeTrack text={MARQUEE_TEXT} />
    </motion.section>
  )
}
