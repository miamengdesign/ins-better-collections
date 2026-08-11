import { useEffect, useId, useState } from 'react'

/**
 * Registry so only the frontmost stuck cinematic stage captures wheel input
 * when tracks overlap (e.g. §04/§05 push).
 */
const stages = new Map()
const subscribers = new Set()

function republish() {
  let bestId = null
  let bestZ = -Infinity
  for (const [id, meta] of stages) {
    if (!meta.stuck || !meta.enabled) continue
    if (meta.zIndex >= bestZ) {
      bestZ = meta.zIndex
      bestId = id
    }
  }
  for (const [id, meta] of stages) {
    const next = id === bestId
    if (meta.active !== next) {
      meta.active = next
      // Sync notify path so consumers can read activity without waiting on paint.
      meta.notify(next)
    }
  }
  subscribers.forEach((fn) => fn())
}

function upsert(id, partial) {
  const prev = stages.get(id) || {
    stuck: false,
    enabled: false,
    zIndex: 0,
    active: false,
    notify: () => {},
  }
  stages.set(id, { ...prev, ...partial })
  republish()
}

/** Slight slack so subpixel sticky layout still counts as “visibly pinned”. */
function isTrackStuck(el) {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight
  return rect.top <= 8 && rect.bottom >= vh - 8
}

/**
 * True while this track is the frontmost stuck cinematic stage.
 *
 * Stuck is re-checked on scroll, resize, and wheel so the first deliberate
 * swipe after a section becomes visible is not lost to a stale inactive flag.
 */
export function useStageActive(trackRef, { enabled = true, zIndex = 0 } = {}) {
  const id = useId()
  const [active, setActive] = useState(false)

  useEffect(() => {
    upsert(id, {
      enabled,
      zIndex,
      notify: setActive,
    })
    return () => {
      stages.delete(id)
      republish()
    }
  }, [id, enabled, zIndex])

  useEffect(() => {
    if (!enabled) {
      upsert(id, { stuck: false, enabled: false })
      setActive(false)
      return undefined
    }

    const update = () => {
      const el = trackRef.current
      if (!el) {
        upsert(id, { stuck: false })
        return
      }
      upsert(id, { stuck: isTrackStuck(el), enabled: true, zIndex })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    // Wheel can pin a stage without a scroll event in some edge cases; keep
    // stuck/active in sync so the playhead can take the next gesture.
    window.addEventListener('wheel', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('wheel', update)
    }
  }, [trackRef, enabled, zIndex, id])

  return active
}
