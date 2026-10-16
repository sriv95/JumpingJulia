import { PUZZLE_COUNT, type Dir, type Pos } from './game/engine'
import type { Notes, SquareNote } from './game/notes'
import type { AllRecords, PuzzleRecords, RecordEntry, RecordKind } from './game/records'

/** An unfinished (or finished) try at one built-in puzzle, kept so it survives switching puzzles. */
export interface SavedAttempt {
  readonly path: readonly Pos[]
  readonly heading: Dir
  readonly notes: Notes
}

/** Everything the game remembers about the player. */
export interface Progress {
  /** Built-in puzzles that have been won. */
  readonly solved: ReadonlySet<number>
  /** The puzzle the player was last on; "Start" returns to it. */
  readonly current: number
  readonly attempts: ReadonlyMap<number, SavedAttempt>
  readonly records: AllRecords
}

export const EMPTY_PROGRESS: Progress = {
  solved: new Set(),
  current: 1,
  attempts: new Map(),
  records: new Map(),
}

/** The highest puzzle number that can be played: one past the run of puzzles solved from number 1. */
export function unlockedUpTo(progress: Progress): number {
  let solvedRun = 0
  while (progress.solved.has(solvedRun + 1)) solvedRun++
  return Math.min(PUZZLE_COUNT, solvedRun + 1)
}

export function withCurrent(progress: Progress, id: number): Progress {
  return progress.current === id ? progress : { ...progress, current: id }
}

export function withAttempt(progress: Progress, id: number, attempt: SavedAttempt): Progress {
  return { ...progress, attempts: new Map(progress.attempts).set(id, attempt) }
}

export function withWin(progress: Progress, id: number, records: AllRecords): Progress {
  return { ...progress, solved: new Set(progress.solved).add(id), records }
}

// ---- Saving to the browser ----------------------------------------------------------

const STORAGE_KEY = 'jumping-julia:progress:v1'

type StoredPos = [number, number]

interface Stored {
  solved: number[]
  current: number
  attempts: Record<string, { path: StoredPos[]; heading: Dir; notes: [string, SquareNote][] }>
  records: Record<string, Partial<Record<RecordKind, { value: number; path: StoredPos[] }>>>
}

const DIRS: readonly Dir[] = ['up', 'right', 'down', 'left']
const RECORD_KINDS: readonly RecordKind[] = ['leastSquares', 'mostSquares', 'leastJumps', 'mostJumps']

const isId = (n: unknown): n is number =>
  typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= PUZZLE_COUNT
const isIndex = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < 6

function readPath(value: unknown): Pos[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 500) return null
  const path: Pos[] = []
  for (const item of value) {
    if (!Array.isArray(item) || !isIndex(item[0]) || !isIndex(item[1])) return null
    path.push({ r: item[0], c: item[1] })
  }
  return path
}

function readNotes(value: unknown): Notes {
  const notes = new Map<string, SquareNote>()
  if (!Array.isArray(value)) return notes
  for (const item of value) {
    if (!Array.isArray(item) || typeof item[0] !== 'string' || typeof item[1] !== 'object' || !item[1]) continue
    const raw = item[1] as { arrows?: unknown; cross?: unknown }
    const arrows = Array.isArray(raw.arrows) ? raw.arrows.filter((d): d is Dir => DIRS.includes(d)) : []
    const cross = raw.cross === true
    if (/^\d,\d$/.test(item[0]) && (arrows.length > 0 || cross)) notes.set(item[0], { arrows, cross })
  }
  return notes
}

/** Read saved progress. Anything missing or damaged falls back to a fresh start. */
export function loadProgress(): Progress {
  try {
    const text = window.localStorage.getItem(STORAGE_KEY)
    if (!text) return EMPTY_PROGRESS
    const stored = JSON.parse(text) as Partial<Stored>

    const solved = new Set<number>((Array.isArray(stored.solved) ? stored.solved : []).filter(isId))

    const attempts = new Map<number, SavedAttempt>()
    for (const [key, raw] of Object.entries(stored.attempts ?? {})) {
      const id = Number(key)
      const path = readPath(raw?.path)
      if (!isId(id) || !path) continue
      const heading = DIRS.includes(raw.heading) ? raw.heading : 'down'
      attempts.set(id, { path, heading, notes: readNotes(raw.notes) })
    }

    const records = new Map<number, PuzzleRecords>()
    for (const [key, raw] of Object.entries(stored.records ?? {})) {
      const id = Number(key)
      if (!isId(id) || !raw) continue
      const entries: PuzzleRecords = {}
      for (const kind of RECORD_KINDS) {
        const item = raw[kind]
        const path = readPath(item?.path)
        if (item && path && typeof item.value === 'number') {
          entries[kind] = { value: item.value, path } satisfies RecordEntry
        }
      }
      records.set(id, entries)
    }

    const progress: Progress = {
      solved,
      current: isId(stored.current) ? stored.current : 1,
      attempts,
      records,
    }
    // A puzzle that is not unlocked cannot be the current one.
    return { ...progress, current: Math.min(progress.current, unlockedUpTo(progress)) }
  } catch {
    return EMPTY_PROGRESS
  }
}

const toStoredPath = (path: readonly Pos[]): StoredPos[] => path.map((p) => [p.r, p.c])

/** Write progress to the browser. Silently does nothing where storage is unavailable. */
export function saveProgress(progress: Progress): void {
  const stored: Stored = {
    solved: [...progress.solved],
    current: progress.current,
    attempts: {},
    records: {},
  }
  for (const [id, a] of progress.attempts) {
    stored.attempts[id] = { path: toStoredPath(a.path), heading: a.heading, notes: [...a.notes] }
  }
  for (const [id, entries] of progress.records) {
    const out: Stored['records'][string] = {}
    for (const kind of RECORD_KINDS) {
      const entry = entries[kind]
      if (entry) out[kind] = { value: entry.value, path: toStoredPath(entry.path) }
    }
    stored.records[id] = out
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // Storage can be blocked (private window, embedded view); the game still works without it.
  }
}

/** Wipe everything the game stored in the browser. */
export function clearSavedProgress(): void {
  try {
    window.localStorage.clear()
  } catch {
    // Storage may be unavailable; there is nothing to clear then.
  }
}
