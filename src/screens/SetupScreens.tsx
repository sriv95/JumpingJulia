import { Board } from '../components/Board'
import { useLayout } from '../components/LayoutContext'
import { GearButton, NavArrows, Pill } from '../components/controls'
import {
  MAX_SIZE,
  MAX_VALUE,
  MIN_SIZE,
  goalOf,
  samePos,
  withValue,
  type Difficulty,
  type Pos,
  type Puzzle,
} from '../game/engine'

const DIFFICULTIES: readonly { difficulty: Difficulty; label: string }[] = [
  { difficulty: 'easy', label: 'Easy' },
  { difficulty: 'medium', label: 'Medium' },
  { difficulty: 'hard', label: 'Hard' },
]

/** The two action buttons and the difficulty buttons: down the sides when wide, in rows under the board when upright. */
const SPOTS = {
  landscape: { first: [118, 208], second: [118, 390], difficulty: [[840, 208], [840, 298], [840, 388]] },
  portrait: { first: [160, 740], second: [440, 740], difficulty: [[110, 830], [300, 830], [490, 830]] },
} as const

interface RandomScreenProps {
  puzzle: Puzzle
  difficulty: Difficulty
  onDifficulty: (difficulty: Difficulty) => void
  onSize: (size: number) => void
  onDeal: () => void
  onPlay: () => void
  onGear: () => void
}

/** Pick a size and difficulty, deal random boards until one looks good, then play it. */
export function RandomScreen({
  puzzle,
  difficulty,
  onDifficulty,
  onSize,
  onDeal,
  onPlay,
  onGear,
}: RandomScreenProps) {
  const spot = SPOTS[useLayout().portrait ? 'portrait' : 'landscape']
  return (
    <div className="screen">
      <NavArrows
        prevLabel="Smaller board"
        nextLabel="Bigger board"
        onPrev={() => onSize(Math.max(MIN_SIZE, puzzle.size - 1))}
        onNext={() => onSize(Math.min(MAX_SIZE, puzzle.size + 1))}
      >
        {puzzle.size}
      </NavArrows>
      <Pill x={spot.first[0]} y={spot.first[1]} onClick={onPlay}>
        Play
      </Pill>
      <Pill x={spot.second[0]} y={spot.second[1]} onClick={onDeal}>
        Random
      </Pill>
      {DIFFICULTIES.map((d, i) => (
        <Pill key={d.difficulty} x={spot.difficulty[i][0]} y={spot.difficulty[i][1]} selected={d.difficulty === difficulty} onClick={() => onDifficulty(d.difficulty)}>
          {d.label}
        </Pill>
      ))}
      <Board puzzle={puzzle} />
      <GearButton onClick={onGear} />
    </div>
  )
}

interface CustomScreenProps {
  puzzle: Puzzle
  onPuzzle: (puzzle: Puzzle) => void
  onSize: (size: number) => void
  onReset: () => void
  onPlay: () => void
  onGear: () => void
}

/** Build your own board: click a square to cycle its number from 1 to 5. */
export function CustomScreen({ puzzle, onPuzzle, onSize, onReset, onPlay, onGear }: CustomScreenProps) {
  const spot = SPOTS[useLayout().portrait ? 'portrait' : 'landscape']
  const goal = goalOf(puzzle)
  const cycle = (pos: Pos) => {
    const value = puzzle.grid[pos.r][pos.c]
    onPuzzle(withValue(puzzle, pos, (value % MAX_VALUE) + 1))
  }
  return (
    <div className="screen">
      <NavArrows
        prevLabel="Smaller board"
        nextLabel="Bigger board"
        onPrev={() => onSize(Math.max(MIN_SIZE, puzzle.size - 1))}
        onNext={() => onSize(Math.min(MAX_SIZE, puzzle.size + 1))}
      >
        {puzzle.size}
      </NavArrows>
      <Pill x={spot.first[0]} y={spot.first[1]} onClick={onPlay}>
        Play
      </Pill>
      <Pill x={spot.second[0]} y={spot.second[1]} onClick={onReset}>
        Reset
      </Pill>
      <Board puzzle={puzzle} onSquare={cycle} canClick={(pos) => !samePos(pos, goal)} />
      <GearButton onClick={onGear} />
    </div>
  )
}
