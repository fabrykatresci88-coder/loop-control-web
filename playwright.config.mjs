import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: { baseURL: 'http://127.0.0.1:4334', browserName: 'chromium', headless: true, launchOptions: { executablePath: process.env.LCOS_CHROMIUM_EXECUTABLE || undefined } },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4334', url: 'http://127.0.0.1:4334', reuseExistingServer: !process.env.CI, timeout: 30000 }
});

