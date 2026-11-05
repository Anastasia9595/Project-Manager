import { canViewInternalWork } from "@/lib/auth/roles"
import {
  getDirectusStatus,
  toErrorResponse,
} from "@/lib/customer-contact-form/error-response"
import { toDayKey } from "@/lib/week"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

import {
  createProject,
  fetchProjectLookup,
  fetchProjectOptions,
} from "./new-project.repository"
import { validateNewProject } from "./new-project.validation"
import { isNewProjectValues } from "./new-project.values"

type ProjectSession = {
  tokens: { accessToken: string }
  user: { id: string; role: string | null }
}

export type CreateProjectDeps = {
  fetchLookup: typeof fetchProjectLookup
  create: typeof createProject
  /** Lokales Datum als YYYY-MM-DD. */
  today: () => string
}

/** Logik der Route POST /api/projects. */
export async function handleCreateProject(
  request: Request,
  session: ProjectSession,
  deps: Partial<CreateProjectDeps> = {}
): Promise<Response> {
  const {
    fetchLookup = fetchProjectLookup,
    create = createProject,
    today = () => toDayKey(new Date()),
  } = deps
  const token = session.tokens.accessToken

  if (!canViewInternalWork(session.user.role)) {
    return jsonResponse(403, { error: "forbidden" })
  }

  const body = await readJsonBody<unknown>(request)
  if (!isNewProjectValues(body)) {
    return jsonResponse(400, { error: "invalid_body" })
  }

  const day = today()
  const fields = validateNewProject(body, day)
  if (Object.keys(fields).length > 0) {
    return jsonResponse(400, { error: "invalid_fields", fields })
  }

  let lookup
  try {
    lookup = await fetchLookup(token, body)
  } catch (error) {
    const status = getDirectusStatus(error)
    if (status === 403 || status === 404) {
      return jsonResponse(400, { error: "invalid_reference" })
    }
    return toErrorResponse(error, "Directus project lookup", "create_failed")
  }

  if (lookup.variantMediaType !== body.mediaTypeId) {
    return jsonResponse(400, { error: "invalid_variant" })
  }
  if (body.tenantUserId && lookup.contactTenant !== body.tenantId) {
    return jsonResponse(400, { error: "invalid_contact" })
  }

  try {
    const project = await create(token, body, session.user.id, lookup, day)
    return jsonResponse(201, { id: project.id, name: project.name })
  } catch (error) {
    return toErrorResponse(error, "Directus project create", "create_failed")
  }
}

/** Logik der Route GET /api/projects/options. */
export async function handleProjectOptions(
  session: ProjectSession,
  fetchOptions: typeof fetchProjectOptions = fetchProjectOptions
): Promise<Response> {
  if (!canViewInternalWork(session.user.role)) {
    return jsonResponse(403, { error: "forbidden" })
  }
  try {
    return jsonResponse(200, await fetchOptions(session.tokens.accessToken))
  } catch (error) {
    return toErrorResponse(error, "Directus project options", "options_failed")
  }
}
