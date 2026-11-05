import { canViewInternalWork } from "@/lib/auth/roles"
import {
  getDirectusStatus,
  toErrorResponse,
} from "@/lib/customer-contact-form/error-response"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

import {
  createTask,
  fetchTaskOptions,
  fetchTaskProject,
} from "./new-task.repository"
import { validateNewTask } from "./new-task.validation"
import { isNewTaskValues } from "./new-task.values"

type TaskSession = {
  tokens: { accessToken: string }
  user: { id: string; role: string | null }
}

export type CreateTaskDeps = {
  fetchProject: typeof fetchTaskProject
  create: typeof createTask
}

/** Logik der Route POST /api/tasks. */
export async function handleCreateTask(
  request: Request,
  session: TaskSession,
  deps: Partial<CreateTaskDeps> = {}
): Promise<Response> {
  const { fetchProject = fetchTaskProject, create = createTask } = deps
  const token = session.tokens.accessToken

  if (!canViewInternalWork(session.user.role)) {
    return jsonResponse(403, { error: "forbidden" })
  }

  const body = await readJsonBody<unknown>(request)
  if (!isNewTaskValues(body)) {
    return jsonResponse(400, { error: "invalid_body" })
  }

  const fields = validateNewTask(body)
  if (Object.keys(fields).length > 0) {
    return jsonResponse(400, { error: "invalid_fields", fields })
  }

  let project
  try {
    project = await fetchProject(token, body.projectId)
  } catch (error) {
    const status = getDirectusStatus(error)
    if (status === 403 || status === 404) {
      return jsonResponse(400, { error: "invalid_project" })
    }
    return toErrorResponse(
      error,
      "Directus task project lookup",
      "create_failed"
    )
  }

  if (project.status !== "created" && project.status !== "in progress") {
    return jsonResponse(400, { error: "invalid_project" })
  }

  try {
    const task = await create(token, body, session.user.id)
    return jsonResponse(201, { id: task.id, name: task.name })
  } catch (error) {
    return toErrorResponse(error, "Directus task create", "create_failed")
  }
}

/** Logik der Route GET /api/tasks/options. */
export async function handleTaskOptions(
  session: TaskSession,
  fetchOptions: typeof fetchTaskOptions = fetchTaskOptions
): Promise<Response> {
  if (!canViewInternalWork(session.user.role)) {
    return jsonResponse(403, { error: "forbidden" })
  }
  try {
    return jsonResponse(200, await fetchOptions(session.tokens.accessToken))
  } catch (error) {
    return toErrorResponse(error, "Directus task options", "options_failed")
  }
}
