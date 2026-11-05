import { withSession } from "@/lib/auth/with-session"
import { jsonResponse } from "@/utils/json-response"
import { handleUpdateTask } from "@/services/tasks/tasks.handlers"

export const PATCH = withSession(({ request, params }, session) =>
  params.id
    ? handleUpdateTask(request, params.id, session.tokens.accessToken)
    : jsonResponse(400, { error: "invalid_body" })
)
