import styles from './Stage.module.css'

/**
 * Two layers, per section:
 *
 * 1. `background` — a full-bleed backdrop rendered OUTSIDE the content canvas, so
 *    it always covers the whole viewport edge-to-edge. Pass the section's
 *    `GradientStage` (or any absolutely-positioned backdrop) here, never as a
 *    child, or it would be confined to the letterboxed canvas.
 * 2. `children` — the content, on an aspect-locked 1728x1117 frame fitted to the
 *    viewport at a single uniform scale (contain). Children position/size
 *    themselves in `cqw`/`cqh` units, which are both driven by that one scale.
 *
 * See Stage.module.css.
 */
function Stage({ as: Tag = 'section', className = '', background = null, children, ...rest }) {
  return (
    <Tag className={`${styles.stage} ${className}`} {...rest}>
      {background}
      <div className={styles.canvas}>{children}</div>
    </Tag>
  )
}

export default Stage
