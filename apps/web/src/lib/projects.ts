import type { Project } from "@/models/project"

/** Lesbarer Klarname eines Projekts; ohne `title` der interne Name. */
export function getProjectTitle(project: Pick<Project, "name" | "title">): string {
  return project.title ?? project.name
}

/** Eintrag in Auswahllisten, z.B. "Jahresbericht 2026 – JB-2026-001". */
export function formatProjectOption(project: Pick<Project, "name" | "title">): string {
  const title = getProjectTitle(project)
  return title === project.name ? title : `${title} – ${project.name}`
}
