import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const SOCIAL_LINKS = [
  { key: 'instagram_url', label: 'Instagram' },
  { key: 'spotify_url',   label: 'Spotify'   },
  { key: 'youtube_url',   label: 'YouTube'   },
  { key: 'soundcloud_url',label: 'SoundCloud' },
]

function ArtistCard({ artist }) {
  const socialLinks = SOCIAL_LINKS.filter(({ key }) => artist[key])

  return (
    <motion.article
      variants={itemVariants}
      className="flex flex-col sm:flex-row gap-6 bg-gris border border-gris-mid p-6"
    >
      {/* Photo */}
      {artist.photo && (
        <div className="flex-shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 overflow-hidden border border-gris-mid">
            <img
              src={artist.photo}
              alt={artist.name}
              loading="lazy"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex flex-col gap-3 min-w-0">
        {/* Name */}
        <Link
          to={`/artistas/${artist.slug}`}
          className="font-display text-3xl sm:text-4xl text-blanco uppercase leading-none hover:text-rojo transition-colors duration-200 inline-block"
        >
          {artist.name}
        </Link>

        {/* Bio */}
        {artist.bio && (
          <p className="font-mono text-sm text-gris-mid leading-relaxed line-clamp-4">
            {artist.bio}
          </p>
        )}

        {/* Social links */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            {socialLinks.map(({ key, label }) => (
              <a
                key={key}
                href={artist[key]}
                target="_blank"
                rel="noopener noreferrer"
                className="font-ui text-xs tracking-widest uppercase text-gris-mid hover:text-rojo transition-colors duration-200 border-b border-gris-mid hover:border-rojo pb-px"
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  )
}

export default function ArtistBlock({ artists }) {
  if (!artists || artists.length === 0) return null

  const isPlural = artists.length > 1

  return (
    <section className="border-t border-gris-mid bg-negro px-6 sm:px-10 py-14">
      {/* Section heading */}
      <div className="mb-8">
        <p className="font-ui text-xs tracking-[0.25em] text-rojo uppercase mb-2">
          — {isPlural ? 'Artistas' : 'Artista'}
        </p>
        <div className="relative inline-block">
          <h2 className="font-display text-5xl sm:text-6xl text-blanco uppercase leading-none">
            {isPlural ? 'Artistas' : 'Artista'}
          </h2>
          {/* Red accent underline */}
          <div className="h-[3px] bg-rojo w-full mt-1" />
        </div>
      </div>

      {/* Artist cards */}
      <motion.div
        className="flex flex-col gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {artists.map((artist) => (
          <ArtistCard key={artist.id ?? artist.slug} artist={artist} />
        ))}
      </motion.div>
    </section>
  )
}
