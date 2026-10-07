const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[\d\s\-/().]+$/
const MIN_PHONE_DIGITS = 6

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

/** Erlaubt deutsche und internationale Schreibweisen, z.B. "0421 5550100" oder "+49 (421) 555-0100". */
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim()
  return (
    PHONE_PATTERN.test(trimmed) &&
    trimmed.replace(/\D/g, "").length >= MIN_PHONE_DIGITS
  )
}
