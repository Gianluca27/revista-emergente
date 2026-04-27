import { useEffect, useRef, useState } from 'react'

const HOVER_SELECTOR = 'a, button, [role="button"], input[type="submit"], input[type="button"], label[for], [data-cursor="hover"]'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const apply = () => setEnabled(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!enabled) return

    document.documentElement.classList.add('cursor-none-desktop')

    const dot = dotRef.current
    const ring = ringRef.current

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my
    let rafId = null

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      if (dot) {
        dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
      }
    }

    const tick = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      if (ring) {
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
      }
      rafId = requestAnimationFrame(tick)
    }

    const onOver = (e) => {
      if (e.target.closest && e.target.closest(HOVER_SELECTOR)) {
        ring?.classList.add('cursor-hover')
        dot?.classList.add('cursor-hover-dot')
      }
    }

    const onOut = (e) => {
      if (e.target.closest && e.target.closest(HOVER_SELECTOR)) {
        ring?.classList.remove('cursor-hover')
        dot?.classList.remove('cursor-hover-dot')
      }
    }

    const onLeaveWindow = () => {
      if (dot) dot.style.opacity = '0'
      if (ring) ring.style.opacity = '0'
    }

    const onEnterWindow = () => {
      if (dot) dot.style.opacity = '1'
      if (ring) ring.style.opacity = '1'
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    document.addEventListener('mouseleave', onLeaveWindow)
    document.addEventListener('mouseenter', onEnterWindow)
    rafId = requestAnimationFrame(tick)

    return () => {
      document.documentElement.classList.remove('cursor-none-desktop')
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.removeEventListener('mouseleave', onLeaveWindow)
      document.removeEventListener('mouseenter', onEnterWindow)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={ringRef}
        className="custom-cursor-ring pointer-events-none fixed top-0 left-0 z-[10000] w-9 h-9 border border-rojo rounded-full transition-[width,height,background-color,opacity] duration-200 ease-out"
        aria-hidden="true"
      />
      <div
        ref={dotRef}
        className="custom-cursor-dot pointer-events-none fixed top-0 left-0 z-[10001] w-1.5 h-1.5 bg-rojo rounded-full transition-opacity duration-200"
        aria-hidden="true"
      />
    </>
  )
}
