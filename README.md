# colombia-kit 🇨🇴

[![npm](https://img.shields.io/npm/v/colombia-kit)](https://www.npmjs.com/package/colombia-kit)
[![CI](https://github.com/emejiac/colombia-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/emejiac/colombia-kit/actions/workflows/ci.yml)
[![bundle size](https://img.shields.io/bundlephobia/minzip/colombia-kit)](https://bundlephobia.com/package/colombia-kit)
[![license](https://img.shields.io/npm/l/colombia-kit)](./LICENSE)

Festivos, días hábiles, NIT, pesos and DANE codes for Colombia. TypeScript, zero dependencies, ~4 KB gzipped.

```bash
npm install colombia-kit
```

Requires Node 20 or later. Works in browsers too (no dependencies, no Node APIs).

I'm Esneider, a developer from [Medellín] 🇨🇴. Every time I built something for a Colombian client — [invoices, delivery dates, payroll] — I ended up copy-pasting the same festivos function from an old project. Then one day [a delivery date came out wrong because my copy didn't move San Pedro to Monday], and that was it, parce: I decided to write it once, properly, with tests. This is that.

## Why

Every Colombian project ends up needing the same five things: festivos, días hábiles, the NIT check digit, money that looks like `$1.250.000`, and the list of departamentos. I got tired of copy-pasting them between projects (and of the copies having bugs), so here they are, once, with tests.

## Festivos

```ts
import { getHolidays, isHoliday, getNextHoliday } from 'colombia-kit';

isHoliday('2026-07-20'); // true

getNextHoliday('2026-11-12');
// { date: '2026-11-16', name: 'Independencia de Cartagena', movedFrom: '2026-11-11' }

getHolidays(2026); // all 18, sorted
```

Implements Ley 51 de 1983 (Ley Emiliani): fixed holidays, holidays moved to Monday, and Easter-based ones. Works for any year from 1984 on, no hardcoded tables to update every December.

## Días hábiles

```ts
import { addBusinessDays, businessDaysBetween, isBusinessDay } from 'colombia-kit';

addBusinessDays('2026-01-09', 1); // '2026-01-13' — Monday 12 is Reyes
addBusinessDays('2026-11-13', 1, { includeSaturday: true }); // '2026-11-14'
businessDaysBetween('2026-11-13', '2026-11-20'); // 4
```

The start date never counts, the same way "le llega en 3 días hábiles" works.

## NIT

```ts
import { calculateNitDV, isValidNit, formatNit } from 'colombia-kit';

calculateNitDV('890903938'); // 8
isValidNit('890.903.938-8'); // true
formatNit('890903938'); // '890.903.938-8'
```

## Pesos, cédulas y celulares

```ts
import { formatCOP, parseCOP, formatCedula, formatPhone, isValidMobile } from 'colombia-kit';

formatCOP(1250000); // '$1.250.000'
formatCOP(1500.5, { decimals: 2 }); // '$1.500,50'
parseCOP('$1.250.000'); // 1250000
formatCedula('1036654321'); // '1.036.654.321'
formatPhone('3001234567'); // '+57 300 123 4567'
isValidMobile('+57 300 123 4567'); // true
```

`formatCOP` doesn't use `Intl` on purpose: its output changes between runtimes and breaks snapshots and PDFs.

## Departamentos

```ts
import { DEPARTMENTS, getDepartmentByCode, getDepartmentByName } from 'colombia-kit';

getDepartmentByCode('05'); // { code: '05', name: 'Antioquia', capital: 'Medellín' }
getDepartmentByName('boyaca'); // accents and case don't matter
```

## Dates and timezones

Every function takes a `'YYYY-MM-DD'` string or a `Date`. A `Date` is read as the local calendar day the user sees, and results come back as `'YYYY-MM-DD'` strings. That avoids the classic bug where `new Date('2026-01-01')` is still December 31 in Colombia. CI runs the tests in Bogotá, Tokyo and UTC.

## Roadmap

- [ ] Municipios (DIVIPOLA completo)
- [ ] Bancos para PSE
- [ ] Festivos as `.ics` for calendars

PRs welcome, parce. Read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## License

MIT © [Esneider Mejía Ciro](https://github.com/emejiac)
