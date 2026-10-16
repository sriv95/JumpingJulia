import { Pill, RoundButton, Toggle } from '../components/controls'
import { useLayout } from '../components/LayoutContext'

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

/** Where everything sits on the wide stage and on the upright one. */
const SPOTS = {
  landscape: {
    sizeX: [130, 305, 479],
    sizeY: 129,
    columnX: [161, 233, 305, 377, 449],
    rowY: [228, 300, 372],
    custom: [776, 241],
    random: [776, 313],
    toggle: [123, 540],
    back: [873, 546],
  },
  portrait: {
    sizeX: [110, 300, 490],
    sizeY: 90,
    columnX: [140, 220, 300, 380, 460],
    rowY: [220, 300, 380],
    custom: [160, 500],
    random: [440, 500],
    toggle: [300, 650],
    back: [300, 880],
  },
} as const

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
  const spot = SPOTS[useLayout().portrait ? 'portrait' : 'landscape']
  return (
    <div className="screen">
      {[4, 5, 6].map((n, i) => (
        <Pill key={n} x={spot.sizeX[i]} y={spot.sizeY} w={155} h={57} selected={n === size} onClick={() => onSize(n)}>
          {n}x{n}
        </Pill>
      ))}

      {Array.from({ length: 15 }, (_, i) => (
        <RoundButton key={first + i} x={spot.columnX[i % 5]} y={spot.rowY[Math.floor(i / 5)]} disabled={first + i > unlocked} onClick={() => onPick(first + i)}>
          {first + i}
        </RoundButton>
      ))}

      <Pill x={spot.custom[0]} y={spot.custom[1]} onClick={onCustom}>
        Custom
      </Pill>
      <Pill x={spot.random[0]} y={spot.random[1]} onClick={onRandom}>
        Random
      </Pill>

      <div className="count-label">Count:</div>
      <Toggle x={spot.toggle[0]} y={spot.toggle[1]} w={149} h={58} value={showCount} onChange={onCount} label="Count" fontSize={27} />

      <Pill x={spot.back[0]} y={spot.back[1]} onClick={onBack}>
        Back
      </Pill>
    </div>
  )
}
