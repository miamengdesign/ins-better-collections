import GestureController from './nav/GestureController'
import CinematicRoot from './nav/CinematicRoot'
import { useNavigator } from './nav/useNavigator'
import tailStyles from './nav/Tail.module.css'
import Hero from './sections/01-hero/Hero'
import WhyCollection from './sections/02-why-collection/WhyCollection'
import CurrentExperience from './sections/03-current-experience/CurrentExperience'
import Solutions from './sections/04-solutions/Solutions'
import Prototype from './sections/05-prototype/Prototype'
import BehindTheWork from './sections/06-behind-the-work/BehindTheWork'
import WrapUp from './sections/07-wrap-up/WrapUp'
import { useMediaQuery } from './hooks/useMediaQuery'

/**
 * Phase 1: navigator drives Hero → … → Behind 1–2 → Wrap Up Scene 1.
 * Wrap scenes 2–3 remain deferred (no StaticTail content yet).
 */
function App() {
  const isMobile = useMediaQuery('(max-width: 767px)')

  if (isMobile) {
    return (
      <>
        <Hero />
        <WhyCollection />
        <CurrentExperience />
        <Solutions />
        <Prototype />
        <BehindTheWork />
        <WrapUp />
      </>
    )
  }

  return (
    <>
      <GestureController />
      <CinematicRoot>
        <Hero />
        <WhyCollection />
        <CurrentExperience />
        <Solutions />
        <Prototype />
        <BehindTheWork />
        <WrapUp />
      </CinematicRoot>
      <StaticTail />
    </>
  )
}

function StaticTail() {
  const { unlocked } = useNavigator()
  return (
    <div
      className={tailStyles.tail}
      data-visible={unlocked ? 'true' : 'false'}
      aria-hidden={!unlocked}
      inert={!unlocked || undefined}
    >
      {/*
        Wrap Up Scene 1 lives in CinematicRoot (wrap-1).
        Scenes 2–3 / footer extras stay out of the tree until migrated —
        prevents any flash of later Wrap content during §06→07.
      */}
    </div>
  )
}

export default App
