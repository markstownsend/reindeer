/**
 * Converts an ISO 3166-1 alpha-2 country code to a flag emoji.
 * e.g., "US" → 🇺🇸, "GB" → 🇬🇧, "DE" → 🇩🇪
 * Returns a fallback dot if no country code is provided.
 */
export function countryToFlag(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "●";
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(
    ...Array.from(code).map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
