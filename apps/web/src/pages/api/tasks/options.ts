import { withSession } from "@/lib/auth/with-session"
import { handleTaskOptions } from "@/services/tasks/new-task.handlers"

export const GET = withSession((_context, session) =>
  handleTaskOptions(session)
)
