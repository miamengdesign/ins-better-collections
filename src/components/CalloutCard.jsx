import styles from './CalloutCard.module.css'

/** Presentational wrapper around a txt*.svg annotation-card asset. No animation — added later. */
function CalloutCard({ src, alt = '', style, className = '' }) {
  return <img className={`${styles.callout} ${className}`} src={src} alt={alt} style={style} />
}

export default CalloutCard
