import type { CSSProperties, ReactNode } from 'react'
import { artUrl } from '../theme'
import type { Dir } from '../game/engine'
import type { NoteTool } from '../game/notes'
import { RECORD_LABELS, type PuzzleRecords, type RecordKind } from '../game/records'
import { Pill, Toggle } from './controls'

export type PanelKind = 'records' | 'notes'

interface PanelShellProps {
  title: string
  open: boolean
  onToggle: () => void
  /** Hide the tab while the other panel is open. */
  tabHidden?: boolean
  /** Left edge of the panel's frame on the stage. */
  frameLeft: number
  /** How far the panel slides to the right to hide, in stage pixels. */
  hiddenOffset: number
  /** Where the tab sits, relative to the top of the frame. */
  tabTop: number
  tabHeight: number
  children: ReactNode
}

const FRAME_TOP = 78
const FRAME_HEIGHT = 356

/** A panel that slides in from the right edge, with a blue tab to open and close it. */
function PanelShell({
  title,
  open,
  onToggle,
  tabHidden = false,
  frameLeft,
  hiddenOffset,
  tabTop,
  tabHeight,
  children,
}: PanelShellProps) {
  const style: CSSProperties = {
    left: frameLeft,
    top: FRAME_TOP,
    width: 960 - frameLeft + 40,
    height: FRAME_HEIGHT,
    transform: `translateX(${open ? 0 : hiddenOffset}px)`,
  }
  return (
    <div className="panel" style={style}>
      <div className="panel-frame" />
      <button
        type="button"
        className="panel-tab"
        style={{ top: tabTop, height: tabHeight, visibility: tabHidden ? 'hidden' : 'visible' }}
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="panel-tab-shape" style={{ maskImage: `url(${artUrl('tab')})`, WebkitMaskImage: `url(${artUrl('tab')})` }} />
        <span className="panel-tab-text">{title}</span>
      </button>
      <div className="panel-body" inert={!open}>
        {children}
      </div>
    </div>
  )
}

interface RecordsPanelProps {
  tabHidden?: boolean
  open: boolean
  onToggle: () => void
  records: PuzzleRecords
  onReplay: (kind: RecordKind) => void
}

/** Best and worst wins on this puzzle, each with a button to step through that win. */
export function RecordsPanel({ tabHidden, open, onToggle, records, onReplay }: RecordsPanelProps) {
  return (
    <PanelShell
      title="Records"
      tabHidden={tabHidden}
      open={open}
      onToggle={onToggle}
      frameLeft={787}
      hiddenOffset={175}
      tabTop={53}
      tabHeight={105}
    >
      <div className="panel-heading" style={{ left: 0, top: 49, width: 180 }}>
        Replay
      </div>
      {RECORD_LABELS.map(({ kind, label }, i) => {
        const entry = records[kind]
        const y = 120 + i * 37.7
        return (
          <div key={kind}>
            <Pill x={70.5} y={y} w={119} h={28} fontSize={15} disabled={!entry} onClick={() => onReplay(kind)}>
              {label}
            </Pill>
            <div className="record-value" style={{ left: 129, top: y - 22, width: 40, height: 44 }}>
              {entry ? entry.value : '–'}
            </div>
          </div>
        )
      })}
    </PanelShell>
  )
}

interface NotesPanelProps {
  tabHidden?: boolean
  open: boolean
  onToggle: () => void
  tool: NoteTool
  onTool: (tool: NoteTool) => void
  multi: boolean
  onMulti: (multi: boolean) => void
  onClear: () => void
}

const TOOL_SLOTS: readonly { tool: NoteTool; x: number; y: number; label: string }[] = [
  { tool: 'right', x: 43, y: 41, label: 'Right arrow' },
  { tool: 'up', x: 98, y: 41, label: 'Up arrow' },
  { tool: 'left', x: 43, y: 103, label: 'Left arrow' },
  { tool: 'down', x: 98, y: 103, label: 'Down arrow' },
  { tool: 'x', x: 43, y: 163, label: 'Cross' },
  { tool: 'erase', x: 98, y: 163, label: 'Eraser' },
]

const TOOL_ROTATION: Partial<Record<Dir, number>> = { up: -90, left: 180, down: 90 }

/** Pencil marks for working out a route: arrows, a cross, and an eraser. */
export function NotesPanel({ tabHidden, open, onToggle, tool, onTool, multi, onMulti, onClear }: NotesPanelProps) {
  return (
    <PanelShell
      title="Notes"
      tabHidden={tabHidden}
      open={open}
      onToggle={onToggle}
      frameLeft={817}
      hiddenOffset={145}
      tabTop={200}
      tabHeight={103}
    >
      {TOOL_SLOTS.map(({ tool: t, x, y, label }) => (
        <button
          key={t}
          type="button"
          className="note-tool"
          style={{ left: x - 29, top: y - 29 }}
          onClick={() => onTool(t)}
          aria-label={label}
          aria-pressed={tool === t}
        >
          {tool === t && (
            <span className="note-selection" style={{ backgroundImage: `url(${artUrl('selection')})` }} />
          )}
          {t === 'x' ? (
            <img className="note-icon-x" src={artUrl('note-x-icon')} alt="" draggable={false} />
          ) : t === 'erase' ? (
            <span className="note-icon-mask" style={maskOf('note-blank-icon', 38, 38, 0)} />
          ) : (
            <span
              className="note-icon-mask"
              style={maskOf('note-arrow-icon', 45, 38, TOOL_ROTATION[t] ?? 0)}
            />
          )}
        </button>
      ))}
      <Pill x={70} y={245} w={84} h={36} fontSize={17} onClick={onClear}>
        Clear
      </Pill>
      <div className="panel-caption" style={{ left: 0, top: 281, width: 142 }}>
        Multi-note:
      </div>
      <Toggle x={71} y={326} w={90} h={36} value={multi} onChange={onMulti} label="Multi-note" fontSize={16} />
    </PanelShell>
  )
}

/**
 * A blue silhouette of one of the note icons, placed so the middle of its square sits
 * in the middle of the 58 x 58 button. The arrow sprite is a square with an arrow
 * pointing out of its right side, so it rotates about the middle of the square.
 */
function maskOf(name: string, w: number, h: number, rotate: number): CSSProperties {
  const url = `url(${artUrl(name)})`
  const squareCentre = name === 'note-arrow-icon' ? 0.42 * w : w / 2
  return {
    left: 29 - squareCentre,
    top: 29 - h / 2,
    width: w,
    height: h,
    maskImage: url,
    WebkitMaskImage: url,
    transform: `rotate(${rotate}deg)`,
    transformOrigin: `${squareCentre}px 50%`,
  }
}
