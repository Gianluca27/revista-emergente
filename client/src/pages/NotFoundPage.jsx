import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-negro flex items-center justify-center px-6 py-12 overflow-hidden relative">
      {/* Background grain texture */}
      <div className="grain absolute inset-0 pointer-events-none opacity-30" />

      <div className="relative z-10 w-full max-w-4xl">
        {/* Main 404 number */}
        <motion.div
          className="text-center mb-8"
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="text-[20vw] font-display text-rojo leading-none uppercase tracking-tighter font-black">
            404
          </div>
        </motion.div>

        {/* Content stack */}
        <motion.div
          className="text-center space-y-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Main heading */}
          <motion.h1
            className="font-display text-4xl sm:text-6xl text-blanco uppercase leading-tight tracking-widest"
            variants={fadeUp}
          >
            Página No Encontrada
          </motion.h1>

          {/* Description */}
          <motion.p
            className="font-mono text-sm text-gris-mid max-w-md mx-auto"
            variants={fadeUp}
          >
            Este contenido no existe o fue removido. El slug que buscas se desvaneció en el caos del under.
          </motion.p>

          {/* Back to home button */}
          <motion.div variants={fadeUp} className="pt-4">
            <Link
              to="/"
              className="inline-block font-ui text-xs uppercase tracking-widest px-6 py-3 border border-rojo text-rojo hover:bg-rojo hover:text-negro transition-colors duration-200"
            >
              Volver al Inicio
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
