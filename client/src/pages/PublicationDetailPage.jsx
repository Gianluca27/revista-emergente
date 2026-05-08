import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ArtistBlock from '../components/sections/ArtistBlock'
import Badge from '../components/ui/Badge'
import PublicationCard from '../components/ui/PublicationCard'
import { formatDate } from '../utils/formatDate'
import { resolveImageUrl } from '../utils/imageUrl'
import { getPublicationBySlug, getPublications } from '../services/publications'

/* ─── animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── skeleton ───────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="min-h-screen bg-crema animate-pulse">
      {/* cover skeleton */}
      <div className="w-full h-[60vh] bg-gris" />
      {/* header skeleton */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        <div className="h-4 bg-gris-mid rounded w-24" />
        <div className="h-3 bg-gris-mid rounded w-32" />
        <div className="h-16 bg-gris-mid rounded w-3/4" />
        <div className="h-3 bg-gris-mid rounded w-1/2" />
        <div className="h-[2px] bg-rojo w-16" />
      </div>
      {/* body skeleton */}
      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gris-mid rounded"
            style={{ width: `${70 + Math.random() * 30}%` }}
          />
        ))}
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
        Esta entrevista no existe o ya no está disponible.
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

/* ─── cover image ────────────────────────────────────────── */
function CoverImage({ src, alt }) {
  return (
    <div className="relative w-full h-[60vh] overflow-hidden bg-crema flex items-center justify-center">
      {src ? (
        <div className="max-w-3xl w-full h-full px-6 flex items-center justify-center">
          <img
            src={src}
            alt={alt}
            className="w-full max-h-full object-contain"
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-crema">
          <span className="font-display text-[12rem] text-negro/90 leading-none select-none">
            R
          </span>
        </div>
      )}
      {/* subtle bottom fade into page bg */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-crema to-transparent" />
    </div>
  )
}

/* ─── article header ─────────────────────────────────────── */
function ArticleHeader({ publication }) {
  const categoryName =
    publication.category?.name ?? publication.category_name ?? null

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto px-6 pt-10 pb-8"
    >
      {/* category + date row */}
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-3">
        {categoryName && <Badge>{categoryName}</Badge>}
        {publication.published_at && (
          <span className="font-ui text-base text-negro/90 uppercase tracking-widest">
            {formatDate(publication.published_at)}
          </span>
        )}
      </motion.div>

      {/* title */}
      <motion.h1
        variants={fadeUp}
        className="font-display text-5xl sm:text-7xl text-negro uppercase leading-none"
      >
        {publication.title}
      </motion.h1>

      {/* subtitle */}
      {publication.subtitle && (
        <motion.p
          variants={fadeUp}
          className="font-mono text-lg text-negro/90 mt-3 leading-relaxed"
        >
          {publication.subtitle}
        </motion.p>
      )}

      {/* red accent line */}
      <motion.div variants={fadeUp} className="mt-5 h-[2px] w-16 bg-rojo" />
    </motion.div>
  )
}

/* ─── body HTML content ──────────────────────────────────── */
function ArticleBody({ html }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto px-6 pb-16"
    >
      <div
        className="prose-dark"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </motion.div>
  )
}

/* ─── "más entrevistas" section ──────────────────────────── */
function MasEntrevistas({ currentSlug }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getPublications({ limit: 6 })
      .then(data => {
        if (!isMounted) return
        const all = Array.isArray(data) ? data : data.data ?? []
        setItems(all.filter(p => p.slug !== currentSlug).slice(0, 3))
      })
      .catch(() => { if (isMounted) setItems([]) })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [currentSlug])

  if (!loading && items.length === 0) return null

  return (
    <section className="bg-crema border-t border-gris-mid px-6 sm:px-10 py-14">
      {/* section heading */}
      <div className="mb-8">
        <p className="font-ui text-base tracking-[0.25em] text-rojo uppercase mb-2">
          — Seguir leyendo
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-negro uppercase leading-none">
          Más entrevistas
        </h2>
        <div className="mt-2 h-[2px] w-16 bg-rojo" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gris-mid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-crema animate-pulse">
              <div className="aspect-[3/2] bg-gris" />
              <div className="p-4 space-y-2 border-t border-gris-mid">
                <div className="h-3 bg-gris-mid rounded w-1/4" />
                <div className="h-5 bg-gris-mid rounded w-3/4" />
                <div className="h-3 bg-gris-mid rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gris-mid"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {items.map(pub => (
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
export default function PublicationDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [publication, setPublication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setPublication(null)

    getPublicationBySlug(slug)
      .then(data => {
        // API may wrap data
        const pub = data?.data ?? data
        if (!pub || !pub.id) {
          setError(true)
          return
        }
        setPublication(pub)
      })
      .catch(err => {
        const status = err?.response?.status
        if (status === 404 || status === 403) {
          navigate('/404', { replace: true })
        } else {
          setError(true)
        }
      })
      .finally(() => setLoading(false))
  }, [slug, navigate])

  if (loading) return <Skeleton />
  if (error || !publication) return <ErrorState />

  return (
    <div className="min-h-screen bg-crema">
      {/* 1. Cover image */}
      <CoverImage src={resolveImageUrl(publication.cover_image)} alt={publication.title} />

      {/* 2. Article header */}
      <ArticleHeader publication={publication} />

      {/* 3. Body HTML */}
      {publication.body && <ArticleBody html={publication.body} />}

      {/* 4. Artist block */}
      {publication.artists && publication.artists.length > 0 && (
        <ArtistBlock artists={publication.artists} />
      )}

      {/* 5. More publications */}
      <MasEntrevistas currentSlug={slug} />
    </div>
  )
}
