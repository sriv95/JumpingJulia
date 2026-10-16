import type { CSSProperties, ReactNode } from 'react'
import { artUrl } from '../theme'
import type { Dir } from '../game/engine'
import type { NoteTool } from '../game/notes'
import { RECORD_LABELS, type PuzzleRecords, type RecordKind } from '../game/records'
import { Pill, Toggle } from './controls'
import { useLayout } from './LayoutContext'

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
  /** Upright stage: where the tab sits along the top edge of the sheet, in stage x. */
  sheetTabLeft: number
  children: ReactNode
}

const FRAME_TOP = 78
const FRAME_HEIGHT = 356

/** Upright stage: the panel is a sheet along the bottom edge that slides up. */
const SHEET_HEIGHT = 147
const SHEET_TAB_THICKNESS = 33
const SHEET_BLEED = 40

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
  sheetTabLeft,
  children,
}: PanelShellProps) {
  const { portrait } = useLayout()
  const style: CSSProperties = portrait
    ? {
        left: -SHEET_BLEED,
        top: 960 - SHEET_HEIGHT,
        width: 600 + 2 * SHEET_BLEED,
        height: SHEET_HEIGHT,
        transform: `translateY(${open ? 0 : SHEET_HEIGHT}px)`,
      }
    : {
        left: frameLeft,
        top: FRAME_TOP,
        width: 960 - frameLeft + 40,
        height: FRAME_HEIGHT,
        transform: `translateX(${open ? 0 : hiddenOffset}px)`,
      }
  const maskUrl = `url(${artUrl('tab')})`
  const tabStyle: CSSProperties = portrait
    ? {
        left: SHEET_BLEED + sheetTabLeft,
        top: -(SHEET_TAB_THICKNESS - 1),
        width: tabHeight,
        height: SHEET_TAB_THICKNESS,
      }
    : { top: tabTop, height: tabHeight }
  // The tab art is a left-hand tab; upright, it is turned a quarter so it rises from the sheet's top edge.
  const shapeStyle: CSSProperties = portrait
    ? {
        inset: 'auto',
        left: (tabHeight - SHEET_TAB_THICKNESS) / 2,
        top: (SHEET_TAB_THICKNESS - tabHeight) / 2,
        width: SHEET_TAB_THICKNESS,
        height: tabHeight,
        transform: 'rotate(90deg)',
        maskImage: maskUrl,
        WebkitMaskImage: maskUrl,
      }
    : { maskImage: maskUrl, WebkitMaskImage: maskUrl }
  return (
    <div className="panel" style={style}>
      <div className="panel-frame" />
      <button
        type="button"
        className="panel-tab"
        style={{ ...tabStyle, visibility: tabHidden ? 'hidden' : 'visible' }}
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="panel-tab-shape" style={shapeStyle} />
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
  const { portrait } = useLayout()
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
      sheetTabLeft={60}
    >
      <div className="panel-heading" style={portrait ? { left: 0, top: 6, width: 600 } : { left: 0, top: 49, width: 180 }}>
        Replay
      </div>
      {RECORD_LABELS.map(({ kind, label }, i) => {
        const entry = records[kind]
        // Down the panel when wide, in columns across the sheet when upright.
        const x = portrait ? 75 + i * 150 : 70.5
        const y = portrait ? 70 : 120 + i * 37.7
        const valueStyle = portrait
          ? { left: x - 20, top: y + 16, width: 40, height: 44 }
          : { left: 129, top: y - 22, width: 40, height: 44 }
        return (
          <div key={kind}>
            <Pill x={x} y={y} w={119} h={28} fontSize={15} disabled={!entry} onClick={() => onReplay(kind)}>
              {label}
            </Pill>
            <div className="record-value" style={valueStyle}>
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
  const { portrait } = useLayout()
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
      sheetTabLeft={230}
    >
      {TOOL_SLOTS.map(({ tool: t, x, y, label }, i) => (
        <button
          key={t}
          type="button"
          className="note-tool"
          style={portrait ? { left: 70 + i * 92 - 29, top: 40 - 29 } : { left: x - 29, top: y - 29 }}
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
      <Pill x={portrait ? 100 : 70} y={portrait ? 108 : 245} w={84} h={36} fontSize={17} onClick={onClear}>
        Clear
      </Pill>
      <div className="panel-caption" style={portrait ? { left: 190, top: 98, width: 140 } : { left: 0, top: 281, width: 142 }}>
        Multi-note:
      </div>
      <Toggle
        x={portrait ? 420 : 71}
        y={portrait ? 108 : 326}
        w={90}
        h={36}
        value={multi}
        onChange={onMulti}
        label="Multi-note"
        fontSize={16}
      />
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
