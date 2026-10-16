import { useState } from 'react'
import { Board, type BunnyPlacement } from '../components/Board'
import { GearButton, NavArrows, Pill } from '../components/controls'
import { useLayout } from '../components/LayoutContext'
import { NotesPanel, RecordsPanel, type PanelKind } from '../components/SidePanels'
import {
  directionBetween,
  isGoal,
  movesFrom,
  type Dir,
  type Pos,
  type Puzzle,
} from '../game/engine'
import { NO_NOTES, applyNote, type NoteTool, type Notes } from '../game/notes'
import {
  jumpCount,
  jumpTo,
  newPlay,
  reachable,
  restart,
  restorePlay,
  statusOf,
  undo,
  visitNumbers,
  type PlayState,
} from '../game/play'
import type { PuzzleRecords, RecordKind } from '../game/records'
import type { SavedAttempt } from '../progress'

export type Source =
  | { kind: 'builtin'; id: number }
  | { kind: 'random' }
  | { kind: 'custom' }

interface PlaySessionProps {
  source: Source
  puzzle: Puzzle
  /** A saved attempt to pick up from (built-in puzzles only). */
  saved?: SavedAttempt
  /** Called after every change so the attempt can be kept (built-in puzzles only). */
  onSave: (attempt: SavedAttempt) => void
  /** Built-in puzzles: whether the next puzzle has been unlocked. */
  nextUnlocked: boolean
  showCount: boolean
  tool: NoteTool
  onTool: (tool: NoteTool) => void
  multi: boolean
  onMulti: (multi: boolean) => void
  /** Records for this puzzle (built-in puzzles only). */
  records: PuzzleRecords
  onWin: (path: readonly Pos[]) => void
  onGear: () => void
  /** Built-in puzzles: move to the previous (-1) or next (+1) puzzle. */
  onStep: (delta: -1 | 1) => void
  /** Random puzzles: deal a new board. */
  onNewRandom: () => void
  /** Custom puzzles: go back to the editor. */
  onEditCustom: () => void
}

/** A step-through of one of the recorded wins. */
interface Replay {
  readonly path: readonly Pos[]
  readonly step: number
  readonly heading: Dir
}

/** Where the Undo / Random-or-Custom / Restart buttons sit: down the left, or in a row under the board (clear of the bottom sheets). */
const BUTTONS = {
  landscape: { undo: [118, 208], middle: [118, 299], restart: [118, 390], back: [118, 208] },
  portrait: { undo: [110, 740], middle: [300, 740], restart: [490, 740], back: [300, 740] },
} as const

const LOSE_MESSAGE = 'There is nowhere left to move. Undo or Restart to try again!'

