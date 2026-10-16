import { Pill } from '../components/controls'
import { useLayout } from '../components/LayoutContext'
import { artUrl } from '../theme'

/** The big game title, shared by the title and credits screens. */
export const TITLE =
  'absolute top-0 left-81 m-0 flex h-122 w-879 items-center justify-center font-title text-[71px] font-bold tracking-[-0.01em] whitespace-nowrap portrait:w-519 portrait:text-[52px]'

/** The coloured strip down the left edge of the title and credits screens. */
export function LeftBorder() {
  return <img className="absolute top-0 left-0 h-600 w-81 portrait:h-960 portrait:object-cover portrait:object-top" src={artUrl('left-border')} alt="" draggable={false} />
}

/** The Julia Robinson Mathematics Festival logo and the licence badge. */
export function Logos() {
  return (
    <>
      <img className="absolute top-426 left-402 h-auto w-240 portrait:top-560 portrait:left-220" src={artUrl('jrmf-logo')} alt="Julia Robinson Mathematics Festival" draggable={false} />
      <a
        className="absolute top-541 left-370 flex h-45 w-295 items-center justify-center rounded-[8px] bg-purple portrait:top-720 portrait:left-192"
        href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
        target="_blank"
        rel="noreferrer"
        aria-label="Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)"
      >
        <img className="block h-auto w-283" src={artUrl('cc-badge')} alt="" draggable={false} />
      </a>
    </>
  )
}

export function HomeScreen({ onStart, onCredits }: { onStart: () => void; onCredits: () => void }) {
  const { portrait } = useLayout()
  const [startX, creditsX, y] = portrait ? [256, 424, 460] : [437, 605, 369]
  return (
    <div className="absolute inset-0">
      <LeftBorder />
      <h1 className={TITLE}>Jumping Julia</h1>
      <img className="absolute top-112 left-331 h-auto w-380 portrait:top-170 portrait:left-150" src={artUrl('home-tiles')} alt="" draggable={false} />
      <Pill x={startX} y={y} w={131} h={53} display fontSize={27} onClick={onStart}>
        Start
      </Pill>
      <Pill x={creditsX} y={y} w={131} h={53} display fontSize={27} onClick={onCredits}>
        Credits
      </Pill>
    </div>
  )
}
