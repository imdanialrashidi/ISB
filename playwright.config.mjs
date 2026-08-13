// Low-resource local Playwright lane.
// Policy (see .pi/skills/verification-routing + browser-qa):
// - no CI mode (never sets CI=1), one Chromium project, one worker, zero retries;
// - video, trace, and automatic screenshots disabled;
// - dedicated port 4325 so a foreign app on Astro's default 4321 can never be
//   picked up; reuses an ISBATAB server already running on 4325, otherwise builds
//   and starts `astro preview` (production-accurate static output);
// - the spec's beforeAll probe verifies the server actually serves the ISBATAB
//   site, because Playwright's readiness check only tests HTTP 2xx;
// - deterministic committed specs live in tests/e2e; interactive exploration uses
//   the Playwright MCP server configured in .mcp.json (kept separate by design).
import { defineConfig } from "@playwright/test";

const PORT = 4325;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
    screenshot: "off",
    video: "off",
    trace: "off",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
