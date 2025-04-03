import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      'json-schema-migrate-x': new URL('src/index.ts', import.meta.url)
        .pathname,
    },
  },
  test: {
    coverage: {
      enabled: true,
      include: ['src'],
      reporter: ['lcov', 'json', 'text'],
    },
    environment: 'node',
    globals: true,
  },
})
