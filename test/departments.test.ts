import { describe, expect, it } from 'vitest';
import { DEPARTMENTS, getDepartmentByCode, getDepartmentByName } from '../src';

describe('departments', () => {
  it('has the 32 departamentos + Bogotá', () => {
    expect(DEPARTMENTS).toHaveLength(33);
    expect(new Set(DEPARTMENTS.map((d) => d.code)).size).toBe(33);
  });

  it('finds by code, even sloppy ones', () => {
    expect(getDepartmentByCode('05')?.name).toBe('Antioquia');
    expect(getDepartmentByCode(5)?.capital).toBe('Medellín');
    expect(getDepartmentByCode('00')).toBeUndefined();
  });

  it('finds by name without caring about accents', () => {
    expect(getDepartmentByName('BOYACA')?.code).toBe('15');
    expect(getDepartmentByName('quindío')?.capital).toBe('Armenia');
    expect(getDepartmentByName('Valle')?.code).toBe('76');
    expect(getDepartmentByName('Bogotá D.C.')?.code).toBe('11');
    expect(getDepartmentByName('Narnia')).toBeUndefined();
  });

  it('is frozen', () => {
    expect(() => {
      (DEPARTMENTS[0] as { name: string }).name = 'x';
    }).toThrow();
  });
});
