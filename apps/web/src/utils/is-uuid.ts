const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Schützt Pfadparameter, bevor sie ins Directus-SDK gelangen (%2F wird von Astro dekodiert). */
export function isUuid(value: string): boolean {
  return UUID.test(value)
}
