import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { stageSize } from '../layout'
import { LayoutContext } from './LayoutContext'

interface Fit {
  scale: number
  /** A window taller than wide gets the upright 600 x 960 stage. */
  portrait: boolean
}

function fit(): Fit {
  const w = window.innerWidth
  const h = window.innerHeight
  const portrait = h > w
  const stage = stageSize(portrait)
  return { scale: Math.min(w / stage.w, h / stage.h), portrait }
}

/** A fixed-size drawing area that scales to fill the window, like the original's canvas. */
export function Stage({ children }: { children: ReactNode }) {
  const [{ scale, portrait }, setFit] = useState(fit)

  useEffect(() => {
    const onResize = () => setFit(fit())
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  const layout = useMemo(() => ({ portrait }), [portrait])
  const { w, h } = stageSize(portrait)

  return (
    <LayoutContext value={layout}>
      <div className="viewport">
        <div className="stage-frame" style={{ width: w * scale, height: h * scale }}>
          <div
            className={`stage ${portrait ? 'portrait' : ''}`}
            style={{ width: w, height: h, transform: `scale(${scale})` }}
          >
            {children}
          </div>
        </div>
      </div>
    </LayoutContext>
  )
}
