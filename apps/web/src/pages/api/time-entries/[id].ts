import { withSession } from "@/lib/auth/with-session"
import { jsonResponse } from "@/utils/json-response"
import {
  handleDeleteEntry,
  handleUpdateEntry,
} from "@/services/time-entries/time-entries.handlers"

export const PATCH = withSession(({ request, params }, session) =>
  params.id
    ? handleUpdateEntry(request, params.id, session.tokens.accessToken)
    : jsonResponse(400, { error: "invalid_body" })
)
export const DELETE = withSession(({ params }, session) =>
  params.id
    ? handleDeleteEntry(params.id, session.tokens.accessToken)
    : jsonResponse(400, { error: "invalid_body" })
)
