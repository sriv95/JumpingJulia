import { Pill } from '../components/controls'
import { LeftBorder, Logos } from './HomeScreen'

const CREDITS = [
  { name: 'Nick Rauh', job: 'Activity Design' },
  { name: 'Stacy Speyer', job: 'Graphic Design' },
  { name: 'Carl Van Huyck', job: 'Programming' },
]

export function CreditsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen home">
      <LeftBorder />
      <h1 className="title">Jumping Julia</h1>
      {CREDITS.map(({ name, job }, i) => (
        <div key={name} className="credits-row" style={{ top: 172 + i * 36 }}>
          <span className="credits-name">{name}</span>
          <span className="credits-job">{job}</span>
        </div>
      ))}
      <p className="credits-inspiration">
        Inspired by rook jumping mazes tracing back
        <br />
        to Sam Loyd&apos;s &ldquo;Back from the Klondike&rdquo;
      </p>
      <Logos />
      <Pill x={886} y={563} w={132} h={53} className="home-button" onClick={onBack}>
        Back
      </Pill>
    </div>
  )
}
