/** Erzeugt einen Fehler, den das Directus SDK als Directus-Fehler mit HTTP-Status erkennt (nur für Tests). */
export function createDirectusError(status: number): Error {
  return Object.assign(new Error("directus"), {
    errors: [{ message: "x", extensions: { code: "X" } }],
    response: { status },
  })
}
