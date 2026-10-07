/** Editierbare Profildaten des angemeldeten Users (Directus: directus_users). */
export type ProfileValues = {
  firstName: string
  lastName: string
  email: string
  about: string
  phone: string
  position: string
  address: string
}

export type Profile = ProfileValues & {
  /** Directus-File-ID des Profilbilds, falls vorhanden. */
  avatarId: string | null
}
