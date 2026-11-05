/** Lädt neu, wirft aber nie: Nach erfolgreichem Schreiben darf ein Ladefehler die Buchung nicht als fehlgeschlagen melden (sonst Doppelbuchung). */
export async function safeReload(
  reload: () => Promise<void>,
  onError: () => void
): Promise<void> {
  try {
    await reload()
  } catch {
    onError()
  }
}
