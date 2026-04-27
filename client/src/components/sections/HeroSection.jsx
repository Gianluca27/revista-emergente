import { useState, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { Link } from 'react-router-dom'

const WORD = 'EMERGENTE'
const letters = WORD.split('')

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.3 },
  },
}

const letterVariants = {
  hidden: { y: '110%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 14, stiffness: 110 },
  },
}

const lineVariants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: 'easeOut' },
  }),
}

export default function HeroSection() {
  const [glitching, setGlitching] = useState(false)
  const glitchTimeout = useRef(null)

  const handleWordComplete = () => {
    setGlitching(true)
    glitchTimeout.current = setTimeout(() => setGlitching(false), 600)
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-crema">
      {/* Top bar */}
      <motion.div
        className="flex items-center justify-between px-6 sm:px-10 pt-10 pb-4"
        custom={0.15}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <span className="font-ui text-xs tracking-[0.25em] text-negro/50 uppercase">
          Revista Emergente
        </span>
        <span className="font-ui text-xs tracking-[0.25em] text-negro/50 uppercase">
          Cultura Independiente
        </span>
      </motion.div>

      {/* Main hero content */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 pb-8">
        {/* Oversized EMERGENTE */}
        <div className="relative">
          <motion.div
            className={`flex overflow-hidden leading-none select-none ${glitching ? 'hero-glitch' : ''}`}
            data-text={WORD}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onAnimationComplete={handleWordComplete}
          >
            {letters.map((letter, i) => (
              <div key={i} className="overflow-hidden">
                <motion.span
                  className="block font-grunge text-[17vw] sm:text-[15vw] md:text-[14vw] text-rojo uppercase"
                  variants={letterVariants}
                >
                  {letter}
                </motion.span>
              </div>
            ))}
          </motion.div>

          {/* Red accent line */}
          <motion.div
            className="h-[3px] bg-rojo w-full"
            variants={lineVariants}
            initial="hidden"
            animate="visible"
          />

          {/* Offset decorative text — raw fanzine feel */}
          <motion.p
            className="absolute -bottom-5 right-0 font-ui text-[10px] tracking-[0.3em] text-rojo uppercase"
            custom={1.4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            Est. Buenos Aires — {new Date().getFullYear()}
          </motion.p>
        </div>

        {/* Tagline */}
        <motion.p
          className="font-mono text-sm sm:text-base text-negro/60 mt-10 max-w-md leading-relaxed"
          custom={1.2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          Entrevistas, coberturas y pensamiento crítico
          <br />sobre música y arte independiente.
        </motion.p>

        {/* CTA */}
        <motion.div
          className="flex items-center gap-6 mt-8"
          custom={1.5}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <Link
            to="/entrevistas"
            className="group inline-flex items-center gap-3 font-ui text-sm tracking-widest uppercase text-negro border border-negro/30 px-5 py-3 hover:bg-rojo hover:text-crema hover:border-rojo transition-colors duration-200"
          >
            Ver Entrevistas
            <span className="text-rojo group-hover:text-crema">→</span>
          </Link>
          <Link
            to="/podcast"
            className="font-ui text-sm tracking-widest uppercase text-negro/50 hover:text-rojo transition-colors duration-200"
          >
            Podcast
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        custom={2.0}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <span className="font-ui text-[10px] tracking-[0.3em] text-negro/50 uppercase">Scroll</span>
        <motion.div
          className="w-px h-8 bg-gris-mid origin-top"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </motion.div>
    </section>
  )
}
