import styles from './Stage.module.css'

/**
 * Aspect-locked 1728x1117 frame, fitted to the viewport at a single uniform scale
 * (contain). Children position/size themselves in `cqw`/`cqh` units, which are both
 * driven by that one scale — see Stage.module.css.
 */
function Stage({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`${styles.stage} ${className}`} {...rest}>
      <div className={styles.canvas}>{children}</div>
    </Tag>
  )
}

export default Stage
