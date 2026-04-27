import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Image slide variants — static, no closure over props/state.
const variants = {
  enter: (dir) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
  }),
}

// NOTE: This component must be rendered inside an <AnimatePresence> by the
// caller so that its exit animation fires when the component is unmounted.
export default function Lightbox({ images = [], initialIndex = 0, onClose = () => {} }) {
  const [current, setCurrent] = useState(initialIndex)
  const [direction, setDirection] = useState(0) // -1 = prev, 1 = next

  // Touch tracking refs
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const total = images.length

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrent(i => (i + 1) % total)
  }, [total])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrent(i => (i - 1 + total) % total)
  }, [total])

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, onClose])

  // Lock scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Touch handlers for swipe
  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Only trigger if horizontal swipe dominates
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  if (!total) return null

  return (
    <motion.div
      key="lightbox-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop — click to close */}
      <button
        tabIndex={-1}
        aria-label="Cerrar lightbox"
        className="absolute inset-0 bg-negro/95 cursor-default w-full h-full"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-5 z-10 font-display text-4xl text-blanco hover:text-rojo transition-colors duration-150 leading-none select-none"
        aria-label="Cerrar"
      >
        &times;
      </button>

      {/* Prev arrow */}
      {total > 1 && (
        <button
          onClick={goPrev}
          className="absolute left-3 sm:left-6 z-10 font-display text-4xl sm:text-5xl text-blanco hover:text-rojo transition-colors duration-150 leading-none select-none px-2 py-4"
          aria-label="Imagen anterior"
        >
          &#8592;
        </button>
      )}

      {/* Next arrow */}
      {total > 1 && (
        <button
          onClick={goNext}
          className="absolute right-3 sm:right-6 z-10 font-display text-4xl sm:text-5xl text-blanco hover:text-rojo transition-colors duration-150 leading-none select-none px-2 py-4"
          aria-label="Imagen siguiente"
        >
          &#8594;
        </button>
      )}

      {/* Image area — swipe target */}
      <div
        className="relative z-10 flex items-center justify-center w-full h-full px-16 sm:px-24 py-16"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={current}
            src={images[current]}
            alt={`Imagen ${current + 1} de ${total}`}
            className="max-h-[80vh] max-w-full object-contain select-none"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {/* Counter */}
      {total > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="font-ui text-xs tracking-[0.2em] text-gris-mid uppercase">
            {current + 1} / {total}
          </span>
        </div>
      )}

    </motion.div>
  )
}
