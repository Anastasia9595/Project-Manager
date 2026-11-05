import { withSession } from "@/lib/auth/with-session"
import {
  handleCreateEntry,
  handleListEntries,
} from "@/services/time-entries/time-entries.handlers"

export const GET = withSession(({ url }, session) =>
  handleListEntries(url, session.tokens.accessToken)
)
export const POST = withSession(({ request }, session) =>
  handleCreateEntry(request, session.tokens.accessToken)
)
