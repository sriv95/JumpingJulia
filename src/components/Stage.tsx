import { useEffect, useState, type ReactNode } from 'react'
import { STAGE_H, STAGE_W } from '../layout'

interface Fit {
  scale: number
  /** On a phone held upright the stage turns on its side so it can fill the screen. */
  turned: boolean
}

function fit(): Fit {
  const w = window.innerWidth
  const h = window.innerHeight
  const turned = h > w && w < 820
  const availW = turned ? h : w
  const availH = turned ? w : h
  return { scale: Math.min(availW / STAGE_W, availH / STAGE_H), turned }
}

/** A fixed-size drawing area that scales to fill the window, like the original's canvas. */
export function Stage({ children }: { children: ReactNode }) {
  const [{ scale, turned }, setFit] = useState(fit)

  useEffect(() => {
    const onResize = () => setFit(fit())
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  const frameW = (turned ? STAGE_H : STAGE_W) * scale
  const frameH = (turned ? STAGE_W : STAGE_H) * scale
  const transform = turned
    ? `translate(${STAGE_H * scale}px, 0) rotate(90deg) scale(${scale})`
    : `scale(${scale})`

  return (
    <div className="viewport">
      <div className="stage-frame" style={{ width: frameW, height: frameH }}>
        <div className="stage" style={{ transform }}>
          {children}
        </div>
      </div>
    </div>
  )
}
