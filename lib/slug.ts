const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function randomId(length = 10) {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

export function giftPath(slug: string) {
  return `/r/${slug}`;
}

export function giftUrl(slug: string, origin?: string) {
  const base = (origin ?? process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  return `${base}${giftPath(slug)}`;
}
