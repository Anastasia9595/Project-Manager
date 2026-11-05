/** Zählt Anfragen je ID, damit nur die neueste ihr Ergebnis (z. B. Rollback) anwenden darf. */
export function createLatestRequestTracker() {
  const counters = new Map<string, number>()
  return {
    begin(id: string): number {
      const ticket = (counters.get(id) ?? 0) + 1
      counters.set(id, ticket)
      return ticket
    },
    isLatest(id: string, ticket: number): boolean {
      return counters.get(id) === ticket
    },
  }
}
