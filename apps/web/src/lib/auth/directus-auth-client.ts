import { authentication, createDirectus, rest } from "@directus/sdk"

const url = process.env.DIRECTUS_URL


export function createAuthClient() {
  if (!url) {
    throw new Error("Missing Directus environment variable: DIRECTUS_URL")
  }
  return createDirectus(url).with(authentication("json", { autoRefresh: false })).with(rest())
}
