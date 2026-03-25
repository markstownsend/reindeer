import { describe, it, expect } from 'vitest';
import { countryToFlag } from './countryFlag';

describe('countryToFlag', () => {
  it('returns flag emoji for valid 2-letter codes', () => {
    expect(countryToFlag('US')).toBe('🇺🇸');
    expect(countryToFlag('GB')).toBe('🇬🇧');
    expect(countryToFlag('JP')).toBe('🇯🇵');
  });

  it('returns dot for undefined', () => {
    expect(countryToFlag(undefined)).toBe('●');
  });

  it('returns dot for empty string', () => {
    expect(countryToFlag('')).toBe('●');
  });

  it('returns dot for single character', () => {
    expect(countryToFlag('A')).toBe('●');
  });

  it('returns dot for 3+ characters', () => {
    expect(countryToFlag('USA')).toBe('●');
  });

  it('handles lowercase input', () => {
    expect(countryToFlag('us')).toBe('🇺🇸');
  });
});
