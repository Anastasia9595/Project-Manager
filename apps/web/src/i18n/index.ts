import { defaultLocale, isLocale, type Locale } from "./config"
import de, { type Dictionary } from "./de"
import en from "./en"

export type { Dictionary, Locale }
export { defaultLocale, isLocale, locales } from "./config"

const dictionaries: Record<Locale, Dictionary> = { de, en }

export function getDictionary(locale?: string | null): Dictionary {
  if (locale && isLocale(locale)) {
    return dictionaries[locale]
  }
  return dictionaries[defaultLocale]
}
