import { Pill } from '../components/controls'
import { artUrl } from '../theme'

/** The coloured strip down the left edge of the title and credits screens. */
export function LeftBorder() {
  return <img className="left-border" src={artUrl('left-border')} alt="" draggable={false} />
}

/** The Julia Robinson Mathematics Festival logo and the licence badge. */
export function Logos() {
  return (
    <>
      <img className="jrmf-logo" src={artUrl('jrmf-logo')} alt="Julia Robinson Mathematics Festival" draggable={false} />
      <a
        className="cc-badge"
        href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
        target="_blank"
        rel="noreferrer"
        aria-label="Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)"
      >
        <img src={artUrl('cc-badge')} alt="" draggable={false} />
      </a>
    </>
  )
}

export function HomeScreen({ onStart, onCredits }: { onStart: () => void; onCredits: () => void }) {
  return (
    <div className="screen home">
      <LeftBorder />
      <h1 className="title">Jumping Julia</h1>
      <img className="home-tiles" src={artUrl('home-tiles')} alt="" draggable={false} />
      <Pill x={437} y={369} w={131} h={53} className="home-button" onClick={onStart}>
        Start
      </Pill>
      <Pill x={605} y={369} w={131} h={53} className="home-button" onClick={onCredits}>
        Credits
      </Pill>
    </div>
  )
}
