import { defaultLocale } from "@/i18n/config"

/** Setzt den Sprach-Präfix vor einen Pfad; die Standardsprache bleibt ohne Präfix. */
export function localizedPath(path: string, locale?: string): string {
  const prefix = locale && locale !== defaultLocale ? `/${locale}` : ""
  return `${prefix}${path}`
}
