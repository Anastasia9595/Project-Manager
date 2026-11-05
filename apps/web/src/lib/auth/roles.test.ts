import { describe, expect, it } from "vitest"

import { NAV_ID } from "@/lib/navigation"

import { canViewInternalWork, ROLES, visibleSidebarKeys } from "./roles"

describe("canViewInternalWork", () => {
  it("erlaubt Administrator und Agentur Mitarbeiter", () => {
    expect(canViewInternalWork(ROLES.ADMIN)).toBe(true)
    expect(canViewInternalWork(ROLES.EMPLOYEE)).toBe(true)
  })

  it("verweigert Kunden, fehlende und unbekannte Rollen", () => {
    expect(canViewInternalWork(ROLES.CUSTOMER)).toBe(false)
    expect(canViewInternalWork(null)).toBe(false)
    expect(canViewInternalWork(undefined)).toBe(false)
    expect(canViewInternalWork("Gast")).toBe(false)
  })
})

describe("visibleSidebarKeys", () => {
  it("zeigt Kunden keine Aufgaben", () => {
    const keys = visibleSidebarKeys(ROLES.CUSTOMER)
    expect(keys).not.toContain(NAV_ID.TASKS)
    expect(keys).toContain(NAV_ID.PROJECTS)
  })
})
