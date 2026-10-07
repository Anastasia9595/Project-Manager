export type WorkDay = {
  /** Kurzform für die x-Achse, z.B. "MON" */
  label: string
  /** Langform für Tooltip und Screenreader, z.B. "Montag" */
  name: string
  targetHours: number
  actualHours: number
}
