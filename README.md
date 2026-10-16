# Jumping Julia

A Vite + React + TypeScript recreation of **Jumping Julia**, the rook-jumping-maze game from the
[Julia Robinson Mathematics Festival](https://jrmf.org/) (originally built in Unity).

Julia starts at A1. Each square holds a number; from a square she must jump **exactly that many squares**
up, down, left or right, staying on the board. Reach the orange star to win. Revisiting squares is allowed.

## Play at
`https://sriv95.github.io/JumpingJulia/`

## Features

- 45 built-in puzzles (15 each at 4x4, 5x5 and 6x6) that unlock one at a time: puzzle N+1 opens once N is solved. Puzzle picker and previous/next arrows only reach unlocked puzzles
- Undo, Restart, "stuck" and "You win!" messages
- Random puzzles (2x2 to 6x6, Easy / Medium / Hard) and a Custom puzzle editor
- Count (paw-print visit numbers), Notes (arrows, crosses, eraser, multi-note), Records and step-by-step Replay
- Fixed 960x600 stage that scales to any window

Progress is saved in the browser (localStorage): solved puzzles, the puzzle you were on, each unfinished attempt with its notes, and records. Switching puzzles or reloading the page keeps them. Random and Custom puzzles are never locked or saved.

## Develop

```bash
bun install
bun run dev      # start the dev server
bun run build    # type-check and build to dist/
bun run lint
```

## Credits and licence

Activity design: Nick Rauh. Graphic design: Stacy Speyer. Programming: Carl Van Huyck.
Inspired by rook jumping mazes tracing back to Sam Loyd's "Back from the Klondike".

Original game and artwork © Julia Robinson Mathematics Festival, licensed
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). This recreation reuses the original
sprites and puzzle layouts and is therefore distributed under the same licence: attribution required,
non-commercial use only, share alike.

The original uses a commercial typeface (ES Rebond Grotesque); this version substitutes DM Sans, Work Sans
and Open Sans (SIL Open Font Licence) via `@fontsource`.
