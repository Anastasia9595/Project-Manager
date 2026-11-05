import { toErrorResponse } from "@/lib/customer-contact-form/error-response"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

import { updateTaskCompletion } from "./tasks.repository"

function isCompletionBody(body: unknown): body is { completed: boolean } {
  return (
    typeof body === "object" &&
    body !== null &&
    !Array.isArray(body) &&
    typeof (body as { completed?: unknown }).completed === "boolean"
  )
}

/** Logik der Route PATCH /api/tasks/[id]; die Route prüft nur die Anmeldung, die Directus-Rechte entscheiden den Rest. */
export async function handleUpdateTask(
  request: Request,
  id: string,
  accessToken: string,
  update: typeof updateTaskCompletion = updateTaskCompletion
): Promise<Response> {
  const body = await readJsonBody<unknown>(request)
  if (!isCompletionBody(body))
    return jsonResponse(400, { error: "invalid_body" })
  try {
    return jsonResponse(200, await update(accessToken, id, body.completed))
  } catch (error) {
    return toErrorResponse(error, "Directus task update", "invalid_body")
  }
}
