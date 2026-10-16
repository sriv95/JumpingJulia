import type { Dir, Pos } from './engine'

/** What the Notes tab can draw on a square: an arrow for a direction, or a cross. */
export type NoteTool = Dir | 'x' | 'erase'

export interface SquareNote {
  readonly arrows: readonly Dir[]
  readonly cross: boolean
}

/** Notes keyed by "row,col". Squares without notes are absent. */
export type Notes = ReadonlyMap<string, SquareNote>

export const NO_NOTES: Notes = new Map()

const keyOf = (pos: Pos) => `${pos.r},${pos.c}`

export function noteAt(notes: Notes, pos: Pos): SquareNote | undefined {
  return notes.get(keyOf(pos))
}

/**
 * Apply the selected tool to a square.
 * - erase removes everything on the square.
 * - With multi-note off a square holds a single note: a new note replaces the
 *   old one, and choosing the same note again removes it.
 * - With multi-note on a square can hold several arrows (and a cross); choosing
 *   one that is already there removes just that one.
 */
export function applyNote(notes: Notes, pos: Pos, tool: NoteTool, multi: boolean): Notes {
  const next = new Map(notes)
  const key = keyOf(pos)
  const old = notes.get(key) ?? { arrows: [], cross: false }

  if (tool === 'erase') {
    next.delete(key)
    return next
  }

  let updated: SquareNote
  if (tool === 'x') {
    updated = { arrows: multi ? old.arrows : [], cross: !old.cross }
  } else {
    const has = old.arrows.includes(tool)
    const arrows = multi
      ? has
        ? old.arrows.filter((d) => d !== tool)
        : [...old.arrows, tool]
      : has && old.arrows.length === 1 && !old.cross
        ? []
        : [tool]
    updated = { arrows, cross: multi ? old.cross : false }
  }

  if (updated.arrows.length === 0 && !updated.cross) next.delete(key)
  else next.set(key, updated)
  return next
}
