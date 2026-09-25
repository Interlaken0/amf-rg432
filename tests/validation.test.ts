import { describe, expect, it } from 'vitest';
import { isValidSerial } from '../src/shared/validation';

describe('isValidSerial', () => {
  it('accepts product serials and plain numeric serials', () => {
    expect(isValidSerial('RG432-001')).toBe(true);
    expect(isValidSerial('rg432-abc')).toBe(true);
    expect(isValidSerial('54321')).toBe(true);
    expect(isValidSerial('1111111111111')).toBe(true);
  });

  it('rejects serials that are empty, too short, or contain invalid characters', () => {
    expect(isValidSerial('')).toBe(false);
    expect(isValidSerial('   ')).toBe(false);
    expect(isValidSerial('ab')).toBe(false);
    expect(isValidSerial('RG 432')).toBe(false);
    expect(isValidSerial('!!!')).toBe(false);
    expect(isValidSerial('-RG432-001')).toBe(false);
    expect(isValidSerial('a'.repeat(33))).toBe(false);
  });
});
