import { useEffect, useRef, useState } from 'react'
import { Stage } from './components/Stage'
import {
  blankPuzzle,
  builtInPuzzle,
  builtInSize,
  randomPuzzle,
  type Difficulty,
  type Pos,
  type Puzzle,
} from './game/engine'
import type { NoteTool } from './game/notes'
import { recordWin } from './game/records'
import {
  loadProgress,
  saveProgress,
  unlockedUpTo,
  withAttempt,
  withCurrent,
  withWin,
  type SavedAttempt,
} from './progress'
import { CreditsScreen } from './screens/CreditsScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LevelsScreen } from './screens/LevelsScreen'
import { PlaySession, type Source } from './screens/PlaySession'
import { CustomScreen, RandomScreen } from './screens/SetupScreens'

type Screen = 'home' | 'credits' | 'play' | 'levels' | 'random' | 'custom'

/** Screens the puzzle picker can be opened from, and returns to. */
type PickerOrigin = 'play' | 'random' | 'custom'

interface Session {
  /** Changes for every new puzzle, so notes and moves start fresh. */
  readonly id: number
  readonly source: Source
  readonly puzzle: Puzzle
  /** The attempt to pick up from, for a built-in puzzle that was played before. */
  readonly saved?: SavedAttempt
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [origin, setOrigin] = useState<PickerOrigin>('play')
  const [session, setSession] = useState<Session | null>(null)
  const nextSessionId = useRef(1)

  // The size last played; Random and Custom start from it, like the original.
  const [lastSize, setLastSize] = useState(4)
  const [pickerSize, setPickerSize] = useState(4)

  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [dealt, setDealt] = useState<Puzzle>(() => randomPuzzle(4, 'easy'))
  const [custom, setCustom] = useState<Puzzle>(() => blankPuzzle(4))

  // These settings last until the page is reloaded, as in the original.
  const [showCount, setShowCount] = useState(false)
  const [tool, setTool] = useState<NoteTool>('erase')
  const [multi, setMulti] = useState(false)

  // Solved puzzles, attempts, notes and records are kept in the browser between visits.
  const [progress, setProgress] = useState(loadProgress)
  useEffect(() => saveProgress(progress), [progress])
  const unlocked = unlockedUpTo(progress)

  const startSession = (source: Source, puzzle: Puzzle, saved?: SavedAttempt) => {
    setSession({ id: nextSessionId.current++, source, puzzle, saved })
    setLastSize(puzzle.size)
    setOrigin('play')
    setScreen('play')
  }

  // Puzzles open in order: one that comes after an unsolved puzzle stays locked.
  const startBuiltIn = (id: number) => {
    if (id < 1 || id > unlocked) return
    setProgress((p) => withCurrent(p, id))
    startSession({ kind: 'builtin', id }, builtInPuzzle(id), progress.attempts.get(id))
  }

  const openPicker = (from: PickerOrigin) => {
    if (from === 'play' && session?.source.kind === 'builtin') {
      setPickerSize(builtInSize(session.source.id))
    }
    setOrigin(from)
    setScreen('levels')
  }

  const openRandom = () => {
    setDealt(randomPuzzle(lastSize, difficulty))
    setOrigin('random')
    setScreen('random')
  }

  const openCustom = () => {
    setCustom(blankPuzzle(lastSize))
    setOrigin('custom')
    setScreen('custom')
  }

  const stepBuiltIn = (delta: -1 | 1) => {
    if (session?.source.kind !== 'builtin') return
    startBuiltIn(session.source.id + delta)
  }

  const handleWin = (path: readonly Pos[]) => {
    if (session?.source.kind !== 'builtin') return
    const id = session.source.id
    setProgress((p) => withWin(p, id, recordWin(p.records, id, path)))
  }

  const handleSave = (attempt: SavedAttempt) => {
    if (session?.source.kind !== 'builtin') return
    const id = session.source.id
    setProgress((p) => withAttempt(p, id, attempt))
  }

  const recordsHere =
    session?.source.kind === 'builtin' ? (progress.records.get(session.source.id) ?? {}) : {}

  return (
    <Stage>
      {screen === 'home' && <HomeScreen onStart={() => startBuiltIn(Math.min(progress.current, unlocked))} onCredits={() => setScreen('credits')} />}
      {screen === 'credits' && <CreditsScreen onBack={() => setScreen('home')} />}

      {session && (
        <div className="session" hidden={screen !== 'play'}>
          <PlaySession
            key={session.id}
            source={session.source}
            puzzle={session.puzzle}
            saved={session.saved}
            onSave={handleSave}
            nextUnlocked={session.source.kind === 'builtin' && session.source.id < unlocked}
            showCount={showCount}
            tool={tool}
            onTool={setTool}
            multi={multi}
            onMulti={setMulti}
            records={recordsHere}
            onWin={handleWin}
            onGear={() => openPicker('play')}
            onStep={stepBuiltIn}
            onNewRandom={() => startSession({ kind: 'random' }, randomPuzzle(session.puzzle.size, difficulty))}
            onEditCustom={() => {
              setOrigin('custom')
              setScreen('custom')
            }}
          />
        </div>
      )}

      {screen === 'levels' && (
        <LevelsScreen
          size={pickerSize}
          onSize={setPickerSize}
          onPick={startBuiltIn}
          unlocked={unlocked}
          onCustom={openCustom}
          onRandom={openRandom}
          showCount={showCount}
          onCount={setShowCount}
          onBack={() => setScreen(origin)}
        />
      )}

      {screen === 'random' && (
        <RandomScreen
          puzzle={dealt}
          difficulty={difficulty}
          onDifficulty={(d) => {
            setDifficulty(d)
            setDealt(randomPuzzle(dealt.size, d))
          }}
          onSize={(size) => {
            setLastSize(size)
            setDealt(randomPuzzle(size, difficulty))
          }}
          onDeal={() => setDealt(randomPuzzle(dealt.size, difficulty))}
          onPlay={() => startSession({ kind: 'random' }, dealt)}
          onGear={() => openPicker('random')}
        />
      )}

      {screen === 'custom' && (
        <CustomScreen
          puzzle={custom}
          onPuzzle={setCustom}
          onSize={(size) => {
            setLastSize(size)
            setCustom(blankPuzzle(size))
          }}
          onReset={() => setCustom(blankPuzzle(custom.size))}
          onPlay={() => startSession({ kind: 'custom' }, custom)}
          onGear={() => openPicker('custom')}
        />
      )}
    </Stage>
  )
}
