import { useState, type CSSProperties } from 'react'
import { boardLayout } from '../layout'
import { useLayout } from './LayoutContext'
import { goalOf, samePos, type Dir, type Pos, type Puzzle } from '../game/engine'
import { noteAt, type Notes } from '../game/notes'
import { CURRENT_COLOR, GOAL_COLOR, PAW_FOR_VALUE, TILE_COLORS, artUrl } from '../theme'

export interface BunnyPlacement {
  readonly pos: Pos
  readonly heading: Dir
}

interface BoardProps {
  puzzle: Puzzle
  /** Julia, when a puzzle is being played. */
  bunny?: BunnyPlacement
  /** Squares to outline as places Julia can jump to. */
  reachable?: readonly Pos[]
  /** Most recent visit number for each square, shown as paw prints when `showCount` is on. */
  visits?: readonly (readonly number[])[]
  showCount?: boolean
  notes?: Notes
  /** Called when a square is clicked. Squares for which this returns false are inert. */
  onSquare?: (pos: Pos) => void
  canClick?: (pos: Pos) => boolean
}

const ANGLE: Record<Dir, number> = { up: 0, right: 90, down: 180, left: 270 }

/** The arrows of a note sit just outside the square's edge, nudged sideways so all four fit. */
const ARROW_SPOT: Record<Dir, { x: number; y: number; rotate: number }> = {
  right: { x: 0.6, y: -0.17, rotate: 0 },
  up: { x: -0.17, y: -0.62, rotate: -90 },
  left: { x: -0.65, y: 0.17, rotate: 180 },
  down: { x: 0.15, y: 0.6, rotate: 90 },
}

const LABEL = 'absolute -translate-1/2 leading-none font-bold whitespace-nowrap'
const LAYER = 'pointer-events-none absolute inset-0'
const SQUARE =
  'pointer-events-auto absolute t-round-11 border-0 bg-[length:100%_100%] bg-no-repeat p-0 [transition:background-color_0.12s]'
/** The ring around a square Julia can jump to: blue, then a white line just inside it. */
const OUTLINED =
  'shadow-[inset_0_0_0_calc(var(--t)*0.045)_#065ef9,inset_0_0_0_calc(var(--t)*0.06)_#fff]'

const columnLetter = (c: number) => String.fromCharCode(65 + c)

