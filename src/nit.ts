/**
 * NIT (Número de Identificación Tributaria) helpers.
 *
 * The DIAN "dígito de verificación" (DV) is a weighted sum mod 11. The weights are
 * primes, applied from right to left. Nobody remembers them, everybody copies them
 * from some forum — so here they are, with tests, once and for all.
 */

const WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71] as const;

/** Removes dots, spaces and anything that is not a digit. '890.903.938' -> '890903938' */
function onlyDigits(value: string | number): string {
  return String(value).replace(/\D/g, '');
}

/**
 * Calculates the DV for a NIT (without the DV, obviously).
 *
 * @example
 * calculateNitDV('890903938') // 8
 */
export function calculateNitDV(nit: string | number): number {
  const digits = onlyDigits(nit);
  if (digits.length === 0 || digits.length > WEIGHTS.length) {
    throw new RangeError(`NIT must have between 1 and ${WEIGHTS.length} digits`);
  }

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    // Walk from the last digit backwards, that's how DIAN does it
    sum += Number(digits[digits.length - 1 - i]) * WEIGHTS[i]!;
  }

  const remainder = sum % 11;
  return remainder > 1 ? 11 - remainder : remainder;
}

/**
 * Validates a full NIT including the DV. Accepts the usual ways people write it:
 * '890903938-8', '890.903.938-8', '8909039388'.
 */
export function isValidNit(value: string | number): boolean {
  const raw = String(value).trim();
  let base: string;
  let dv: string;

  const dashed = /^([\d.\s]+)-\s*(\d)$/.exec(raw);
  if (dashed) {
    base = onlyDigits(dashed[1]!);
    dv = dashed[2]!;
  } else {
    // No dash? Then the last digit is the DV. Ambiguous, but that's how people paste it.
    const digits = onlyDigits(raw);
    if (digits.length !== raw.replace(/[.\s]/g, '').length) return false; // letters or weird stuff
    base = digits.slice(0, -1);
    dv = digits.slice(-1);
  }

  if (base.length < 6 || base.length > WEIGHTS.length) return false;
  return calculateNitDV(base) === Number(dv);
}

/**
 * Pretty-prints a NIT: '890903938' -> '890.903.938-8'.
 * If you pass it with the DV already, set `hasDV: true` and it won't calculate a new one.
 */
export function formatNit(nit: string | number, options: { hasDV?: boolean } = {}): string {
  const digits = onlyDigits(nit);
  const base = options.hasDV ? digits.slice(0, -1) : digits;
  const dv = options.hasDV ? digits.slice(-1) : String(calculateNitDV(base));
  return `${groupThousands(base)}-${dv}`;
}

/** 1234567 -> '1.234.567'. Colombian style: dots for thousands. */
export function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
