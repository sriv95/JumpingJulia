import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works under https://<user>.github.io/jumping-julia/.
  base: './',
  // Everything (code, styles, sprites, fonts) is inlined into dist/index.html,
  // so the built game is a single file that works from anywhere.
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { assetsInlineLimit: 100_000_000 },
})
