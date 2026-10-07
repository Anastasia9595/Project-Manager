/** ISO-Datum lokalisiert formatieren, z.B. "2026-01-02" -> "2. Jan. 2026". */
export function formatDate(iso: string, locale?: string): string {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
