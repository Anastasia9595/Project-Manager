import type { APIContext, APIRoute } from "astro"

import {
  getRequestSession,
  type RequestSession,
} from "@/lib/auth/request-session"
import { unauthorizedResponse } from "@/utils/json-response"

/** Umschließt eine API-Route: ohne angemeldeten User kommt 401, sonst erhält der Handler die Session. */
export function withSession(
  handler: (
    context: APIContext,
    session: RequestSession
  ) => Response | Promise<Response>
): APIRoute {
  return (context) => {
    const session = getRequestSession(context.cookies, context.locals)
    if (!session) return unauthorizedResponse()
    return handler(context, session)
  }
}
