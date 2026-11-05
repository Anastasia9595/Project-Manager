import { withSession } from "@/lib/auth/with-session"
import { handleCreateProject } from "@/services/projects/new-project.handlers"

export const POST = withSession(({ request }, session) =>
  handleCreateProject(request, session)
)
