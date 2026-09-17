import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4000',
    trace: 'on-first-retry',
    viewport: { width: 1440, height: 1100 }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev -- --port 4000',
    url: 'http://127.0.0.1:4000',
    reuseExistingServer: true,
    timeout: 120000
  }
});
