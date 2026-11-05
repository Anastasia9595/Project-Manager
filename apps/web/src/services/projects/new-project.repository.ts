import { createItem, deleteItem, readItem, readItems } from "@directus/sdk"

import { createUserClient } from "@/services/directus/client"

import {
  nextProjectNumber,
  toPrintingLinePayload,
  toProjectOptions,
  toSubmissionPayload,
} from "./new-project.mapper"
import type {
  ProjectLookup,
  ProjectOptionRows,
  ProjectOptions,
} from "./new-project.types"
import type { NewProjectValues } from "./new-project.values"

export type { ProjectLookup, ProjectOptions }

// Alle Zugriffe laufen mit dem Token der angemeldeten Person (Rolle bestimmt die Rechte).

/** Daten für die Dropdowns des Formulars. */
export async function fetchProjectOptions(
  accessToken: string
): Promise<ProjectOptions> {
  const client = await createUserClient(accessToken)
  const [tenants, tenantUsers, mediaTypes, variants, printingCompanies] =
    await Promise.all([
      client.request(
        readItems("tenants", {
          fields: ["id", "tenant_name"],
          sort: ["tenant_name"],
          limit: -1,
        })
      ) as unknown as Promise<ProjectOptionRows["tenants"]>,
      client.request(
        readItems("tenant_users", {
          fields: ["id", "first_name", "last_name", "tenant"],
          sort: ["last_name", "first_name"],
          limit: -1,
        })
      ) as unknown as Promise<ProjectOptionRows["tenantUsers"]>,
      client.request(
        readItems("media_types", {
          fields: ["id", "name"],
          sort: ["name"],
          limit: -1,
        })
      ) as unknown as Promise<ProjectOptionRows["mediaTypes"]>,
      client.request(
        readItems("media_variants", {
          fields: ["id", "name", "product"],
          sort: ["name"],
          limit: -1,
        })
      ) as unknown as Promise<ProjectOptionRows["variants"]>,
      client.request(
        readItems("printing_companies", {
          fields: ["id", "company_name", "company_suffix"],
          sort: ["company_name"],
          limit: -1,
        })
      ) as unknown as Promise<ProjectOptionRows["printingCompanies"]>,
    ])
  return toProjectOptions({
    tenants,
    tenantUsers,
    mediaTypes,
    variants,
    printingCompanies,
  })
}

/** Schlägt Kunde, Medium, Variante und Kontaktperson nach; Directus-403/404 gehen an den Handler. */
export async function fetchProjectLookup(
  accessToken: string,
  values: NewProjectValues
): Promise<ProjectLookup> {
  const client = await createUserClient(accessToken)
  const [tenant, mediaType, variant, contact] = await Promise.all([
    client.request(
      readItem("tenants", values.tenantId, { fields: ["tenant_name"] })
    ) as unknown as Promise<{ tenant_name: string | null }>,
    client.request(
      readItem("media_types", values.mediaTypeId, { fields: ["category"] })
    ) as unknown as Promise<{ category: string | null }>,
    client.request(
      readItem("media_variants", values.variantId, { fields: ["product"] })
    ) as unknown as Promise<{ product: string | null }>,
    values.tenantUserId
      ? (client.request(
          readItem("tenant_users", Number(values.tenantUserId), {
            fields: ["tenant"],
          })
        ) as unknown as Promise<{ tenant: string | null }>)
      : Promise.resolve(null),
  ])
  return {
    tenantName: tenant.tenant_name ?? "",
    mediaTypeCategory: mediaType.category,
    variantMediaType: variant.product,
    contactTenant: contact?.tenant ?? null,
  }
}

/** Legt Einreichung und Druckstrecke an; schlägt die Strecke fehl, wird die Einreichung wieder gelöscht. */
export async function createProject(
  accessToken: string,
  values: NewProjectValues,
  userId: string,
  lookup: ProjectLookup,
  today: string
): Promise<{ id: string; name: string }> {
  const client = await createUserClient(accessToken)
  const year = Number(values.palDate.slice(0, 4))
  const existing = (await client.request(
    readItems("printing_lines", {
      fields: ["project_number"],
      filter: { project_number: { _starts_with: `P-${year}-` } },
      limit: -1,
    })
  )) as unknown as { project_number: string | null }[]
  // shortcut: Projektnummer ohne Sperre, bei Parallelanlage evtl. doppelt; bei Bedarf Unique-Constraint in Directus
  const projectNumber = nextProjectNumber(
    existing.map((row) => row.project_number),
    year
  )

  const submission = (await client.request(
    createItem(
      "form_submissions",
      toSubmissionPayload({ values, userId, lookup, today }),
      { fields: ["id"] }
    )
  )) as unknown as { id: string }

  try {
    return (await client.request(
      createItem(
        "printing_lines",
        toPrintingLinePayload({
          values,
          userId,
          lookup,
          today,
          submissionId: submission.id,
          projectNumber,
        }),
        { fields: ["id", "name"] }
      )
    )) as unknown as { id: string; name: string }
  } catch (error) {
    try {
      await client.request(deleteItem("form_submissions", submission.id))
    } catch {
      console.error("project cleanup failed")
    }
    throw error
  }
}
