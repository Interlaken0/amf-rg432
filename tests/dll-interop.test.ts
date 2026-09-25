/**
 * DLL interop module tests
 */
import { describe, it, expect } from 'vitest';
import { createMockDllInterop } from '../src/native/mock-dll';

/**
 * Test suite for DLL interop functions
 */
describe('dll-interop', () => {
  /**
   * Test that createMockDllInterop returns an object with the expected interface
   */
  it('returns an object with the expected interface', () => {
    const interop = createMockDllInterop({ simulateTiming: false, disconnectRate: 0 });
    expect(interop).toBeDefined();
    expect(typeof interop.registerBoard).toBe('function');
    expect(typeof interop.runTest).toBe('function');
  });

  /**
   * Test that the interop object has the required properties
   */
  it('returns an object with the required properties', () => {
    const interop = createMockDllInterop({ simulateTiming: false, disconnectRate: 0 });
    expect(interop).toHaveProperty('registerBoard');
    expect(interop).toHaveProperty('runTest');
  });

  /**
   * Test that the interop functions are callable and work correctly
   */
  it('interop functions are callable', async () => {
    const interop = createMockDllInterop({ simulateTiming: false, disconnectRate: 0 });
    const registration = {
      serialNumber: 'TEST-001',
      operator: 'Test Operator',
      timestamp: new Date().toISOString(),
    };

    await interop.registerBoard(registration);
    const result = await interop.runTest('TEST-001');
    
    expect(result.serialNumber).toBe('TEST-001');
    expect(result.operator).toBe('Test Operator');
    expect(['pass', 'fail']).toContain(result.status);
  });
});
