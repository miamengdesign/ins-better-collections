import styles from './PhoneMockup.module.css'

/** Presentational wrapper around a pic*.svg phone mockup asset. No animation — added later. */
function PhoneMockup({ src, alt = '', style, className = '' }) {
  return <img className={`${styles.image} ${className}`} src={src} alt={alt} style={style} />
}

export default PhoneMockup
