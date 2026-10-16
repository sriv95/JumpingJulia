import { Pill, RoundButton, Toggle } from '../components/controls'

interface LevelsScreenProps {
  /** Which board size's puzzles are listed: 4, 5 or 6. */
  size: number
  onSize: (size: number) => void
  onPick: (id: number) => void
  /** The highest puzzle that can be played; later ones stay locked until the one before is won. */
  unlocked: number
  onCustom: () => void
  onRandom: () => void
  showCount: boolean
  onCount: (value: boolean) => void
  onBack: () => void
}

const SIZES = [
  { size: 4, x: 130 },
  { size: 5, x: 305 },
  { size: 6, x: 479 },
]

const COLUMN_X = [161, 233, 305, 377, 449]
const ROW_Y = [228, 300, 372]

/** The puzzle picker behind the gear: 15 puzzles for each of three board sizes. */
export function LevelsScreen({
  size,
  onSize,
  onPick,
  unlocked,
  onCustom,
  onRandom,
  showCount,
  onCount,
  onBack,
}: LevelsScreenProps) {
  const first = (size - 4) * 15 + 1
  return (
    <div className="screen">
      {SIZES.map((s) => (
        <Pill key={s.size} x={s.x} y={129} w={155} h={57} selected={s.size === size} onClick={() => onSize(s.size)}>
          {s.size}x{s.size}
        </Pill>
      ))}

      {Array.from({ length: 15 }, (_, i) => (
        <RoundButton key={first + i} x={COLUMN_X[i % 5]} y={ROW_Y[Math.floor(i / 5)]} disabled={first + i > unlocked} onClick={() => onPick(first + i)}>
          {first + i}
        </RoundButton>
      ))}

      <Pill x={776} y={241} onClick={onCustom}>
        Custom
      </Pill>
      <Pill x={776} y={313} onClick={onRandom}>
        Random
      </Pill>

      <div className="count-label">Count:</div>
      <Toggle x={123} y={540} w={149} h={58} value={showCount} onChange={onCount} label="Count" fontSize={27} />

      <Pill x={873} y={546} onClick={onBack}>
        Back
      </Pill>
    </div>
  )
}
