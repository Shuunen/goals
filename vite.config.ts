import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { cspNonce } from './src/plugins/csp-nonce.ts'
import { uniqueMark } from './src/plugins/unique-mark.ts'

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  build: {
    reportCompressedSize: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'react-dom', test: /react-dom/ }],
        },
      },
    },
  },
  plugins: [react(), tailwindcss(), uniqueMark(), cspNonce()],
  test: {
    coverage: {
      provider: 'v8' as const,
      thresholds: {
        100: true,
      },
    },
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    reporters: ['dot'],
    setupFiles: ['./vitest.setup.ts'],
    silent: true,
  },
})
