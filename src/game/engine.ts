import { BUILT_IN_PUZZLES } from './puzzles'

export type Dir = 'up' | 'right' | 'down' | 'left'

export interface Pos {
  readonly r: number
  readonly c: number
}

/**
 * A square board of numbered squares. `grid[r][c]` is how many squares Julia
 * must jump from that square. The goal (bottom right) holds 0 because nothing
 * is ever jumped from it.
 */
export interface Puzzle {
  readonly size: number
  readonly grid: readonly (readonly number[])[]
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export const MIN_SIZE = 2
export const MAX_SIZE = 6
export const MAX_VALUE = 5
export const PUZZLE_COUNT = BUILT_IN_PUZZLES.length

export const DELTA: Record<Dir, Pos> = {
  up: { r: -1, c: 0 },
  right: { r: 0, c: 1 },
  down: { r: 1, c: 0 },
  left: { r: 0, c: -1 },
}

const DIR_ORDER: readonly Dir[] = ['right', 'up', 'left', 'down']

export const START: Pos = { r: 0, c: 0 }

export function samePos(a: Pos, b: Pos): boolean {
  return a.r === b.r && a.c === b.c
}

export function goalOf(puzzle: Puzzle): Pos {
  return { r: puzzle.size - 1, c: puzzle.size - 1 }
}

export function isGoal(puzzle: Puzzle, pos: Pos): boolean {
  return samePos(pos, goalOf(puzzle))
}

/** The built-in puzzle with the given number (1-45). */
export function builtInPuzzle(id: number): Puzzle {
  return parsePuzzle(BUILT_IN_PUZZLES[id - 1])
}

/** Size of the board that built-in puzzle `id` is played on. */
export function builtInSize(id: number): number {
  return BUILT_IN_PUZZLES[id - 1].length
}

export function parsePuzzle(rows: readonly string[]): Puzzle {
  const size = rows.length
  const grid = rows.map((row) => Array.from(row, (ch) => (ch === 'G' ? 0 : Number(ch))))
  return { size, grid }
}

/** A board of the given size where every square is a 1. */
export function blankPuzzle(size: number): Puzzle {
  const grid = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => (r === size - 1 && c === size - 1 ? 0 : 1)),
  )
  return { size, grid }
}

/** Copy of a puzzle with one square changed. */
export function withValue(puzzle: Puzzle, pos: Pos, value: number): Puzzle {
  const grid = puzzle.grid.map((row, r) =>
    row.map((v, c) => (r === pos.r && c === pos.c ? value : v)),
  )
  return { size: puzzle.size, grid }
}

/** Squares Julia can reach in one jump: exactly N squares up, down, left or right. */
export function movesFrom(puzzle: Puzzle, pos: Pos): Pos[] {
  if (isGoal(puzzle, pos)) return []
  const n = puzzle.grid[pos.r][pos.c]
  const moves: Pos[] = []
  for (const dir of DIR_ORDER) {
    const r = pos.r + DELTA[dir].r * n
    const c = pos.c + DELTA[dir].c * n
    if (r >= 0 && r < puzzle.size && c >= 0 && c < puzzle.size) moves.push({ r, c })
  }
  return moves
}

/** The compass direction of a straight jump from `from` to `to`. */
export function directionBetween(from: Pos, to: Pos): Dir {
  if (to.c > from.c) return 'right'
  if (to.c < from.c) return 'left'
  return to.r > from.r ? 'down' : 'up'
}

/** Number of different squares a path touches (the start and goal count). */
export function distinctSquares(path: readonly Pos[]): number {
  return new Set(path.map((p) => `${p.r},${p.c}`)).size
}

/** A route with the fewest jumps from the start to the goal, or null if there is none. */
export function shortestSolution(puzzle: Puzzle): Pos[] | null {
  const key = (p: Pos) => p.r * puzzle.size + p.c
  const previous = new Map<number, Pos | null>([[key(START), null]])
  const queue: Pos[] = [START]
  for (let i = 0; i < queue.length; i++) {
    const here = queue[i]
    if (isGoal(puzzle, here)) {
      const route: Pos[] = []
      for (let p: Pos | null = here; p; p = previous.get(key(p)) ?? null) route.unshift(p)
      return route
    }
    for (const next of movesFrom(puzzle, here)) {
      if (!previous.has(key(next))) {
        previous.set(key(next), here)
        queue.push(next)
      }
    }
  }
  return null
}

/** Whether a fewest-jumps count suits a difficulty (matches the original game's boards). */
function suits(difficulty: Difficulty, size: number, jumps: number): boolean {
  if (difficulty === 'easy') return jumps === 2
  if (difficulty === 'medium') return jumps === 3 || (size >= 6 && jumps === 4)
  return jumps >= (size >= 6 ? 5 : 4)
}

const IDEAL_JUMPS: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 5 }

/**
 * A random board that can be solved, graded by how many jumps the shortest
 * solution needs: easy = 2, medium = 3, hard = 4 or more. Squares hold 1 to
 * size-1 (a bigger number can never be jumped on a board that small). Tiny
 * boards cannot always reach the requested grade, so the closest is used.
 */
export function randomPuzzle(
  size: number,
  difficulty: Difficulty,
  random: () => number = Math.random,
): Puzzle {
  const top = Math.max(1, Math.min(MAX_VALUE, size - 1))
  let best: Puzzle | null = null
  let bestGap = Infinity
  for (let attempt = 0; attempt < 4000; attempt++) {
    const grid = Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) =>
        r === size - 1 && c === size - 1 ? 0 : 1 + Math.floor(random() * top),
      ),
    )
    const puzzle: Puzzle = { size, grid }
    const route = shortestSolution(puzzle)
    if (!route) continue
    const jumps = route.length - 1
    if (suits(difficulty, size, jumps)) return puzzle
    const gap = Math.abs(jumps - IDEAL_JUMPS[difficulty])
    if (gap < bestGap) {
      best = puzzle
      bestGap = gap
    }
  }
  return best ?? blankPuzzle(size)
}
