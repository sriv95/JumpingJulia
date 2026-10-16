import { Pill } from '../components/controls'
import { useLayout } from '../components/LayoutContext'
import { LeftBorder, Logos, TITLE } from './HomeScreen'

const CREDITS = [
  { name: 'Nick Rauh', job: 'Activity Design' },
  { name: 'Stacy Speyer', job: 'Graphic Design' },
  { name: 'Carl Van Huyck', job: 'Programming' },
]

export function CreditsScreen({ onBack }: { onBack: () => void }) {
  const portrait = useLayout().portrait
  return (
    <div className="absolute inset-0">
      <LeftBorder />
      <h1 className={TITLE}>Jumping Julia</h1>
      {CREDITS.map(({ name, job }, i) => (
        <div key={name} className="absolute left-0 h-36 w-960 font-display text-[31px] leading-36 text-purple portrait:w-600" style={{ top: 172 + i * 36 }}>
          <span className="absolute right-465 font-bold whitespace-nowrap portrait:right-285">{name}</span>
          <span className="absolute left-547 font-light whitespace-nowrap portrait:left-367">{job}</span>
        </div>
      ))}
      <p className="absolute top-338 left-298 m-0 w-440 text-center font-display text-[20px] leading-27 font-normal portrait:top-360 portrait:left-118">
        Inspired by rook jumping mazes tracing back
        <br />
        to Sam Loyd&apos;s &ldquo;Back from the Klondike&rdquo;
      </p>
      <a
        className="absolute top-394 left-298 w-440 text-center font-display text-[18px] text-inherit underline portrait:top-426 portrait:left-118"
        href="https://github.com/sriv95/JumpingJulia"
        target="_blank"
        rel="noreferrer"
      >
        <svg className="mr-8 size-20 align-[-4px]" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
          />
        </svg>
        github.com/sriv95/JumpingJulia
      </a>
      <Logos />
      <Pill x={portrait ? 340 : 886} y={portrait ? 880 : 563} w={132} h={53} display fontSize={27} onClick={onBack}>
        Back
      </Pill>
    </div>
  )
}