export function Board({
  puzzle,
  bunny,
  reachable = [],
  visits,
  showCount,
  notes,
  onSquare,
  canClick,
}: BoardProps) {
  const { size } = puzzle
  const { portrait } = useLayout()
  const { pitch, tile, gap, left, top } = boardLayout(size, portrait)
  const goal = goalOf(puzzle)

  // Julia turns by the shortest way round instead of spinning through a full turn.
  const [turn, setTurn] = useState<{ heading: Dir | null; angle: number }>({
    heading: bunny ? bunny.heading : null,
    angle: bunny ? ANGLE[bunny.heading] : 0,
  })
  let angle = turn.angle
  if (bunny && bunny.heading !== turn.heading) {
    let delta = (ANGLE[bunny.heading] - turn.angle) % 360
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    angle = turn.angle + delta
    setTurn({ heading: bunny.heading, angle })
  }

  const squareLeft = (c: number) => left + c * pitch
  const squareTop = (r: number) => top + r * pitch

  const rows = Array.from({ length: size }, (_, r) => r)
  const cols = Array.from({ length: size }, (_, c) => c)

  const bunnyCentre = (() => {
    if (!bunny) return { x: 0, y: 0 }
    const vertical = bunny.heading === 'up' || bunny.heading === 'down'
    const dx = (vertical ? 0.29 : 0.51) * tile
    const dy = (vertical ? 0.51 : 0.29) * tile
    return { x: squareLeft(bunny.pos.c) + dx, y: squareTop(bunny.pos.r) + dy }
  })()

  return (
    <div className="pointer-events-none absolute inset-0" style={{ '--t': `${tile}px` } as CSSProperties}>
      <div className={`${LABEL} t-text-19`} style={labelBox(squareLeft(0) + tile / 2, squareTop(0) - 0.15 * tile)}>
        Start
      </div>
      <div
        className={`${LABEL} t-text-19`}
        style={labelBox(squareLeft(size - 1) + tile / 2, squareTop(size - 1) + tile + 0.17 * tile)}
      >
        Goal
      </div>
      {rows.map((r) => (
        <div
          key={`row-${r}`}
          className={`${LABEL} t-text-42`}
          style={labelBox(left - 2 * gap, squareTop(r) + tile / 2)}
        >
          {r + 1}
        </div>
      ))}
      {cols.map((c) => (
        <div
          key={`col-${c}`}
          className={`${LABEL} t-text-42`}
          style={labelBox(squareLeft(c) + tile / 2, top + (size - 1) * pitch + tile + 2 * gap)}
        >
          {columnLetter(c)}
        </div>
      ))}

      {rows.map((r) =>
        cols.map((c) => {
          const pos = { r, c }
          const isGoal = samePos(pos, goal)
          const hasBunny = !!bunny && samePos(bunny.pos, pos)
          const value = puzzle.grid[r][c]
          const note = notes ? noteAt(notes, pos) : undefined
          const outlined = reachable.some((p) => samePos(p, pos))
          const clickable = !!onSquare && (canClick ? canClick(pos) : true)

          const style: CSSProperties = {
            left: squareLeft(c),
            top: squareTop(r),
            width: tile,
            height: tile,
            backgroundColor: hasBunny ? CURRENT_COLOR : isGoal ? GOAL_COLOR : TILE_COLORS[value],
          }
          if (note?.cross && !hasBunny) style.backgroundImage = `url(${artUrl('tile-x')})`

          const name = `${columnLetter(c)}${r + 1}`
          return (
            <button
              key={`${r}-${c}`}
              type="button"
              className={`${SQUARE} ${outlined ? OUTLINED : ''} ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              style={style}
              onClick={clickable ? () => onSquare?.(pos) : undefined}
              tabIndex={clickable ? 0 : -1}
              aria-label={
                isGoal
                  ? `${name}, goal`
                  : `${name}, jump ${value}${outlined ? ', you can jump here' : ''}`
              }
            >
              {isGoal ? (
                <img className="absolute t-top-60 t-left-58 h-auto t-w-34" src={artUrl('star')} alt="" draggable={false} />
              ) : (
                <span className="absolute t-top-74 t-left-62 -translate-1/2 font-digit t-text-47 leading-none font-bold text-white">{value}</span>
              )}
            </button>
          )
        }),
      )}

      <div className={LAYER}>
        {notes &&
          Array.from(notes).flatMap(([key, note]) => {
            const [r, c] = key.split(',').map(Number)
            const colour = TILE_COLORS[puzzle.grid[r][c]] ?? GOAL_COLOR
            return note.arrows.map((dir) => {
              const spot = ARROW_SPOT[dir]
              return (
                <span
                  key={`${key}-${dir}`}
                  className="absolute t-h-23 t-w-17 mask-contain mask-center mask-no-repeat"
                  style={{
                    left: squareLeft(c) + tile / 2 + spot.x * tile,
                    top: squareTop(r) + tile / 2 + spot.y * tile,
                    backgroundColor: colour,
                    maskImage: `url(${artUrl('arrow')})`,
                    WebkitMaskImage: `url(${artUrl('arrow')})`,
                    transform: `translate(-50%, -50%) rotate(${spot.rotate}deg)`,
                  }}
                />
              )
            })
          })}
      </div>

      {showCount && visits && (
        <div className={LAYER}>
          {visits.flatMap((row, r) =>
            row.map((n, c) => {
              if (n === 0) return null
              const onBunny = !!bunny && samePos(bunny.pos, { r, c })
              const paw = onBunny || (r === size - 1 && c === size - 1) ? 'paw-darkblue' : PAW_FOR_VALUE[puzzle.grid[r][c]]
              return (
                <span
                  key={`paw-${r}-${c}`}
                  className="absolute t-h-43 t-w-42"
                  style={{ left: squareLeft(c) + 0.76 * tile, top: squareTop(r) + 0.74 * tile }}
                >
                  <img className="img-fill" src={artUrl(paw)} alt="" draggable={false} />
                  <span className="absolute top-[62%] left-[58%] -translate-1/2 t-text-20 leading-none font-bold text-white">{n}</span>
                </span>
              )
            }),
          )}
        </div>
      )}

      {bunny && (
        <img
          className="pointer-events-none absolute t-h-89 w-auto [transition:left_0.22s_ease,top_0.22s_ease,transform_0.22s_ease] motion-reduce:[transition:none]"
          src={artUrl('bunny')}
          alt="Julia the bunny"
          draggable={false}
          style={{
            left: bunnyCentre.x,
            top: bunnyCentre.y,
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          }}
        />
      )}
    </div>
  )
}

function labelBox(x: number, y: number): CSSProperties {
  return { left: x, top: y }
}
