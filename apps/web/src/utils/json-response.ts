export function jsonResponse(
  status: number,
  body: Record<string, unknown>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export function unauthorizedResponse(): Response {
  return jsonResponse(401, { error: "unauthorized" })
}
