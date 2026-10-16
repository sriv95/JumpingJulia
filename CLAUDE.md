# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Jumping Julia: Vite + React 19 + TypeScript recreation of the JRMF rook-jumping-maze game (originally Unity). Live at https://sriv95.github.io/JumpingJulia/. Runtime is Bun. No test suite exists.

## Commands

```bash
bun install
bun run dev        # vite dev server (via bunx --bun)
bun run typecheck  # tsc -b
bun run lint       # oxlint (react rules-of-hooks error, only-export-components warn)
bun run build      # typecheck, then vite build to dist/
```

CI (`.github/workflows`) runs `typecheck`, `lint`, `build` on push to `main`, then deploys `dist/` to GitHub Pages. Keep all three green.

## Architecture

- **Single-file build.** `vite-plugin-singlefile` + `assetsInlineLimit` inline JS, CSS, fonts and sprites into `dist/index.html`. `base: './'` so it works under any path. Sprites in `src/art/*.png` load via `import.meta.glob(... ?inline)` in `src/theme.ts`; use `artUrl(name)` (name without extension), never import PNGs directly.
- **Fixed stage.** UI is drawn on a 960x600 stage (`src/layout.ts`, `components/Stage.tsx`) scaled to the window; when the window is taller than wide it switches to a 600x960 portrait stage (no rotation). `useLayout().portrait` (`LayoutContext`) tells components which coordinate table to use; position-dependent CSS gets `.stage.portrait` overrides. Position everything in stage coordinates. `boardLayout(size, portrait)` computes tile geometry.
- **Pure game logic in `src/game/`**, UI-free: `engine.ts` (puzzle types, jump rules, random generation by difficulty), `puzzles.ts` (45 built-ins as row strings; `G` = goal; 1-15 4x4, 16-30 5x5, 31-45 6x6), `play.ts` (immutable `PlayState`: path + heading, undo/restore), `notes.ts`, `records.ts`.
- **`src/progress.ts`** is the persisted state (localStorage): solved set, current puzzle, per-puzzle saved attempts (path, heading, notes), records. Puzzle N+1 unlocks only once 1..N solved (`unlockedUpTo`). Random and Custom puzzles are never locked or saved. Restoring a save validates the path and falls back to a fresh attempt if corrupt.
- **`src/App.tsx`** is the single state owner: screen switching (`home | credits | play | levels | random | custom`), `Session` (new `id` per puzzle, used as React `key` to reset `PlaySession`), progress, and settings (count/tool/multi) that last only until reload. The play session stays mounted but `hidden` while the picker/setup screens are open, so in-progress state survives.
- **Screens** in `src/screens/`; shared widgets in `src/components/` (`Board`, `SidePanels`, `controls`).

## Licence

Sprites and puzzle layouts are CC BY-NC-SA 4.0 from JRMF; keep attribution (CreditsScreen, README). Fonts are `@fontsource` DM Sans / Work Sans / Open Sans substituting the original commercial face.
