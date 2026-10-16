/** The game is drawn on a fixed 960 x 600 stage that is scaled to fit the window. */
export const STAGE_W = 960
export const STAGE_H = 600

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

const BOARD_CENTER_X = 480
const BOARD_CENTER_Y = 330
const BOARD_MAX = 413
const PITCH_MAX = 82.667

export function boardLayout(size: number): BoardLayout {
  const pitch = Math.min(PITCH_MAX, BOARD_MAX / size)
  const tile = 0.8 * pitch
  const gap = pitch - tile
  return {
    pitch,
    tile,
    gap,
    left: BOARD_CENTER_X - (size * pitch) / 2 + gap / 2,
    top: BOARD_CENTER_Y - (size * pitch) / 2 + gap / 2,
  }
}
