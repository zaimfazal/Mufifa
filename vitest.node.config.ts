import { defineConfig } from 'vitest/config'
import path from 'path'

// Minimal node-environment config (no react plugin / jsdom) for pure-logic
// tests. Avoids the @vitejs/plugin-react@6 + vite@7 'vite/internal' mismatch.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
