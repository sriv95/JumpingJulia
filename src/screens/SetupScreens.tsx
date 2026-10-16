import { Board } from '../components/Board'
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

const DIFFICULTIES: readonly { difficulty: Difficulty; label: string; y: number }[] = [
  { difficulty: 'easy', label: 'Easy', y: 208 },
  { difficulty: 'medium', label: 'Medium', y: 298 },
  { difficulty: 'hard', label: 'Hard', y: 388 },
]

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
      <Pill x={118} y={208} onClick={onPlay}>
        Play
      </Pill>
      <Pill x={118} y={390} onClick={onDeal}>
        Random
      </Pill>
      {DIFFICULTIES.map((d) => (
        <Pill key={d.difficulty} x={840} y={d.y} selected={d.difficulty === difficulty} onClick={() => onDifficulty(d.difficulty)}>
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
      <Pill x={118} y={208} onClick={onPlay}>
        Play
      </Pill>
      <Pill x={118} y={390} onClick={onReset}>
        Reset
      </Pill>
      <Board puzzle={puzzle} onSquare={cycle} canClick={(pos) => !samePos(pos, goal)} />
      <GearButton onClick={onGear} />
    </div>
  )
}
