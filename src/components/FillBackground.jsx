import { useEffect, useRef } from 'react'
import { img } from '../lib/assets'
import styles from './FillBackground.module.css'

/**
 * Full-bleed background asset that stretches independently on each axis to exactly
 * fill its container — matching the canvas's own per-axis stretch under the
 * viewport-fill layout system (see Stage.module.css) — rather than cropping (cover)
 * or letterboxing (contain).
 *
 * Loaded as inline markup (not `<img src>`) because `object-fit: fill` does not
 * override this SVG family's internal aspect-ratio handling when loaded via `<img>`
 * — verified directly in isolation, not a CSS mistake. Setting
 * `preserveAspectRatio="none"` on the inlined root forces the non-uniform stretch.
 * `shape-rendering: crispEdges` also removes an anti-aliasing seam on any baked
 * vector text in these assets, the same fix used for the Hero wordmark.
 */
function FillBackground({ name, className = '' }) {
  const hostRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetch(img(name))
      .then((res) => res.text())
      .then((svgMarkup) => {
        if (cancelled || !hostRef.current) return
        hostRef.current.innerHTML = svgMarkup
        hostRef.current.querySelector('svg')?.setAttribute('preserveAspectRatio', 'none')
      })
    return () => {
      cancelled = true
    }
  }, [name])

  return <div ref={hostRef} className={`${styles.host} ${className}`} role="img" aria-label="" />
}

export default FillBackground
