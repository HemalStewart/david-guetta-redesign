/**
 * Shared email check used by the form and by the API route, so the client and
 * the server never disagree about what they accept.
 *
 * Deliberately permissive — deciding whether an address really exists is the
 * provider's job, not a regex's.
 */
export function isPlausibleEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  if (/\s/.test(trimmed)) return false;
  return /^[^@]+@[^@.]+(\.[^@.]+)+$/.test(trimmed);
}
