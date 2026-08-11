import { useEffect, useRef, useState } from 'react'

/**
 * Local scroll progress `0–1` for an element that acts as a scroll track
 * (typically taller than the viewport). Pure function of scroll position —
 * reversing scroll reverses the value with no extra logic.
 *
 * Progress is `( -rect.top - startOffset ) / (trackHeight - viewportHeight - startOffset)`,
 * clamped to `[0, 1]`. `startOffsetVh` keeps progress at 0 until that many vh of
 * the track have scrolled (useful when another section overlaps the track head).
 */
export function useScrollProgress(trackRef, { startOffsetVh = 0, enabled = true } = {}) {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(0)
  const latestRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setProgress(0)
      return undefined
    }

    const track = trackRef.current
    if (!track) return undefined

    const update = () => {
      rafRef.current = 0
      const rect = track.getBoundingClientRect()
      const trackHeight = track.offsetHeight
      const viewHeight = window.innerHeight
      const startOffsetPx = (startOffsetVh / 100) * viewHeight
      const scrollable = trackHeight - viewHeight - startOffsetPx
      if (scrollable <= 0) {
        if (latestRef.current !== 0) {
          latestRef.current = 0
          setProgress(0)
        }
        return
      }
      const scrolled = -rect.top - startOffsetPx
      const next = Math.min(1, Math.max(0, scrolled / scrollable))
      if (Math.abs(next - latestRef.current) > 0.0005) {
        latestRef.current = next
        setProgress(next)
      }
    }

    const onScrollOrResize = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [trackRef, startOffsetVh, enabled])

  return progress
}
