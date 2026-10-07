import type { Profile, ProfileValues } from "@/models/profile"

// Zuordnung der Formularfelder zu den Directus-Feldern von directus_users.
// `phone` ist ein eigenes Feld, alle anderen sind Directus-Standardfelder.
const PROFILE_FIELD_MAP = {
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  about: "description",
  phone: "phone",
  position: "title",
  address: "location",
} as const satisfies Record<keyof ProfileValues, string>

const PROFILE_KEYS = Object.keys(PROFILE_FIELD_MAP) as (keyof ProfileValues)[]

export const PROFILE_DIRECTUS_FIELDS = [
  ...Object.values(PROFILE_FIELD_MAP),
  "avatar",
]

export type DirectusProfile = Record<
  (typeof PROFILE_FIELD_MAP)[keyof typeof PROFILE_FIELD_MAP],
  string | null
> & { avatar: string | null }

export function fromDirectusProfile(me: DirectusProfile): Profile {
  const values = Object.fromEntries(
    PROFILE_KEYS.map((key) => [key, me[PROFILE_FIELD_MAP[key]] ?? ""])
  ) as ProfileValues
  return { ...values, avatarId: me.avatar }
}

export function toDirectusPayload(values: ProfileValues) {
  return Object.fromEntries(
    PROFILE_KEYS.map((key) => [PROFILE_FIELD_MAP[key], values[key]])
  )
}

export function isProfileValues(body: unknown): body is ProfileValues {
  const record = body as Record<string, unknown> | null
  return (
    !!record && PROFILE_KEYS.every((key) => typeof record[key] === "string")
  )
}

/** URL, über die der Browser das Profilbild lädt (siehe /api/profile/avatar). */
export function getProfileAvatarUrl(avatarId: string): string {
  return `/api/profile/avatar?id=${encodeURIComponent(avatarId)}`
}
