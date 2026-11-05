import { useOptions, type OptionsState } from "@/hooks/use-options"
import type { ContactOptions } from "@/lib/customer-contact-form/repository"

export type ContactOptionsState = OptionsState<ContactOptions>

/** Lädt Kunden und Standorte für das Kontaktformular; `retry` startet den Abruf nach einem Fehler neu. */
export function useContactOptions() {
  return useOptions<ContactOptions>("/api/customer-contacts/options")
}
