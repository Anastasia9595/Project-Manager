import { createAuthClient } from "@/lib/auth/directus-auth-client"

/** Directus-Client, der mit dem Token der angemeldeten Person arbeitet, damit ihre Rollenrechte gelten. */
export async function createUserClient(accessToken: string) {
  const client = createAuthClient()
  await client.setToken(accessToken)
  return client
}
