/** Speichert den Erledigt-Status einer Aufgabe; wirft bei Fehlern, damit die Oberfläche zurücksetzen kann. */
export async function setTaskCompleted(
  id: string,
  completed: boolean
): Promise<void> {
  const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  })
  if (!response.ok)
    throw new Error(
      `Aufgabe konnte nicht gespeichert werden (${response.status})`
    )
}
