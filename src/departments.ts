/**
 * Departamentos de Colombia with their DANE (DIVIPOLA) codes.
 *
 * The codes are strings on purpose: '05' is Antioquia, and if you store it as
 * the number 5 some day you'll be debugging why your join with DANE data is empty.
 * Ask me how I know 🥲
 */

export interface Department {
  /** 2-digit DANE code. */
  code: string;
  name: string;
  capital: string;
}

export const DEPARTMENTS: readonly Department[] = Object.freeze(
  [
    { code: '05', name: 'Antioquia', capital: 'Medellín' },
    { code: '08', name: 'Atlántico', capital: 'Barranquilla' },
    { code: '11', name: 'Bogotá, D.C.', capital: 'Bogotá, D.C.' },
    { code: '13', name: 'Bolívar', capital: 'Cartagena de Indias' },
    { code: '15', name: 'Boyacá', capital: 'Tunja' },
    { code: '17', name: 'Caldas', capital: 'Manizales' },
    { code: '18', name: 'Caquetá', capital: 'Florencia' },
    { code: '19', name: 'Cauca', capital: 'Popayán' },
    { code: '20', name: 'Cesar', capital: 'Valledupar' },
    { code: '23', name: 'Córdoba', capital: 'Montería' },
    { code: '25', name: 'Cundinamarca', capital: 'Bogotá, D.C.' },
    { code: '27', name: 'Chocó', capital: 'Quibdó' },
    { code: '41', name: 'Huila', capital: 'Neiva' },
    { code: '44', name: 'La Guajira', capital: 'Riohacha' },
    { code: '47', name: 'Magdalena', capital: 'Santa Marta' },
    { code: '50', name: 'Meta', capital: 'Villavicencio' },
    { code: '52', name: 'Nariño', capital: 'Pasto' },
    { code: '54', name: 'Norte de Santander', capital: 'Cúcuta' },
    { code: '63', name: 'Quindío', capital: 'Armenia' },
    { code: '66', name: 'Risaralda', capital: 'Pereira' },
    { code: '68', name: 'Santander', capital: 'Bucaramanga' },
    { code: '70', name: 'Sucre', capital: 'Sincelejo' },
    { code: '73', name: 'Tolima', capital: 'Ibagué' },
    { code: '76', name: 'Valle del Cauca', capital: 'Cali' },
    { code: '81', name: 'Arauca', capital: 'Arauca' },
    { code: '85', name: 'Casanare', capital: 'Yopal' },
    { code: '86', name: 'Putumayo', capital: 'Mocoa' },
    { code: '88', name: 'Archipiélago de San Andrés, Providencia y Santa Catalina', capital: 'San Andrés' },
    { code: '91', name: 'Amazonas', capital: 'Leticia' },
    { code: '94', name: 'Guainía', capital: 'Inírida' },
    { code: '95', name: 'Guaviare', capital: 'San José del Guaviare' },
    { code: '97', name: 'Vaupés', capital: 'Mitú' },
    { code: '99', name: 'Vichada', capital: 'Puerto Carreño' },
  ].map((d) => Object.freeze(d)),
);

/** Lowercase + no accents, so 'bogota', 'BOGOTÁ' and 'Bogotá' all match. */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** By DANE code. Accepts '5' or 5 too, because people will do that anyway. */
export function getDepartmentByCode(code: string | number): Department | undefined {
  const padded = String(code).padStart(2, '0');
  return DEPARTMENTS.find((d) => d.code === padded);
}

/**
 * By name, accent and case insensitive. Also knows a couple of nicknames:
 * 'Valle', 'San Andrés', 'Bogotá'.
 */
export function getDepartmentByName(name: string): Department | undefined {
  const target = normalize(name);
  const aliases: Record<string, string> = {
    valle: '76',
    'san andres': '88',
    'san andres y providencia': '88',
    bogota: '11',
    'bogota dc': '11',
    guajira: '44',
  };
  const aliasCode = aliases[target.replace(/[.,]/g, '').replace(/\s+/g, ' ')];
  if (aliasCode) return getDepartmentByCode(aliasCode);
  return DEPARTMENTS.find((d) => normalize(d.name) === target);
}
