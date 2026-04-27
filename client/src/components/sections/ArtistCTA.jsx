import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ArtistCTA() {
  return (
    <motion.section
      className="relative overflow-hidden bg-gris border-t-2 border-rojo"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="px-6 sm:px-10 py-20 sm:py-28 relative z-10">
        {/* Label */}
        <p className="font-ui text-xs tracking-[0.25em] text-rojo uppercase mb-6">
          — Trabajá con nosotras
        </p>

        {/* Fanzine-style oversized heading */}
        <div className="relative mb-8">
          <h2 className="font-display text-[14vw] sm:text-[10vw] md:text-[8vw] leading-none uppercase text-blanco">
            ¿Sos
          </h2>
          {/* Offset red word — breaks the grid */}
          <h2 className="font-display text-[14vw] sm:text-[10vw] md:text-[8vw] leading-none uppercase text-rojo ml-[10%] sm:ml-[15%] -mt-2 sm:-mt-4">
            Artista?
          </h2>
        </div>

        {/* Body text */}
        <div className="max-w-lg">
          <p className="font-mono text-sm text-blanco/60 leading-relaxed mb-8">
            Si hacés música, diseño, arte o cultura independiente en Argentina,
            nos interesa conocer tu trabajo. Entrevistas, coberturas y reseñas.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/contacto"
              className="inline-flex items-center gap-3 font-ui text-sm tracking-widest uppercase bg-rojo text-blanco px-6 py-3 hover:bg-rojo/80 transition-colors duration-200"
            >
              Contactarnos →
            </Link>
            <Link
              to="/sobre-nosotros"
              className="inline-flex items-center gap-3 font-ui text-sm tracking-widest uppercase text-blanco/50 border border-gris-mid px-6 py-3 hover:text-blanco hover:border-blanco/30 transition-colors duration-200"
            >
              Quiénes somos
            </Link>
          </div>
        </div>
      </div>

      {/* Background decorative oversized letter */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center pr-6 sm:pr-10 pointer-events-none select-none"
        aria-hidden="true"
      >
        <span className="font-display text-[30vw] sm:text-[22vw] leading-none text-negro/50 uppercase">
          R
        </span>
      </div>
    </motion.section>
  )
}
