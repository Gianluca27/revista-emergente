import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getArtistBySlug } from '../services/publications'
import PublicationCard from '../components/ui/PublicationCard'
import SkeletonCard from '../components/ui/SkeletonCard'

/* ─── animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── social links config ────────────────────────────────── */
const SOCIAL_LINKS = [
  { key: 'instagram_url', label: 'Instagram' },
  { key: 'spotify_url',   label: 'Spotify'   },
  { key: 'youtube_url',   label: 'YouTube'   },
  { key: 'soundcloud_url', label: 'SoundCloud' },
]

/* ─── loading skeleton ───────────────────────────────────── */
function Skeleton() {
  return (
    <div className="min-h-screen bg-crema animate-pulse">
      {/* header skeleton */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-12">
        <div className="flex flex-col sm:flex-row gap-10">
          {/* photo placeholder */}
          <div className="hidden sm:block flex-shrink-0 w-56 h-56 bg-gris" />
          {/* text column */}
          <div className="flex-1 space-y-4">
            <div className="h-3 bg-gris-mid rounded w-20" />
            <div className="h-16 bg-gris-mid rounded w-3/4" />
            <div className="h-[2px] bg-rojo w-16" />
            <div className="h-3 bg-gris-mid rounded w-full" />
            <div className="h-3 bg-gris-mid rounded w-5/6" />
            <div className="flex gap-4 pt-2">
              <div className="h-3 bg-gris-mid rounded w-16" />
              <div className="h-3 bg-gris-mid rounded w-16" />
            </div>
          </div>
        </div>
      </div>
      {/* grid skeleton */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="h-8 bg-gris-mid rounded w-32 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gris-mid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-crema">
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── error / 404 state ──────────────────────────────────── */
function ErrorState() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center gap-6">
      <p className="font-display text-7xl text-rojo uppercase">404</p>
      <p className="font-mono text-lg text-negro/90">
        Este artista no existe o ya no está disponible.
      </p>
      <Link
        to="/entrevistas"
        className="font-ui text-base uppercase tracking-widest px-5 py-2 border border-gris-mid text-negro hover:border-rojo hover:text-rojo transition-colors duration-150"
      >
        ← Volver a entrevistas
      </Link>
    </div>
  )
}

/* ─── artist profile header ──────────────────────────────── */
function ArtistHeader({ artist }) {
  const socials = SOCIAL_LINKS.filter(s => artist[s.key])

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto px-6 pt-24 pb-12 border-b border-gris-mid"
    >
      <div className="flex flex-col sm:flex-row gap-10 items-start">
        {/* photo — hidden on mobile, visible sm+ */}
        {artist.photo && (
          <motion.div
            variants={fadeUp}
            className="hidden sm:block flex-shrink-0"
          >
            <img
              src={artist.photo}
              alt={artist.name}
              className="w-56 h-56 object-cover grayscale"
              loading="lazy"
            />
          </motion.div>
        )}

        {/* text column */}
        <div className="flex-1 min-w-0">
          <motion.p
            variants={fadeUp}
            className="font-ui text-base tracking-[0.25em] text-rojo uppercase mb-3"
          >
            Artista
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-8xl text-negro uppercase leading-none"
          >
            {artist.name}
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="mt-4 h-[2px] w-16 bg-rojo"
          />

          {artist.bio && (
            <motion.p
              variants={fadeUp}
              className="font-mono text-lg text-negro/90 mt-4 leading-relaxed max-w-2xl"
            >
              {artist.bio}
            </motion.p>
          )}

          {socials.length > 0 && (
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-x-6 gap-y-2 mt-6"
            >
              {socials.map(({ key, label }) => (
                <a
                  key={key}
                  href={artist[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-ui text-base text-negro hover:text-rojo border-b border-gris-mid hover:border-rojo pb-px transition-colors duration-150 uppercase tracking-widest"
                >
                  {label}
                </a>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── publications grid section ──────────────────────────── */
function PublicationsSection({ publications }) {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12 pb-20">
      <div className="mb-8">
        <h2 className="font-display text-3xl sm:text-4xl text-negro uppercase leading-none">
          Entrevistas
        </h2>
        <div className="mt-2 h-[2px] w-16 bg-rojo" />
      </div>

      {publications.length === 0 ? (
        <p className="font-mono text-lg text-negro/90">
          No hay entrevistas disponibles todavía.
        </p>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gris-mid"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {publications.map(pub => (
            <motion.div key={pub.id} variants={cardVariants} className="bg-crema">
              <PublicationCard
                title={pub.title}
                subtitle={pub.subtitle}
                category={pub.category?.name ?? pub.category_name ?? null}
                coverImage={pub.cover_image}
                slug={pub.slug}
                date={pub.published_at}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  )
}

/* ─── main page ──────────────────────────────────────────── */
export default function ArtistPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(false)
    setArtist(null)

    getArtistBySlug(slug)
      .then(data => {
        if (!isMounted) return
        const record = data?.data ?? data
        if (!record || !record.id) { setError(true); return }
        setArtist(record)
      })
      .catch(err => {
        if (!isMounted) return
        const status = err?.response?.status
        if (status === 404) navigate('/entrevistas', { replace: true })
        else setError(true)
      })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [slug, navigate])

  if (loading) return <Skeleton />
  if (error || !artist) return <ErrorState />

  const publications = Array.isArray(artist.publications) ? artist.publications : []

  return (
    <div className="min-h-screen bg-crema text-negro">
      <ArtistHeader artist={artist} />
      <PublicationsSection publications={publications} />
    </div>
  )
}
