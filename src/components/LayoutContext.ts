import { createContext, useContext } from 'react'

export interface LayoutInfo {
  /** True when the window is taller than wide, so the 600 x 960 stage is in use. */
  readonly portrait: boolean
}

export const LayoutContext = createContext<LayoutInfo>({ portrait: false })

export const useLayout = () => useContext(LayoutContext)
