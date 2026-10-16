import type { CSSProperties, ReactNode } from 'react'
import { artUrl } from '../theme'

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
  className?: string
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
  className = '',
  fontSize,
}: PillProps) {
  return (
    <button
      type="button"
      className={`pill ${selected ? 'pill-selected' : ''} ${className}`}
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
    <button type="button" className="round" style={centred(x, y, d, d)} onClick={onClick} disabled={disabled}>
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
  return (
    <>
      <button
        type="button"
        className="nav"
        style={centred(383.5, 49, 57, 57)}
        onClick={onPrev}
        disabled={prevDisabled}
        aria-label={prevLabel}
      >
        <img src={artUrl('nav-prev')} alt="" draggable={false} />
      </button>
      <div className="nav-value" style={{ left: 410, top: 12, width: 139, height: 78 }}>
        {children}
      </div>
      <button
        type="button"
        className="nav"
        style={centred(575.5, 49, 57, 57)}
        onClick={onNext}
        disabled={nextDisabled}
        aria-label={nextLabel}
      >
        <img src={artUrl('nav-next')} alt="" draggable={false} />
      </button>
    </>
  )
}

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
    <div className="toggle" style={{ ...centred(x, y, w, h), fontSize }} role="group" aria-label={label}>
      <button
        type="button"
        className={value ? 'on' : ''}
        aria-pressed={value}
        onClick={() => onChange(true)}
      >
        On
      </button>
      <button
        type="button"
        className={value ? '' : 'on'}
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
  return (
    <button
      type="button"
      className="gear"
      style={centred(888, 544, 60, 60)}
      onClick={onClick}
      aria-label="Choose a puzzle"
    >
      <img src={artUrl('gear')} alt="" draggable={false} />
    </button>
  )
}
