import { describe, expect, it } from 'vitest';
import { addBusinessDays, businessDaysBetween, isBusinessDay } from '../src';

describe('isBusinessDay', () => {
  it('weekdays yes, weekends and festivos no', () => {
    expect(isBusinessDay('2026-11-12')).toBe(true); // Thursday
    expect(isBusinessDay('2026-11-14')).toBe(false); // Saturday
    expect(isBusinessDay('2026-11-15')).toBe(false); // Sunday
    expect(isBusinessDay('2026-11-16')).toBe(false); // Independencia de Cartagena
  });

  it('can count Saturdays', () => {
    expect(isBusinessDay('2026-11-14', { includeSaturday: true })).toBe(true);
    expect(isBusinessDay('2026-11-15', { includeSaturday: true })).toBe(false);
  });
});

describe('addBusinessDays', () => {
  it('skips the puente', () => {
    expect(addBusinessDays('2026-01-09', 1)).toBe('2026-01-13');
  });

  it('skips Semana Santa', () => {
    expect(addBusinessDays('2026-04-01', 1)).toBe('2026-04-06');
  });

  it('goes backwards', () => {
    expect(addBusinessDays('2026-01-13', -1)).toBe('2026-01-09');
  });

  it('zero is a no-op', () => {
    expect(addBusinessDays('2026-11-15', 0)).toBe('2026-11-15');
  });

  it('with Saturdays', () => {
    expect(addBusinessDays('2026-11-13', 1, { includeSaturday: true })).toBe('2026-11-14');
  });

  it('only integers', () => {
    expect(() => addBusinessDays('2026-11-13', 1.5)).toThrow(TypeError);
  });
});

describe('businessDaysBetween', () => {
  it('counts a normal week', () => {
    expect(businessDaysBetween('2026-11-09', '2026-11-13')).toBe(4);
  });

  it('respects festivos', () => {
    // Nov 16 is a festivo, so Fri 13 -> Fri 20 is only 4
    expect(businessDaysBetween('2026-11-13', '2026-11-20')).toBe(4);
  });

  it('is negative when end is before start', () => {
    expect(businessDaysBetween('2026-11-13', '2026-11-09')).toBe(-4);
  });

  it('round-trips with addBusinessDays', () => {
    const end = addBusinessDays('2026-03-15', 30);
    expect(businessDaysBetween('2026-03-15', end)).toBe(30);
  });
});
