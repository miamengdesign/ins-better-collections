import styles from './StepTracker.module.css'

const STEPS = ['Discover', 'Save', 'Create', 'Collaborate', 'Manage']

/**
 * Discover → Save → Create → Collaborate → Manage.
 * Steps and the connectors between them share the same active emphasis:
 * 100% opacity when relevant to the current state, 50% otherwise.
 * A connector is active when both of its endpoint steps are active.
 *
 * Optional `emphasis` supplies continuous opacities (0.5–1) for smooth
 * crossfades between states; when omitted, binary activeSteps apply.
 */
function StepTracker({
  activeSteps = [],
  dottedAfter,
  className = '',
  emphasis = null,
}) {
  return (
    <ol className={`${styles.tracker} ${className}`}>
      {STEPS.map((step, i) => {
        const next = STEPS[i + 1]
        const stepActive = activeSteps.includes(step)
        const connectorActive =
          Boolean(next) && stepActive && activeSteps.includes(next)

        const stepOpacity = emphasis
          ? emphasis.step(step)
          : stepActive
            ? 1
            : 0.5
        const connectorOpacity = next
          ? emphasis
            ? emphasis.connector(step, next)
            : connectorActive
              ? 1
              : 0.5
          : undefined

        return (
          <li key={step} style={{ display: 'contents' }}>
            <span
              className={`${styles.step} ${stepActive ? styles.active : ''}`}
              style={{ opacity: stepOpacity }}
            >
              {step}
            </span>
            {next && (
              <span
                className={`${styles.connector} ${
                  step === dottedAfter ? styles.dotted : styles.solid
                } ${connectorActive ? styles.active : ''}`}
                style={{ opacity: connectorOpacity }}
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
