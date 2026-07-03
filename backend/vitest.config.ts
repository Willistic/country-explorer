import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    // mongodb-memory-server may download a binary on first run.
    testTimeout: 30000,
    hookTimeout: 120000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts', 'src/types/**', 'src/config/**']
    }
  }
});
