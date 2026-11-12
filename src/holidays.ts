import { addDays, nextMonday, toISODate, toUTCDate, type DateInput } from './dates';

/**
 * Festivos de Colombia.
 *
 * The rules come from Ley 51 de 1983 (the famous "Ley Emiliani"):
 *  - 6 holidays never move.
 *  - 7 holidays jump to the next Monday ("puente festivo", the best invention ever).
 *  - Holy Week is fixed relative to Easter, and 3 more holidays are Easter-based
 *    AND get moved to Monday.
 *
 * That's 18 festivos per year... on paper. Sometimes two of them land on the same
 * Monday (2025: San Pedro y San Pablo AND Sagrado Corazón both on June 30, qué robo),
 * so you get 17 days off. We still return both entries, because they ARE two holidays.
 * If your count looks off, check Easter first. It's always Easter.
 */

export interface Holiday {
  /** Calendar date of the holiday, 'YYYY-MM-DD'. */
  date: string;
  /** Spanish name, the way people actually say it. */
  name: string;
  /** Original celebration date when Ley Emiliani moved it to Monday. */
  movedFrom?: string;
}

type Rule =
  | { kind: 'fixed'; month: number; day: number; name: string }
  | { kind: 'emiliani'; month: number; day: number; name: string }
  | { kind: 'easter'; offset: number; name: string; moveToMonday: boolean };

const RULES: readonly Rule[] = [
  { kind: 'fixed', month: 1, day: 1, name: 'Año Nuevo' },
  { kind: 'emiliani', month: 1, day: 6, name: 'Día de los Reyes Magos' },
  { kind: 'emiliani', month: 3, day: 19, name: 'Día de San José' },
  { kind: 'easter', offset: -3, name: 'Jueves Santo', moveToMonday: false },
  { kind: 'easter', offset: -2, name: 'Viernes Santo', moveToMonday: false },
  { kind: 'fixed', month: 5, day: 1, name: 'Día del Trabajo' },
  { kind: 'easter', offset: 39, name: 'Ascensión del Señor', moveToMonday: true },
  { kind: 'easter', offset: 60, name: 'Corpus Christi', moveToMonday: true },
  { kind: 'easter', offset: 68, name: 'Sagrado Corazón de Jesús', moveToMonday: true },
  { kind: 'emiliani', month: 6, day: 29, name: 'San Pedro y San Pablo' },
  { kind: 'fixed', month: 7, day: 20, name: 'Día de la Independencia' },
  { kind: 'fixed', month: 8, day: 7, name: 'Batalla de Boyacá' },
  { kind: 'emiliani', month: 8, day: 15, name: 'Asunción de la Virgen' },
  { kind: 'emiliani', month: 10, day: 12, name: 'Día de la Raza' },
  { kind: 'emiliani', month: 11, day: 1, name: 'Día de Todos los Santos' },
  { kind: 'emiliani', month: 11, day: 11, name: 'Independencia de Cartagena' },
  { kind: 'fixed', month: 12, day: 8, name: 'Día de la Inmaculada Concepción' },
  { kind: 'fixed', month: 12, day: 25, name: 'Navidad' },
];

/**
 * Easter Sunday for a given year (Gregorian calendar).
 *
 * Meeus/Jones/Butcher algorithm. Se ve feo, pero funciona desde 1583 —
 * no lo toqués unless you have a test proving it's wrong.
 */
export function getEasterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toISODate(new Date(Date.UTC(year, month - 1, day)));
}

// Holidays don't change once computed, so we keep them around. Cheap and cheerful.
const cache = new Map<number, readonly Holiday[]>();

/**
 * All the festivos for a year, sorted by date.
 *
 * @example
 * getHolidays(2026)[0] // { date: '2026-01-01', name: 'Año Nuevo' }
 */
export function getHolidays(year: number): Holiday[] {
  if (!Number.isInteger(year) || year < 1984 || year > 9999) {
    // Ley Emiliani started applying in 1984. Before that the rules were different
    // and honestly I'm not going to model 1970s holidays, parce.
    throw new RangeError(`Year must be an integer between 1984 and 9999, got ${year}`);
  }

  const cached = cache.get(year);
  if (cached) return cached.map((h) => ({ ...h }));

  const easter = toUTCDate(getEasterSunday(year));

  const holidays = RULES.map((rule): Holiday => {
    if (rule.kind === 'fixed') {
      return { date: toISODate(new Date(Date.UTC(year, rule.month - 1, rule.day))), name: rule.name };
    }

    const original =
      rule.kind === 'emiliani'
        ? new Date(Date.UTC(year, rule.month - 1, rule.day))
        : addDays(easter, rule.offset);

    const shouldMove = rule.kind === 'emiliani' || rule.moveToMonday;
    if (!shouldMove) return { date: toISODate(original), name: rule.name };

    const actual = nextMonday(original);
    const holiday: Holiday = { date: toISODate(actual), name: rule.name };
    if (actual.getTime() !== original.getTime()) holiday.movedFrom = toISODate(original);
    return holiday;
  }).sort((x, y) => x.date.localeCompare(y.date));

  cache.set(year, holidays);
  return holidays.map((h) => ({ ...h }));
}

/** The holiday on that date, or `undefined` if it's a normal day. */
export function getHoliday(date: DateInput): Holiday | undefined {
  const d = toUTCDate(date);
  const iso = toISODate(d);
  return getHolidays(d.getUTCFullYear()).find((h) => h.date === iso);
}

/** Is it festivo? */
export function isHoliday(date: DateInput): boolean {
  return getHoliday(date) !== undefined;
}

/**
 * The next festivo strictly after the given date (default: today).
 * Basically answers "¿cuándo es el próximo puente?" 🙌
 */
export function getNextHoliday(from: DateInput = new Date()): Holiday {
  const start = toISODate(toUTCDate(from));
  const year = Number(start.slice(0, 4));
  const next = [...getHolidays(year), ...getHolidays(year + 1)].find((h) => h.date > start);
  // There's always one in the next year, so this can't really be undefined.
  return next!;
}

/** Holidays between two dates, both inclusive. */
export function getHolidaysBetween(start: DateInput, end: DateInput): Holiday[] {
  const from = toISODate(toUTCDate(start));
  const to = toISODate(toUTCDate(end));
  if (from > to) return [];

  const result: Holiday[] = [];
  for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)); y++) {
    for (const h of getHolidays(y)) {
      if (h.date >= from && h.date <= to) result.push(h);
    }
  }
  return result;
}