/** One sitting with a puzzle: the attempt, the notes, the side panels and any replay. */
export function PlaySession({
  source,
  puzzle,
  saved,
  onSave,
  nextUnlocked,
  showCount,
  tool,
  onTool,
  multi,
  onMulti,
  records,
  onWin,
  onGear,
  onStep,
  onNewRandom,
  onEditCustom,
}: PlaySessionProps) {
  const { portrait } = useLayout()
  const at = BUTTONS[portrait ? 'portrait' : 'landscape']
  const [play, setPlay] = useState<PlayState>(() =>
    saved ? restorePlay(puzzle, saved.path, saved.heading) : newPlay(puzzle),
  )
  const [notes, setNotes] = useState<Notes>(() => saved?.notes ?? NO_NOTES)
  const [panel, setPanel] = useState<PanelKind | null>(null)
  const [replay, setReplay] = useState<Replay | null>(null)

  // Every change to the attempt or the notes is handed up to be saved.
  const commit = (nextPlay: PlayState, nextNotes: Notes) => {
    setPlay(nextPlay)
    setNotes(nextNotes)
    if (source.kind === 'builtin') {
      onSave({ path: nextPlay.path, heading: nextPlay.heading, notes: nextNotes })
    }
  }

  const togglePanel = (kind: PanelKind) => setPanel((open) => (open === kind ? null : kind))

  // What the board shows: the live attempt, or the step being replayed.
  const shownPath = replay ? replay.path.slice(0, replay.step + 1) : play.path
  const shownPos = shownPath[shownPath.length - 1]
  const bunny: BunnyPlacement = { pos: shownPos, heading: replay ? replay.heading : play.heading }
  const outlined = replay ? movesFrom(puzzle, shownPos) : reachable(play)
  const won = replay ? isGoal(puzzle, shownPos) : statusOf(play) === 'won'
  const stuck = !replay && statusOf(play) === 'stuck'

  const notesOpen = panel === 'notes'

  const handleSquare = (pos: Pos) => {
    if (notesOpen) {
      commit(play, applyNote(notes, pos, tool, multi))
      return
    }
    if (replay) return
    const next = jumpTo(play, pos)
    if (next === play) return
    commit(next, notes)
    if (statusOf(next) === 'won') onWin(next.path)
  }

  const canClick = (pos: Pos) => {
    if (notesOpen) return !isGoal(puzzle, pos)
    return !replay && outlined.some((p) => p.r === pos.r && p.c === pos.c)
  }

  const startReplay = (kind: RecordKind) => {
    const entry = records[kind]
    if (!entry) return
    setReplay({ path: entry.path, step: 0, heading: play.heading })
  }

  const stepReplay = (delta: -1 | 1) => {
    setReplay((r) => {
      if (!r) return r
      const to = r.step + delta
      if (to < 0 || to >= r.path.length) return r
      const heading =
        delta === 1
          ? directionBetween(r.path[r.step], r.path[to])
          : directionBetween(r.path[to], r.path[r.step])
      return { ...r, step: to, heading }
    })
  }

  const leaveReplay = () => {
    setReplay(null)
    commit(newPlay(puzzle), notes)
    setPanel(null)
  }

  const showNav = source.kind === 'builtin'

  return (
    <div className="screen">
      {!replay && (
        <div className="jumps">
          Jumps: <span>{jumpCount(play)}</span>
        </div>
      )}

      {replay && <div className="replay-label">REPLAY</div>}

      {showNav && (
        <NavArrows
          prevLabel={replay ? 'Previous step' : 'Previous puzzle'}
          nextLabel={replay ? 'Next step' : 'Next puzzle'}
          onPrev={() => (replay ? stepReplay(-1) : onStep(-1))}
          onNext={() => (replay ? stepReplay(1) : onStep(1))}
          prevDisabled={!replay && source.kind === 'builtin' && source.id <= 1}
          nextDisabled={!replay && !nextUnlocked}
        >
          {replay ? `${replay.step}/${replay.path.length - 1}` : source.kind === 'builtin' ? source.id : ''}
        </NavArrows>
      )}

      {replay ? (
        <Pill x={at.back[0]} y={at.back[1]} onClick={leaveReplay}>
          Back
        </Pill>
      ) : (
        <>
          <Pill x={at.undo[0]} y={at.undo[1]} onClick={() => commit(undo(play), notes)}>
            Undo
          </Pill>
          {source.kind === 'random' && (
            <Pill x={at.middle[0]} y={at.middle[1]} onClick={onNewRandom}>
              Random
            </Pill>
          )}
          {source.kind === 'custom' && (
            <Pill x={at.middle[0]} y={at.middle[1]} onClick={onEditCustom}>
              Custom
            </Pill>
          )}
          <Pill x={at.restart[0]} y={at.restart[1]} onClick={() => commit(restart(play), notes)}>
            Restart
          </Pill>
        </>
      )}

      <Board
        puzzle={puzzle}
        bunny={bunny}
        reachable={outlined}
        visits={visitNumbers(puzzle.size, shownPath)}
        showCount={showCount}
        notes={notes}
        onSquare={handleSquare}
        canClick={canClick}
      />

      {won && <div className="message win">You win!</div>}
      {stuck && <div className="message lose">{LOSE_MESSAGE}</div>}

      {source.kind === 'builtin' && !replay && (
        <RecordsPanel
          tabHidden={notesOpen}
          open={panel === 'records'}
          onToggle={() => togglePanel('records')}
          records={records}
          onReplay={startReplay}
        />
      )}
      <NotesPanel
        tabHidden={panel === 'records'}
        open={notesOpen}
        onToggle={() => togglePanel('notes')}
        tool={tool}
        onTool={onTool}
        multi={multi}
        onMulti={(value) => {
          onMulti(value)
          commit(play, NO_NOTES)
        }}
        onClear={() => commit(play, NO_NOTES)}
      />

      <GearButton onClick={onGear} />
    </div>
  )
}
