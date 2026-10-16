/**
 * The game is drawn on a fixed stage that is scaled to fit the window: 960 x 600 when the
 * window is wider than tall, and 600 x 960 when it is held upright.
 */
export const STAGE_LONG = 960
export const STAGE_SHORT = 600

export function stageSize(portrait: boolean): { w: number; h: number } {
  return portrait ? { w: STAGE_SHORT, h: STAGE_LONG } : { w: STAGE_LONG, h: STAGE_SHORT }
}

/** Where the board sits on the stage and how big its squares are. */
export interface BoardLayout {
  /** Distance from one square's left edge to the next. */
  readonly pitch: number
  /** Side length of a square. */
  readonly tile: number
  readonly gap: number
  /** Left and top edge of the first square. */
  readonly left: number
  readonly top: number
}

const BOARD_CENTER = { landscape: { x: 480, y: 330 }, portrait: { x: 300, y: 390 } }
const BOARD_MAX = { landscape: 413, portrait: 510 }
const PITCH_MAX = { landscape: 82.667, portrait: 85 }

export function boardLayout(size: number, portrait = false): BoardLayout {
  const mode = portrait ? 'portrait' : 'landscape'
  const pitch = Math.min(PITCH_MAX[mode], BOARD_MAX[mode] / size)
  const tile = 0.8 * pitch
  const gap = pitch - tile
  const centre = BOARD_CENTER[mode]
  return {
    pitch,
    tile,
    gap,
    left: centre.x - (size * pitch) / 2 + gap / 2,
    top: centre.y - (size * pitch) / 2 + gap / 2,
  }
}
