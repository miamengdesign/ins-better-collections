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
 * Phase 1: navigator drives Hero → Why → CE → Solutions state 1.
 * §§05–07 remain static tail content until a later migration.
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
      {/* Solutions lives in CinematicRoot (sol-1). Tail starts at Prototype. */}
      <Prototype phase1Static />
      <BehindTheWork phase1Static />
      <WrapUp phase1Static />
    </div>
  )
}

export default App
