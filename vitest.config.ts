import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.{ts,js}'],
    globals: true,
    environment: 'node',
    // The characterization suite runs against a single real MySQL database seeded from db.sql.
    // Tests must not run concurrently or they would race on the shared schema/rows.
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
    hookTimeout: 60000,
    testTimeout: 60000,
    setupFiles: ['test/setup.ts'],
  },
});
