import type { Project } from "@/models/project"

// TODO: durch Directus-Daten ersetzen (z.B. per `readItems("projects", ...)`).
// Die Spalten in `projects-table.tsx` erwarten nur die Felder aus dem
// `Project`-Typ - solange die Directus-Response darauf gemappt wird, bleibt
// der Rest der Tabelle unverändert.
export const DUMMY_PROJECTS: Project[] = [
  {
    id: "1",
    name: "WeWo_1925-2225_Landingpage_40-Nachrichten",
    status: "active",
    palDate: new Date(2026, 8, 15),
    dataHandoverDate: new Date(2026, 8, 13),
    customer: "Weser Wohnwelt",
    progress: { done: 6, total: 7 },
    circulation: 40000,

  },
  {
    id: "2",
    name: "WeWo_4326_Zusteller-Langkarte_Moebelhaus",
    status: "active",
    palDate: new Date(2026, 8, 16),
    dataHandoverDate: new Date(2026, 8, 14),
    customer: "Weser Wohnwelt",
    progress: { done: 4, total: 7 },
    circulation: 35000,
  },
  {
    id: "3",
    name: "Wallach_5226_Anzeige_Gutscheine_12-2026",
    status: "active",
    palDate: new Date(2026, 8, 18),
    dataHandoverDate: new Date(2026, 8, 16),
    customer: "Wallach Möbelhaus",
    progress: { done: 2, total: 7 },
    circulation: 30000, 
  },
  {
    id: "4",
    name: "MZG_3826_Aussenbanner_noch_5_Minuten",
    status: "created",
    palDate: new Date(2026, 8, 28),
    dataHandoverDate: new Date(2026, 8, 18),
    customer: "Möbelzentrum Großräsche",
    progress: { done: 0, total: 7 },
    circulation: 25000,
  },
  {
    id: "5",
    name: "WohnSchick_3726_Wandkonzept_Eigenmarke",
    status: "completed",
    palDate: new Date(2026, 9, 2),
    dataHandoverDate: new Date(2026, 8, 28),
    customer: "Wohn Schick",
    progress: { done: 0, total: 7 },
    circulation: 20000,
  },
]
