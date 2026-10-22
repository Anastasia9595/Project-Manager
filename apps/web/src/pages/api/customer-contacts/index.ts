import { handleCreateContact } from "@/lib/customer-contact-form/create-contact"
import { withSession } from "@/lib/auth/with-session"

export const POST = withSession(({ request }, session) =>
  handleCreateContact(request, session.tokens.accessToken)
)
