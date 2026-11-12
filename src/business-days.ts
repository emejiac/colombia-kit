import { addDays, toISODate, toUTCDate, type DateInput } from './dates';
import { isHoliday } from './holidays';

export interface BusinessDayOptions {
  /**
   * Count Saturdays as working days. A lot of Colombian companies (and some legal
   * terms) work Monday to Saturday, so it's here. Default: false.
   */
  includeSaturday?: boolean;
}

/** Día hábil = not Sunday, not festivo, and not Saturday unless you say so. */
export function isBusinessDay(date: DateInput, options: BusinessDayOptions = {}): boolean {
  const d = toUTCDate(date);
  const weekday = d.getUTCDay();
  if (weekday === 0) return false;
  if (weekday === 6 && !options.includeSaturday) return false;
  // Pass the ISO string, NOT the Date. A UTC-midnight Date read in Colombia's
  // timezone is the day before, so every festivo shifted one day. Tests passed
  // on CI (UTC) and failed on my laptop in Medellín. Classic.
  return !isHoliday(toISODate(d));
}

/**
 * Moves N business days forward (or backward if N is negative).
 * The start date itself doesn't count, same as when someone tells you
 * "le llega en 3 días hábiles" on a Friday.
 *
 * @example
 * addBusinessDays('2026-01-09', 1) // '2026-01-13' (Monday the 12th is Reyes)
 */
export function addBusinessDays(date: DateInput, amount: number, options: BusinessDayOptions = {}): string {
  if (!Number.isInteger(amount)) {
    throw new TypeError(`amount must be an integer, got ${amount}`);
  }

  let current = toUTCDate(date);
  const step = amount >= 0 ? 1 : -1;
  let remaining = Math.abs(amount);

  while (remaining > 0) {
    current = addDays(current, step);
    if (isBusinessDay(toISODate(current), options)) remaining--;
  }
  return toISODate(current);
}

/**
 * Business days after `start` up to and including `end`.
 * Negative if `end` is before `start`, so you can tell if a deadline already passed.
 */
export function businessDaysBetween(
  start: DateInput,
  end: DateInput,
  options: BusinessDayOptions = {},
): number {
  let from = toUTCDate(start);
  let to = toUTCDate(end);
  let sign = 1;
  if (from > to) {
    [from, to] = [to, from];
    sign = -1;
  }

  let count = 0;
  for (let d = addDays(from, 1); d <= to; d = addDays(d, 1)) {
    if (isBusinessDay(toISODate(d), options)) count++;
  }
  return count * sign;
}
