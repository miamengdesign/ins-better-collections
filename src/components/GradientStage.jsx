import styles from './GradientStage.module.css'

/**
 * The one shared brand gradient + scrim, reused across 02/03/04/05/07 so the
 * background is identical everywhere it appears. Pure CSS: there is no runtime
 * gradient image in `/public/images` (see docs/ASSET_MANIFEST.md).
 */
function GradientStage({ className = '' }) {
  return <div className={`${styles.gradient} ${className}`} aria-hidden="true" />
}

export default GradientStage
