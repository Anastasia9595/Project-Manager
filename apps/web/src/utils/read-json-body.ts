/** Liest den JSON-Body eines Requests; bei ungültigem JSON kommt `null`. */
export async function readJsonBody<T>(request: Request): Promise<T | null> {
  return (await request.json().catch(() => null)) as T | null
}
