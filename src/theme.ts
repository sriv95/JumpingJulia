/** Colours measured from the original game. */
export const TILE_COLORS: Readonly<Record<number, string>> = {
  1: '#47a454',
  2: '#f5bb23',
  3: '#1eaae1',
  4: '#e23b3b',
  5: '#b736e7',
}

export const GOAL_COLOR = '#f96d3d'
/** The square Julia is standing on. */
export const CURRENT_COLOR = '#065ef9'

/** Which paw print (footprint badge) goes with which square colour. */
export const PAW_FOR_VALUE: Readonly<Record<number, string>> = {
  1: 'paw-green',
  2: 'paw-yellow',
  3: 'paw-blue',
  4: 'paw-red',
  5: 'paw-purple',
}

// Sprites are bundled into the build as data URLs, so the game is one self-contained file.
const sprites = import.meta.glob<string>('./art/*.png', {
  eager: true,
  query: '?inline',
  import: 'default',
})

export const artUrl = (name: string): string => sprites[`./art/${name}.png`] ?? ''
