/**
 * Tiny date helpers.
 *
 * Ojo pues: everything in this lib works with *calendar dates*, not instants.
 * `new Date('2026-01-01')` is midnight UTC, which in Colombia (UTC-5) is still
 * Dec 31. I lost a whole afternoon to that one, so internally we only do math
 * on UTC dates and talk to the outside world with 'YYYY-MM-DD' strings.
 */

/** A date as the user gives it: a `Date` (read in local time) or a 'YYYY-MM-DD' string. */
export type DateInput = Date | string;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Normalizes any input to a Date at 00:00 UTC of that calendar day. */
export function toUTCDate(input: DateInput): Date {
  if (typeof input === 'string') {
    const match = ISO_DATE.exec(input);
    if (!match) {
      throw new TypeError(`Expected a 'YYYY-MM-DD' string, got '${input}'`);
    }
    const [, y, m, d] = match;
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    // Catches stuff like '2026-02-30', which JS happily rolls into March 🙄
    if (date.getUTCMonth() !== Number(m) - 1) {
      throw new RangeError(`'${input}' is not a real date`);
    }
    return date;
  }

  if (!(input instanceof Date) || Number.isNaN(input.getTime())) {
    throw new TypeError('Expected a valid Date or a YYYY-MM-DD string');
  }

  // For Date objects we trust what the user *sees* (local day), not the UTC instant.
  return new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
}

/** 'YYYY-MM-DD' for a UTC date. */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Next Monday, or the same day if it already is Monday. This is the whole Ley Emiliani in one line. */
export function nextMonday(date: Date): Date {
  const day = date.getUTCDay(); // 0 = Sunday, 1 = Monday
  const offset = (8 - day) % 7;
  return addDays(date, offset);
}
