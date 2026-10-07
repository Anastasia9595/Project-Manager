import { withSession } from "@/lib/auth/with-session"
import { fetchAvatarAsset } from "@/lib/profile"

/** Liefert das Profilbild aus Directus; `id` ist die File-ID des Avatars. */
export const GET = withSession(async ({ url }, session) => {
  const id = url.searchParams.get("id")
  if (!id) return new Response(null, { status: 404 })

  const asset = await fetchAvatarAsset(session.tokens.accessToken, id)
  if (!asset.ok || !asset.body) {
    return new Response(null, { status: 404 })
  }

  return new Response(asset.body, {
    headers: {
      "Content-Type": asset.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  })
})
