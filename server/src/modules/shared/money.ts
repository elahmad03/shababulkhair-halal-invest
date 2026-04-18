// Strong type alias for clarity
export type Kobo = bigint;

/** Convert Naira → Kobo safely */
export const toKobo = (naira: number): Kobo =>
  BigInt(Math.round(naira * 100));

/** Format Kobo safely (no Number conversion risk) */
export const formatKobo = (kobo: Kobo): string =>
  (kobo / 100n).toString();