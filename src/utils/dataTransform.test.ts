import { describe, it, expect } from 'vitest';
import { getMonthYearLabel } from './dataTransform';

describe('getMonthYearLabel', () => {
  it('returns correct label for Jan 2023', () => {
    expect(getMonthYearLabel(2023, 0)).toBe("Jan '23");
  });

  it('returns correct label for Dec 2023', () => {
    expect(getMonthYearLabel(2023, 11)).toBe("Dec '23");
  });

  it('returns correct label for Jun 2024', () => {
    expect(getMonthYearLabel(2024, 5)).toBe("Jun '24");
  });
});
