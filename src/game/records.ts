import { distinctSquares, type Pos } from './engine'

export type RecordKind = 'leastSquares' | 'mostSquares' | 'leastJumps' | 'mostJumps'

export interface RecordEntry {
  readonly value: number
  /** The winning route, so it can be stepped through in Replay. */
  readonly path: readonly Pos[]
}

/** The best and worst wins on one puzzle. */
export type PuzzleRecords = Partial<Record<RecordKind, RecordEntry>>

/** Records for the built-in puzzles, by puzzle number. Kept for the session only. */
export type AllRecords = ReadonlyMap<number, PuzzleRecords>

export const RECORD_LABELS: readonly { kind: RecordKind; label: string }[] = [
  { kind: 'leastSquares', label: 'Least Squares' },
  { kind: 'mostSquares', label: 'Most Squares' },
  { kind: 'leastJumps', label: 'Least Jumps' },
  { kind: 'mostJumps', label: 'Most Jumps' },
]

/**
 * Add a win to the records. "Squares" is how many different squares the route
 * stood on; "jumps" is how many jumps it took. A record only changes when the
 * new win beats it, so the first win to reach a value keeps it.
 */
export function recordWin(all: AllRecords, puzzleId: number, path: readonly Pos[]): AllRecords {
  const squares = distinctSquares(path)
  const jumps = path.length - 1
  const old = all.get(puzzleId) ?? {}
  const entry = (value: number): RecordEntry => ({ value, path })
  const updated: PuzzleRecords = {
    leastSquares: !old.leastSquares || squares < old.leastSquares.value ? entry(squares) : old.leastSquares,
    mostSquares: !old.mostSquares || squares > old.mostSquares.value ? entry(squares) : old.mostSquares,
    leastJumps: !old.leastJumps || jumps < old.leastJumps.value ? entry(jumps) : old.leastJumps,
    mostJumps: !old.mostJumps || jumps > old.mostJumps.value ? entry(jumps) : old.mostJumps,
  }
  return new Map(all).set(puzzleId, updated)
}
