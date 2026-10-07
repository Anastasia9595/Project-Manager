import { createDirectus, rest, staticToken } from "@directus/sdk"

const url = process.env.DIRECTUS_URL
const token = process.env.DIRECTUS_TOKEN

if (!url || !token) {
  throw new Error("Missing Directus environment variables: DIRECTUS_URL, DIRECTUS_TOKEN")
}

export const directus = createDirectus(url).with(staticToken(token)).with(rest())
