import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/auth/user-client", () => ({ createUserClient: vi.fn() }))

const { toCustomerContact } = await import(
  "@/lib/customer-contacts-repository"
)

const location = {
  id: "l1",
  name: "Hauptsitz",
  is_primary: true,
  street: "Hauptstraße 1",
  postal_code: 34117,
  city: "Kassel",
  phone: "0561 1",
  email: "kassel@x.de",
  website: "https://x.de",
}

describe("toCustomerContact", () => {
  it("nimmt Adresse und Website vom Hauptstandort und die erste Person als Ansprechpartner", () => {
    const result = toCustomerContact(
      {
        id: "t1",
        tenant_name: "X GmbH",
        main_email: "info@x.de",
        main_phone: "0561 0",
        notes: null,
        date_created: "2026-10-01T10:00:00.000Z",
        distributor: { name: "VME" },
        locations: [
          { ...location, id: "l0", is_primary: false, city: "Bonn" },
          location,
        ],
        tenant_users: [
          {
            id: "u1",
            first_name: "Anna",
            last_name: "Muster",
            positions: "management",
            email: null,
            phone: null,
          },
        ],
      },
      { management: "Geschäftsleitung" }
    )

    expect(result).toMatchObject({
      customer: "X GmbH",
      contactPerson: "Anna Muster",
      website: "https://x.de",
      address: "Hauptstraße 1, 34117 Kassel",
      association: "VME",
      createdAt: "2026-10-01",
    })
    expect(result.contacts?.[0]).toMatchObject({
      position: "Geschäftsleitung",
      email: "",
    })
    expect(result.branches).toHaveLength(2)
  })

  it("wählt die Geschäftsleitung als Ansprechpartner und sortiert die Personen danach", () => {
    const user = (id: string, last: string, positions: string) => ({
      id,
      first_name: "A",
      last_name: last,
      positions,
      email: null,
      phone: null,
    })
    const row = {
      id: "t3",
      tenant_name: "Y GmbH",
      main_email: null,
      main_phone: null,
      notes: null,
      date_created: null,
      distributor: null,
      locations: null,
    }

    const withBoss = toCustomerContact({
      ...row,
      tenant_users: [
        user("1", "Buch", "buchhaltung"),
        user("2", "Assi", "assistenz_von_fr_seifert"),
        user("3", "Chef", "management"),
        user("4", "Werbung", "werbeabteilung"),
      ],
    })
    expect(withBoss.contactPerson).toBe("A Chef")
    expect(withBoss.contacts?.map((c) => c.name)).toEqual([
      "A Chef",
      "A Werbung",
      "A Assi",
      "A Buch",
    ])

    const withoutBoss = toCustomerContact({
      ...row,
      tenant_users: [user("1", "Buch", "buchhaltung"), user("2", "Assi", "assistenz_von_fr_seifert")],
    })
    expect(withoutBoss.contactPerson).toBe("A Assi")
  })

  it("liefert leere Texte statt null, wenn Daten fehlen", () => {
    const result = toCustomerContact({
      id: "t2",
      tenant_name: null,
      main_email: null,
      main_phone: null,
      notes: null,
      date_created: null,
      distributor: null,
      locations: null,
      tenant_users: null,
    })

    expect(result).toMatchObject({
      customer: "",
      contactPerson: "",
      website: "",
      address: "",
      association: "",
    })
  })
})
