import { readMe, updateMe } from "@directus/sdk"

import { createAuthClient } from "@/lib/auth/directus-auth-client"
import {
  PROFILE_DIRECTUS_FIELDS,
  type DirectusProfile,
  fromDirectusProfile,
  toDirectusPayload,
} from "@/lib/profile-fields"
import type { Profile, ProfileValues } from "@/models/profile"

async function createUserClient(accessToken: string) {
  const client = createAuthClient()
  await client.setToken(accessToken)
  return client
}

export async function fetchProfile(accessToken: string): Promise<Profile> {
  const client = await createUserClient(accessToken)
  const me = await client.request(readMe({ fields: PROFILE_DIRECTUS_FIELDS }))
  return fromDirectusProfile(me as unknown as DirectusProfile)
}

export async function updateProfile(
  accessToken: string,
  values: ProfileValues
): Promise<void> {
  const client = await createUserClient(accessToken)
  await client.request(updateMe(toDirectusPayload(values)))
}

/** Prüft das aktuelle Passwort per Login und setzt danach das neue. */
export async function changePassword(
  accessToken: string,
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await createAuthClient().login(
    { email, password: currentPassword },
    { mode: "json" }
  )

  const client = await createUserClient(accessToken)
  await client.request(updateMe({ password: newPassword }))
}

/** Lädt die Profilbild-Datei mit dem Token des Users aus Directus. */
export async function fetchAvatarAsset(
  accessToken: string,
  avatarId: string
): Promise<Response> {
  return fetch(
    `${process.env.DIRECTUS_URL}/assets/${avatarId}?width=400&height=400&fit=cover`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
}
