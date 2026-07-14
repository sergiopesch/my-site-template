import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.E2E_PORT ?? "3210";
const baseURL = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-no-js",
      use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
    },
  ],
  webServer: {
    command: `npm run start -- -p ${e2ePort}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
