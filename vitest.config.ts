import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['backend/tests/**/*.test.ts'],
    coverage: {
      exclude: [
        '**/*.config.ts'
      ]
    }
  },
});
