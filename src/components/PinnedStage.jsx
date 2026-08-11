import { useRef } from 'react'
import { useCinematicPlayhead, useStageActive } from '../hooks/useCinematicPlayhead'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useScrollProgress } from '../hooks/useScrollProgress'
import Stage from './Stage'
import styles from './PinnedStage.module.css'

/**
 * Scroll-track + sticky full-viewport stage. Exposes local progress `0–1` via a
 * render-prop child.
 *
 * When `cinematic` is set, wheel/trackpad gestures step through `cinematic.anchors`
 * and each step eases to completion (trigger model). Scroll position no longer
 * scrubs the animation 1:1. Mobile still disables the pin.
 *
 * `overlapVh` / `startOffsetVh` keep cross-section stacking geometry.
 */
function PinnedStage({
  height = '400vh',
  overlapVh = 0,
  startOffsetVh,
  cinematic = null,
  className = '',
  ariaLabel,
  children,
  ...rest
}) {
  const trackRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduced = useReducedMotion()
  const offsetVh = startOffsetVh ?? overlapVh
  const scrollProgress = useScrollProgress(trackRef, {
    startOffsetVh: offsetVh,
    enabled: !isMobile && !cinematic,
  })

  const zIndex =
    typeof rest.style?.zIndex === 'number'
      ? rest.style.zIndex
      : cinematic
        ? overlapVh
          ? 1
          : 0
        : 0

  const stageActive = useStageActive(trackRef, {
    enabled: !isMobile && !!cinematic,
    zIndex,
  })

  const cine = useCinematicPlayhead({
    anchors: cinematic?.anchors ?? [0, 1],
    active: stageActive,
    reduced: cinematic?.reduced ?? reduced,
    duration: cinematic?.duration ?? 1100,
    durations: cinematic?.durations,
    threshold: cinematic?.threshold ?? 48,
    enabled: !isMobile && !!cinematic,
  })

  const progress = cinematic ? cine.progress : scrollProgress

  if (isMobile) {
    return (
      <Stage className={className} aria-label={ariaLabel} data-pinned="false" {...rest}>
        {typeof children === 'function'
          ? children({
              progress: 0,
              isPinned: false,
              stepIndex: 0,
              animating: false,
              goToStep: () => false,
              stepCount: 0,
            })
          : children}
      </Stage>
    )
  }

  return (
    <section
      ref={trackRef}
      className={styles.track}
      aria-label={ariaLabel}
      data-pinned="true"
      data-cinematic={cinematic ? 'true' : 'false'}
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
          {typeof children === 'function'
            ? children({
                progress,
                isPinned: true,
                stepIndex: cine.stepIndex,
                animating: cine.animating,
                stageActive,
                goToStep: cine.goToStep,
                stepCount: cine.stepCount,
              })
            : children}
        </div>
      </div>
    </section>
  )
}

export default PinnedStage
