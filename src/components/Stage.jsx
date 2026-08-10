import styles from './Stage.module.css'

/** Aspect-locked 1728x1117 frame. Children position/size themselves in `cqw` units. */
function Stage({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`${styles.stage} ${className}`} {...rest}>
      <div className={styles.canvas}>{children}</div>
    </Tag>
  )
}

export default Stage
