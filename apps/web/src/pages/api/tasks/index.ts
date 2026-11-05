import { withSession } from "@/lib/auth/with-session"
import { handleCreateTask } from "@/services/tasks/new-task.handlers"

export const POST = withSession(({ request }, session) =>
  handleCreateTask(request, session)
)
