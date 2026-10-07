const COMPLIMENTARY_EMAILS = new Set(["matheusburille12+cortesia@gmail.com"]);

export function isComplimentaryEmail(email: string | null | undefined) {
  if (!email) return false;
  return COMPLIMENTARY_EMAILS.has(email.trim().toLowerCase());
}
