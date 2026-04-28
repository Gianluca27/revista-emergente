import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getShowBySlug } from '../services/publications'
import { formatDate } from '../utils/formatDate'
import Lightbox from '../components/ui/Lightbox'

/* ─── animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const photoVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── loading skeleton ───────────────────────────────────── */
function Skeleton() {
  return (
    <div className="min-h-screen bg-crema animate-pulse">
      {/* cover skeleton */}
      <div className="w-full h-[50vh] bg-gris" />
      {/* header skeleton */}
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-4">
        <div className="h-3 bg-gris-mid rounded w-40" />
        <div className="h-14 bg-gris-mid rounded w-2/3" />
        <div className="h-[2px] bg-rojo w-16" />
        <div className="h-3 bg-gris-mid rounded w-full" />
        <div className="h-3 bg-gris-mid rounded w-5/6" />
        <div className="h-3 bg-gris-mid rounded w-4/6" />
      </div>
      {/* gallery skeleton */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="h-8 bg-gris-mid rounded w-24 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gris-mid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-crema aspect-square bg-gris" />
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
        Este show no existe o ya no está disponible.
      </p>
      <Link
        to="/shows"
        className="font-ui text-base uppercase tracking-widest px-5 py-2 border border-gris-mid text-negro hover:border-rojo hover:text-rojo transition-colors duration-150"
      >
        ← Volver a shows
      </Link>
    </div>
  )
}

/* ─── cover image ────────────────────────────────────────── */
function CoverImage({ src, alt }) {
  return (
    <div className="relative w-full h-[50vh] overflow-hidden bg-gris">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-crema flex items-center justify-center">
          <span className="font-display text-[12rem] text-negro/90 leading-none select-none">
            R
          </span>
        </div>
      )}
      {/* dark gradient overlay at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-crema via-crema/30 to-transparent" />
    </div>
  )
}

/* ─── show header ────────────────────────────────────────── */
function ShowHeader({ show }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto px-6 pt-10 pb-8"
    >
      {/* date + venue row */}
      <motion.p variants={fadeUp} className="font-ui text-base text-negro/90 uppercase tracking-widest mb-3">
        {show.event_date && formatDate(show.event_date)}
        {show.event_date && show.venue && ' — '}
        {show.venue}
      </motion.p>

      {/* title */}
      <motion.h1
        variants={fadeUp}
        className="font-display text-5xl sm:text-7xl text-negro uppercase leading-none"
      >
        {show.title}
      </motion.h1>

      {/* red accent line */}
      <motion.div variants={fadeUp} className="mt-4 h-[2px] w-16 bg-rojo" />

      {/* description */}
      {show.description && (
        <motion.p
          variants={fadeUp}
          className="font-mono text-lg text-negro/70 mt-4 leading-relaxed max-w-2xl"
        >
          {show.description}
        </motion.p>
      )}
    </motion.div>
  )
}

/* ─── gallery section ────────────────────────────────────── */
function Gallery({ images, onPhotoClick }) {
  if (!images || images.length === 0) return null

  return (
    <section className="max-w-5xl mx-auto px-6 pb-16">
      {/* section heading */}
      <div className="mb-6">
        <h2 className="font-display text-3xl text-negro uppercase leading-none">
          FOTOS
        </h2>
        <div className="mt-2 h-[2px] w-16 bg-rojo" />
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gris-mid"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {images.map((src, idx) => (
          <motion.button
            key={idx}
            variants={photoVariants}
            onClick={() => onPhotoClick(idx)}
            className="relative aspect-square overflow-hidden bg-gris group focus:outline-none focus-visible:ring-2 focus-visible:ring-rojo"
            aria-label={`Abrir foto ${idx + 1}`}
          >
            <img
              src={src}
              alt={`Foto ${idx + 1}`}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
            {/* red overlay hint on hover */}
            <div className="absolute inset-0 bg-rojo/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* corner accent */}
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-rojo opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </motion.button>
        ))}
      </motion.div>
    </section>
  )
}

/* ─── main page ──────────────────────────────────────────── */
export default function ShowDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setShow(null)

    getShowBySlug(slug)
      .then(data => {
        const show = data?.data ?? data
        if (!show || !show.id) {
          setError(true)
          return
        }
        setShow(show)
      })
      .catch(err => {
        const status = err?.response?.status
        if (status === 404) {
          navigate('/shows', { replace: true })
        } else {
          setError(true)
        }
      })
      .finally(() => setLoading(false))
  }, [slug, navigate])

  if (loading) return <Skeleton />
  if (error || !show) return <ErrorState />

  const gallery = Array.isArray(show.gallery) ? show.gallery : []

  return (
    <div className="min-h-screen bg-crema text-negro">
      {/* 1. Cover image */}
      <CoverImage src={show.cover_image} alt={show.title} />

      {/* 2. Header section */}
      <ShowHeader show={show} />

      {/* 3. Gallery */}
      <Gallery
        images={gallery}
        onPhotoClick={(idx) => setLightboxIndex(idx)}
      />

      {/* Lightbox — wrapped in AnimatePresence for exit animations */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={gallery}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
