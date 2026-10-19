import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

import { APP_TIME_ZONE } from "./src/lib/time-zone"

// Feste Zeitzone, damit Datums-Tests (z.B. Zeitumstellung) überall gleich laufen.
process.env.TZ = APP_TIME_ZONE

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
})
