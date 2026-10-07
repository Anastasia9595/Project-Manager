// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import node from '@astrojs/node';

try {
  process.loadEnvFile()
} catch {
  // No .env file present (e.g. in production) - environment variables
  // are already set by the operating system/deployment.
}

// https://astro.build/config
export default defineConfig({
  output: "server",
  
  server: {
    host: true,
  },
  security: {
    allowedDomains: [{}],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
  adapter: node({ mode: 'standalone' }),
  
  i18n: {
    defaultLocale: "de",
    locales: ["de", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
})
