import { describe, expect, it } from 'vitest';
import {
  calculateNitDV,
  formatCedula,
  formatCOP,
  formatNit,
  formatPhone,
  isValidCedula,
  isValidLandline,
  isValidMobile,
  isValidNit,
  normalizePhone,
  parseCOP,
} from '../src';

describe('NIT', () => {
  it.each([
    ['890903938', 8], // Bancolombia
    ['860034313', 7], // Davivienda
  ])('DV of %s is %i', (nit, dv) => {
    expect(calculateNitDV(nit)).toBe(dv);
  });

  it('validates the ways people actually write it', () => {
    expect(isValidNit('890903938-8')).toBe(true);
    expect(isValidNit('890.903.938-8')).toBe(true);
    expect(isValidNit('8909039388')).toBe(true);
    expect(isValidNit('890903938-1')).toBe(false);
    expect(isValidNit('89090393a-8')).toBe(false);
    expect(isValidNit('123')).toBe(false);
  });

  it('formats', () => {
    expect(formatNit('890903938')).toBe('890.903.938-8');
    expect(formatNit('8909039388', { hasDV: true })).toBe('890.903.938-8');
  });
});

describe('COP', () => {
  it('formats', () => {
    expect(formatCOP(1250000)).toBe('$1.250.000');
    expect(formatCOP(0)).toBe('$0');
    expect(formatCOP(-35000)).toBe('-$35.000');
    expect(formatCOP(1500.5, { decimals: 2 })).toBe('$1.500,50');
    expect(formatCOP(999.6)).toBe('$1.000');
    expect(formatCOP(50000, { withCode: true })).toBe('$50.000 COP');
    expect(formatCOP(-0.2)).toBe('$0');
  });

  it('parses', () => {
    expect(parseCOP('$1.250.000')).toBe(1250000);
    expect(parseCOP(' $ 35.000 COP ')).toBe(35000);
    expect(parseCOP('1.500,50')).toBe(1500.5);
    expect(parseCOP('-$35.000')).toBe(-35000);
    expect(parseCOP('mucha plata')).toBeNaN();
  });

  it('round-trips', () => {
    for (const n of [0, 7, 1000, 1234567, 98765432]) expect(parseCOP(formatCOP(n))).toBe(n);
  });
});

describe('cédula', () => {
  it('formats and validates', () => {
    expect(formatCedula('1036654321')).toBe('1.036.654.321');
    expect(formatCedula(71234567)).toBe('71.234.567');
    expect(isValidCedula('1.036.654.321')).toBe(true);
    expect(isValidCedula('12345')).toBe(false);
    expect(isValidCedula('0123456')).toBe(false);
  });
});

describe('phones', () => {
  it('normalizes', () => {
    expect(normalizePhone('+57 (300) 123-4567')).toBe('3001234567');
    expect(normalizePhone('573001234567')).toBe('3001234567');
  });

  it('validates', () => {
    expect(isValidMobile('300 123 4567')).toBe(true);
    expect(isValidMobile('6041234567')).toBe(false);
    expect(isValidLandline('604 123 4567')).toBe(true);
    expect(isValidLandline('2345678')).toBe(false);
  });

  it('formats', () => {
    expect(formatPhone('3001234567')).toBe('+57 300 123 4567');
    expect(formatPhone('6041234567', { international: false })).toBe('604 123 4567');
    expect(formatPhone('123')).toBe('123');
  });
});
