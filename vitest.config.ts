import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'istanbul',
      reporter: ['lcov', 'json', 'text'],
    },
    environment: 'node',
    globals: true,
  },
})
