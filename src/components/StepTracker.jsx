import styles from './StepTracker.module.css'

const STEPS = ['Discover', 'Save', 'Create', 'Collaborate', 'Manage']

/** Discover -> Save -> Create -> Collaborate -> Manage. Static state only — no crossfade yet. */
function StepTracker({ activeSteps = [], dottedAfter, className = '' }) {
  return (
    <ol className={`${styles.tracker} ${className}`}>
      {STEPS.map((step, i) => (
        <li key={step} style={{ display: 'contents' }}>
          <span className={`${styles.step} ${activeSteps.includes(step) ? styles.active : ''}`}>{step}</span>
          {i < STEPS.length - 1 && (
            <span
              className={`${styles.connector} ${step === dottedAfter ? styles.dotted : styles.solid}`}
              aria-hidden="true"
            />
          )}
        </li>
      ))}
    </ol>
  )
}

export default StepTracker
