import type { IconSvgElement } from "@hugeicons/react"
import {
  Building06Icon,
  Calendar01FreeIcons,
  ClipboardList,
  Clock02FreeIcons,
  DashboardSquare01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import FolderClosedIcon from "@hugeicons/core-free-icons/FolderClosedIcon"

import type { Dictionary } from "@/i18n"

type SidebarKey = keyof Dictionary["sidebar"]

/** Menü-Gruppen der Sidebar; die Werte sind zugleich die Titel-Schlüssel in `dict.sidebar`. */
export const NAV_GROUP = {
  OVERVIEW: "overview",
  PLANNING: "planning",
} as const satisfies Record<string, SidebarKey>

export type NavGroupId = (typeof NAV_GROUP)[keyof typeof NAV_GROUP]

/** Ids der Menüpunkte; die Werte sind zugleich die Titel-Schlüssel in `dict.sidebar`. */
export const NAV_ID = {
  DASHBOARD: "dashboard",
  PROJECTS: "projects",
  TASKS: "tasks",
  COMPANY_PROFILE: "companyProfile",
  TIME_TRACKING: "timeTracking",
  CALENDAR: "calendar",
  SETTINGS: "settings",
} as const satisfies Record<string, SidebarKey>

export type NavItemId = (typeof NAV_ID)[keyof typeof NAV_ID]

type NavEntry = {
  id: NavItemId
  group: NavGroupId
  url: string
  icon: IconSvgElement
}

/**
 * Einzige Quelle für alle Menüpunkte. Sidebar und Rollen-Rechte (`roles.ts`)
 * leiten sich daraus ab – neue Seiten werden nur hier ergänzt.
 */
export const NAV_ITEMS: readonly NavEntry[] = [
  { id: NAV_ID.DASHBOARD, group: NAV_GROUP.OVERVIEW, url: "/", icon: DashboardSquare01Icon as IconSvgElement },
  { id: NAV_ID.PROJECTS, group: NAV_GROUP.OVERVIEW, url: "/projects", icon: FolderClosedIcon as IconSvgElement },
  { id: NAV_ID.TASKS, group: NAV_GROUP.OVERVIEW, url: "/tasks", icon: ClipboardList as IconSvgElement },
  { id: NAV_ID.COMPANY_PROFILE, group: NAV_GROUP.OVERVIEW, url: "/company-profile", icon: Building06Icon as IconSvgElement },
  { id: NAV_ID.TIME_TRACKING, group: NAV_GROUP.PLANNING, url: "/time-tracking", icon: Clock02FreeIcons as IconSvgElement },
  { id: NAV_ID.CALENDAR, group: NAV_GROUP.PLANNING, url: "/calendar", icon: Calendar01FreeIcons as IconSvgElement },
  { id: NAV_ID.SETTINGS, group: NAV_GROUP.PLANNING, url: "/settings", icon: Settings01Icon as IconSvgElement },
]

export const ALL_NAV_IDS: NavItemId[] = NAV_ITEMS.map((item) => item.id)
