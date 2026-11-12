import { describe, expect, it } from 'vitest';
import {
  getEasterSunday,
  getHoliday,
  getHolidays,
  getHolidaysBetween,
  getNextHoliday,
  isHoliday,
} from '../src';

describe('getEasterSunday', () => {
  it.each([
    [2000, '2000-04-23'],
    [2019, '2019-04-21'],
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
  ])('%i -> %s', (year, expected) => {
    expect(getEasterSunday(year)).toBe(expected);
  });
});

describe('getHolidays', () => {
  it('matches the official 2026 calendar', () => {
    expect(getHolidays(2026).map((h) => h.date)).toEqual([
      '2026-01-01',
      '2026-01-12',
      '2026-03-23',
      '2026-04-02',
      '2026-04-03',
      '2026-05-01',
      '2026-05-18',
      '2026-06-08',
      '2026-06-15',
      '2026-06-29',
      '2026-07-20',
      '2026-08-07',
      '2026-08-17',
      '2026-10-12',
      '2026-11-02',
      '2026-11-16',
      '2026-12-08',
      '2026-12-25',
    ]);
  });

  it('matches 2025, where two holidays share June 30', () => {
    const dates = getHolidays(2025).map((h) => h.date);
    expect(dates).toHaveLength(18);
    expect(new Set(dates).size).toBe(17);
    expect(dates.filter((d) => d === '2025-06-30')).toHaveLength(2);
    expect(dates).toContain('2025-03-24');
    expect(dates).toContain('2025-06-02');
    expect(dates).toContain('2025-11-17');
  });

  it('keeps track of where Emiliani moved things from', () => {
    const reyes = getHolidays(2026).find((h) => h.name === 'Día de los Reyes Magos');
    expect(reyes).toEqual({ date: '2026-01-12', name: 'Día de los Reyes Magos', movedFrom: '2026-01-06' });
  });

  it('does not add movedFrom when the holiday is already a Monday', () => {
    const sanPedro = getHolidays(2026).find((h) => h.name === 'San Pedro y San Pablo');
    expect(sanPedro).toEqual({ date: '2026-06-29', name: 'San Pedro y San Pablo' });
  });

  it('every moved holiday ends up on a Monday', () => {
    for (let year = 1984; year <= 2100; year++) {
      for (const h of getHolidays(year)) {
        if (h.movedFrom) expect(new Date(`${h.date}T00:00:00Z`).getUTCDay()).toBe(1);
      }
    }
  });

  it('cache cannot be mutated from outside', () => {
    getHolidays(2026)[0]!.name = 'Hackeado';
    expect(getHolidays(2026)[0]!.name).toBe('Año Nuevo');
  });

  it('rejects years before Ley Emiliani', () => {
    expect(() => getHolidays(1983)).toThrow(RangeError);
    expect(() => getHolidays(2026.5)).toThrow(RangeError);
  });
});

describe('isHoliday / getHoliday', () => {
  it('works with strings', () => {
    expect(isHoliday('2026-07-20')).toBe(true);
    expect(isHoliday('2026-07-21')).toBe(false);
    expect(getHoliday('2026-08-07')?.name).toBe('Batalla de Boyacá');
  });

  it('uses the local calendar day of a Date object', () => {
    expect(isHoliday(new Date(2026, 11, 25, 23, 59))).toBe(true);
  });

  it('complains about garbage input', () => {
    expect(() => isHoliday('25/12/2026')).toThrow(TypeError);
    expect(() => isHoliday('2026-02-30')).toThrow(RangeError);
  });
});

describe('getNextHoliday', () => {
  it('is strictly after the date', () => {
    expect(getNextHoliday('2026-11-12').date).toBe('2026-11-16');
    expect(getNextHoliday('2026-11-16').date).toBe('2026-12-08');
  });

  it('jumps to next year after Christmas', () => {
    expect(getNextHoliday('2026-12-25')).toEqual({ date: '2027-01-01', name: 'Año Nuevo' });
  });
});

describe('getHolidaysBetween', () => {
  it('is inclusive and crosses years', () => {
    expect(getHolidaysBetween('2026-12-08', '2027-01-01').map((h) => h.date)).toEqual([
      '2026-12-08',
      '2026-12-25',
      '2027-01-01',
    ]);
  });

  it('returns nothing for a reversed range', () => {
    expect(getHolidaysBetween('2026-12-31', '2026-01-01')).toEqual([]);
  });
});
