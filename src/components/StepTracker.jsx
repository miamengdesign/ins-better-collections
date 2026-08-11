import styles from './StepTracker.module.css'

const STEPS = ['Discover', 'Save', 'Create', 'Collaborate', 'Manage']

/**
 * Discover → Save → Create → Collaborate → Manage.
 * Steps and the connectors between them share the same active emphasis:
 * 100% opacity when relevant to the current state, 50% otherwise.
 * A connector is active when both of its endpoint steps are active.
 */
function StepTracker({ activeSteps = [], dottedAfter, className = '' }) {
  return (
    <ol className={`${styles.tracker} ${className}`}>
      {STEPS.map((step, i) => {
        const next = STEPS[i + 1]
        const stepActive = activeSteps.includes(step)
        const connectorActive =
          Boolean(next) && stepActive && activeSteps.includes(next)

        return (
          <li key={step} style={{ display: 'contents' }}>
            <span className={`${styles.step} ${stepActive ? styles.active : ''}`}>
              {step}
            </span>
            {next && (
              <span
                className={`${styles.connector} ${
                  step === dottedAfter ? styles.dotted : styles.solid
                } ${connectorActive ? styles.active : ''}`}
                aria-hidden="true"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default StepTracker
