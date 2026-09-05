import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  plugins: [
    preact(),
    mode === 'analyze' ? visualizer({ open: true, gzipSize: true }) : undefined,
  ].filter(Boolean),
}))
