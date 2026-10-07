import { ALL_NAV_IDS, NAV_ID, type NavItemId } from "@/lib/navigation"

export const ROLES = {
  ADMIN: "Administrator",
  EMPLOYEE: "Agentur Mitarbeiter",
  CUSTOMER: "Kunden",
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

export type SidebarKey = NavItemId

const SIDEBAR_VISIBILITY: Record<RoleName, SidebarKey[]> = {
  [ROLES.ADMIN]: ALL_NAV_IDS,
  [ROLES.EMPLOYEE]: ALL_NAV_IDS,
  [ROLES.CUSTOMER]: [
    NAV_ID.DASHBOARD,
    NAV_ID.PROJECTS,
    NAV_ID.TASKS,
    NAV_ID.COMPANY_PROFILE,
  ],
}

// Fail-closed: unbekannte oder fehlende Rolle sieht nur das Dashboard.
export function visibleSidebarKeys(role: string | null | undefined): SidebarKey[] {
  if (role && role in SIDEBAR_VISIBILITY) {
    return SIDEBAR_VISIBILITY[role as RoleName]
  }
  return [NAV_ID.DASHBOARD]
}
