import { withSession } from "@/lib/auth/with-session"
import { handleBookedTasks } from "@/services/time-entries/time-entries.handlers"

export const GET = withSession((_context, session) =>
  handleBookedTasks(session.tokens.accessToken)
)
