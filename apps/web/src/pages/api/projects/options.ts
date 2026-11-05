import { withSession } from "@/lib/auth/with-session"
import { handleProjectOptions } from "@/services/projects/new-project.handlers"

export const GET = withSession((_context, session) =>
  handleProjectOptions(session)
)
