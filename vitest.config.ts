import { defineConfig } from 'vitest/config'

// eslint-disable-next-line import/no-anonymous-default-export
export default defineConfig({
  test: {
    coverage: {
      include: ['src'],
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        100: true,
      },
    },
  },
})
