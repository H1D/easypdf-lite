import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.PORT) || 3000;

export default defineConfig({
  testDir: './e2e',
  timeout: 15000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
  },
  webServer: {
    command: `PORT=${PORT} bun run start`,
    port: PORT,
    reuseExistingServer: true,
  },
});
