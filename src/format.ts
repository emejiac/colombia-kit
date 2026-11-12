import { groupThousands } from './nit';

/**
 * Formatting for Colombian stuff.
 *
 * Why not just Intl.NumberFormat('es-CO')? It works, but the output changes between
 * Node versions / browsers (some put a non-breaking space after the $, some don't),
 * and that breaks snapshot tests and PDFs. Aquí uno sabe exactamente qué sale.
 */

export interface CopOptions {
  /** Decimal places. Default 0, because nobody pays $1.500,50 in Colombia. */
  decimals?: number;
  /** Show the 'COP' suffix: '$1.250.000 COP'. Handy for international invoices. */
  withCode?: boolean;
}

/**
 * @example
 * formatCOP(1250000)              // '$1.250.000'
 * formatCOP(-35000)               // '-$35.000'
 * formatCOP(1500.5, { decimals: 2 }) // '$1.500,50'
 */
export function formatCOP(amount: number, options: CopOptions = {}): string {
  if (!Number.isFinite(amount)) {
    throw new TypeError(`amount must be a finite number, got ${amount}`);
  }
  const decimals = options.decimals ?? 0;
  const [intPart, decPart] = Math.abs(amount).toFixed(decimals).split('.');

  let result = `$${groupThousands(intPart!)}`;
  if (decPart) result += `,${decPart}`;
  if (amount < 0 && Number(Math.abs(amount).toFixed(decimals)) !== 0) result = `-${result}`;
  if (options.withCode) result += ' COP';
  return result;
}

/**
 * The other way around: '$1.250.000' -> 1250000. Also eats '1.250.000,50' and ' $ 35.000 COP '.
 * Returns NaN when it doesn't look like money, same vibe as Number().
 */
export function parseCOP(value: string): number {
  const cleaned = value.replace(/COP/i, '').replace(/[$\s]/g, '');
  if (!/^-?[\d.]+(,\d+)?$/.test(cleaned)) return NaN;
  return Number(cleaned.replace(/\./g, '').replace(',', '.'));
}

/**
 * Cédula de ciudadanía with dots: '1036654321' -> '1.036.654.321'.
 * Heads up: unlike the NIT, the cédula has NO check digit, so there's no real
 * "validation" beyond length. Don't let anyone tell you otherwise.
 */
export function formatCedula(cedula: string | number): string {
  return groupThousands(String(cedula).replace(/\D/g, ''));
}

/** Old cédulas can have 6-8 digits, the newer ones 10. */
export function isValidCedula(cedula: string | number): boolean {
  const digits = String(cedula).replace(/[.\s]/g, '');
  return /^\d{6,10}$/.test(digits) && !digits.startsWith('0');
}

/**
 * Strips +57, spaces, dashes, parentheses. Returns the 10 national digits.
 * '+57 (300) 123-4567' -> '3001234567'
 */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('57')) digits = digits.slice(2);
  return digits;
}

/** Celular colombiano: 10 digits starting with 3. */
export function isValidMobile(phone: string): boolean {
  return /^3\d{9}$/.test(normalizePhone(phone));
}

/**
 * Fijo: since 2021 every landline is 10 digits and starts with 60X
 * (601 Bogotá, 604 Medellín y Antioquia, 602 Cali...). The old 7-digit
 * numbers are dead, RIP.
 */
export function isValidLandline(phone: string): boolean {
  return /^60\d{8}$/.test(normalizePhone(phone));
}

/**
 * '3001234567' -> '+57 300 123 4567'. Pass `international: false` for '300 123 4567'.
 * If it's not a valid Colombian number we give it back untouched instead of making a mess.
 */
export function formatPhone(phone: string, options: { international?: boolean } = {}): string {
  const digits = normalizePhone(phone);
  if (!/^(3|60)\d+$/.test(digits) || digits.length !== 10) return phone;
  const local = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return options.international === false ? local : `+57 ${local}`;
}
