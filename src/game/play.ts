import {
  START,
  directionBetween,
  distinctSquares,
  isGoal,
  movesFrom,
  samePos,
  type Dir,
  type Pos,
  type Puzzle,
} from './engine'

/** One attempt at a puzzle: every square Julia has stood on, in order. */
export interface PlayState {
  readonly puzzle: Puzzle
  /** Squares visited, starting with the start square. */
  readonly path: readonly Pos[]
  /** The way Julia is facing. She starts facing down and turns to face each jump. */
  readonly heading: Dir
}

export type PlayStatus = 'playing' | 'won' | 'stuck'

export function newPlay(puzzle: Puzzle): PlayState {
  return { puzzle, path: [START], heading: 'down' }
}

/**
 * Rebuild an attempt from a saved route. A route that is not a legal run of jumps
 * from the start square (a damaged save) gives a fresh attempt instead.
 */
export function restorePlay(puzzle: Puzzle, path: readonly Pos[], heading: Dir): PlayState {
  const fresh = newPlay(puzzle)
  if (path.length === 0 || !samePos(path[0], START)) return fresh
  let state = fresh
  for (const pos of path.slice(1)) {
    const next = jumpTo(state, pos)
    if (next === state) return fresh
    state = next
  }
  return { ...state, heading }
}

export function currentPos(state: PlayState): Pos {
  return state.path[state.path.length - 1]
}

export function jumpCount(state: PlayState): number {
  return state.path.length - 1
}

export function statusOf(state: PlayState): PlayStatus {
  const here = currentPos(state)
  if (isGoal(state.puzzle, here)) return 'won'
  return movesFrom(state.puzzle, here).length === 0 ? 'stuck' : 'playing'
}

/** Squares Julia can jump to right now (none once the puzzle is won or stuck). */
export function reachable(state: PlayState): Pos[] {
  return movesFrom(state.puzzle, currentPos(state))
}

export function jumpTo(state: PlayState, to: Pos): PlayState {
  const from = currentPos(state)
  if (!reachable(state).some((p) => samePos(p, to))) return state
  return { ...state, path: [...state.path, to], heading: directionBetween(from, to) }
}

/**
 * Take back the last jump. Julia walks backwards, so she keeps facing the way
 * she was heading when she made the jump that is being undone.
 */
export function undo(state: PlayState): PlayState {
  if (state.path.length < 2) return state
  const last = state.path[state.path.length - 1]
  const before = state.path[state.path.length - 2]
  return { ...state, path: state.path.slice(0, -1), heading: directionBetween(before, last) }
}

export function restart(state: PlayState): PlayState {
  return newPlay(state.puzzle)
}

/**
 * The number of the most recent visit to each square (the start counts as 1),
 * or 0 for squares Julia has not stood on. Shown on the squares by "Count".
 */
export function visitNumbers(size: number, path: readonly Pos[]): number[][] {
  const visits = Array.from({ length: size }, () => Array<number>(size).fill(0))
  path.forEach((p, i) => {
    visits[p.r][p.c] = i + 1
  })
  return visits
}

export function squaresVisited(state: PlayState): number {
  return distinctSquares(state.path)
}
