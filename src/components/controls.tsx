import type { CSSProperties, ReactNode } from 'react'
import { artUrl } from '../theme'
import { useLayout } from './LayoutContext'

/** Place an element on the stage by its centre point. */
function centred(x: number, y: number, w: number, h: number): CSSProperties {
  return { left: x - w / 2, top: y - h / 2, width: w, height: h }
}

interface PillProps {
  x: number
  y: number
  w?: number
  h?: number
  children: ReactNode
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
  /** The lighter display face of the title screens instead of the bold one. */
  display?: boolean
  fontSize?: number
}

/** A rounded blue button, or pink when it is the selected one of a group. */
export function Pill({
  x,
  y,
  w = 137,
  h = 57,
  children,
  onClick,
  selected,
  disabled,
  display,
  fontSize = 28,
}: PillProps) {
  return (
    <button
      type="button"
      className={`btn flex items-center justify-center rounded-full enabled:active:brightness-90 ${selected ? 'bg-pink' : 'bg-blue'} ${display ? 'font-display font-normal' : 'font-bold'}`}
      style={{ ...centred(x, y, w, h), fontSize }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

/** The round blue button of the level picker. */
export function RoundButton({
  x,
  y,
  d = 57,
  children,
  onClick,
  disabled,
}: {
  x: number
  y: number
  d?: number
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button type="button" className="btn rounded-[50%] text-[30px] font-bold" style={centred(x, y, d, d)} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

interface NavProps {
  /** What to show between the arrows: a puzzle number, a board size, or "step/total". */
  children: ReactNode
  onPrev: () => void
  onNext: () => void
  prevLabel: string
  nextLabel: string
  prevDisabled?: boolean
  nextDisabled?: boolean
}

const NAV_BUTTON =
  'bare absolute disabled:cursor-default disabled:opacity-30 enabled:active:brightness-90'

/** The < number > control at the top of the screen. */
export function NavArrows({
  children,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  prevDisabled,
  nextDisabled,
}: NavProps) {
  // The control is centred on the stage: x 480 when wide, x 300 when upright.
  const dx = useLayout().portrait ? -180 : 0
  return (
    <>
      <button
        type="button"
        className={NAV_BUTTON}
        style={centred(383.5 + dx, 49, 57, 57)}
        onClick={onPrev}
        disabled={prevDisabled}
        aria-label={prevLabel}
      >
        <img className="img-fill" src={artUrl('nav-prev')} alt="" draggable={false} />
      </button>
      <div className="absolute flex items-center justify-center text-[64px] leading-none font-bold whitespace-nowrap" style={{ left: 410 + dx, top: 12, width: 139, height: 78 }}>
        {children}
      </div>
      <button
        type="button"
        className={NAV_BUTTON}
        style={centred(575.5 + dx, 49, 57, 57)}
        onClick={onNext}
        disabled={nextDisabled}
        aria-label={nextLabel}
      >
        <img className="img-fill" src={artUrl('nav-next')} alt="" draggable={false} />
      </button>
    </>
  )
}

const TOGGLE_SIDE = 'bare flex-1 text-[length:inherit] font-bold'
const TOGGLE_ON = 'bg-pink text-white'
const TOGGLE_OFF = 'bg-white text-[#8e8e8e]'

/** An On / Off switch. The chosen side is pink. */
export function Toggle({
  x,
  y,
  w,
  h,
  value,
  onChange,
  label,
  fontSize,
}: {
  x: number
  y: number
  w: number
  h: number
  value: boolean
  onChange: (value: boolean) => void
  label: string
  fontSize: number
}) {
  return (
    <div className="absolute flex overflow-hidden rounded-full border-3 border-solid border-grey bg-white font-bold" style={{ ...centred(x, y, w, h), fontSize }} role="group" aria-label={label}>
      <button
        type="button"
        className={`${TOGGLE_SIDE} ${value ? TOGGLE_ON : TOGGLE_OFF}`}
        aria-pressed={value}
        onClick={() => onChange(true)}
      >
        On
      </button>
      <button
        type="button"
        className={`${TOGGLE_SIDE} ${value ? TOGGLE_OFF : TOGGLE_ON}`}
        aria-pressed={!value}
        onClick={() => onChange(false)}
      >
        Off
      </button>
    </div>
  )
}

/** The gear that opens the puzzle picker. */
export function GearButton({ onClick }: { onClick: () => void }) {
  const { portrait } = useLayout()
  return (
    <button
      type="button"
      className="bare absolute"
      style={portrait ? centred(550, 50, 60, 60) : centred(888, 544, 60, 60)}
      onClick={onClick}
      aria-label="Choose a puzzle"
    >
      <img className="img-fill" src={artUrl('gear')} alt="" draggable={false} />
    </button>
  )
}
