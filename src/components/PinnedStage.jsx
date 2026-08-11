import { useRef } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import Stage from './Stage'
import styles from './PinnedStage.module.css'

/**
 * Scroll-track + sticky full-viewport stage. Exposes local progress `0–1` via a
 * render-prop child. Below the mobile breakpoint the pin is disabled and children
 * receive `progress = 0` inside a normal-flow Stage (sections that need a stacked
 * fallback should branch on `isPinned` themselves).
 *
 * `overlapVh` pulls the track under a preceding section via negative margin.
 * `startOffsetVh` (defaults to `overlapVh`) is the progress dead-zone so local `p`
 * stays 0 until that much of the track has scrolled past.
 */
function PinnedStage({
  height = '400vh',
  overlapVh = 0,
  startOffsetVh,
  className = '',
  ariaLabel,
  children,
  ...rest
}) {
  const trackRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const offsetVh = startOffsetVh ?? overlapVh
  const progress = useScrollProgress(trackRef, {
    startOffsetVh: offsetVh,
    enabled: !isMobile,
  })

  if (isMobile) {
    return (
      <Stage className={className} aria-label={ariaLabel} data-pinned="false" {...rest}>
        {typeof children === 'function' ? children({ progress: 0, isPinned: false }) : children}
      </Stage>
    )
  }

  return (
    <section
      ref={trackRef}
      className={styles.track}
      aria-label={ariaLabel}
      data-pinned="true"
      {...rest}
      style={{
        height,
        marginTop: overlapVh ? `-${overlapVh}vh` : undefined,
        zIndex: overlapVh ? 1 : undefined,
        ...rest.style,
      }}
    >
      <div className={styles.sticky}>
        <div className={`${styles.canvas} ${className}`}>
          {typeof children === 'function' ? children({ progress, isPinned: true }) : children}
        </div>
      </div>
    </section>
  )
}

export default PinnedStage
