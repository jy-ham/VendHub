import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['backend/tests/**/*.test.ts'],
    setupFiles: ['vitest.setup.ts'],
    isolate: true,
    coverage: {
      exclude: [
        '**/*.config.ts'
      ]
    }
  },
});
