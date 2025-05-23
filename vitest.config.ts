import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      include: ['src'],
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        100: true,
      },
    },
    pool: 'threads',
  },
})
