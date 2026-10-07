/** Vor- und Nachname zusammensetzen; fehlende Teile werden ausgelassen. */
export function getFullName(
  firstName?: string | null,
  lastName?: string | null
): string {
  return [firstName, lastName].filter(Boolean).join(" ")
}
