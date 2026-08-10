import { img } from '../lib/assets'
import styles from './GradientStage.module.css'

/** The one shared rainbow-gradient + scrim + blur asset, reused byte-identically across 02/03/04/05/07. */
function GradientStage() {
  return <img className={styles.bg} src={img('02 Why Collections bg.svg')} alt="" aria-hidden="true" />
}

export default GradientStage
