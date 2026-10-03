/**
 * Mock DLL module tests
 */
import { describe, it, expect } from 'vitest';
import {
  registerBoard,
  runTest,
  createMockDllInterop,
} from '../src/native/mock-dll';

/**
 * Test suite for mock DLL functions
 */
describe('mock DLL', () => {
  /**
   * Test that registerBoard registers a board and runTest returns a result
   */
  it('registers a board and returns a test result', async () => {
    const registration = {
      serialNumber: 'RG432-001',
      operator: 'Greg',
      timestamp: new Date().toISOString(),
    };

    await registerBoard(registration);
    const result = await runTest('RG432-001');

    expect(result.serialNumber).toBe('RG432-001');
    expect(result.operator).toBe('Greg');
    expect(['pass', 'fail']).toContain(result.status);
  });

  /**
   * Test that runTest throws when running a test for an unregistered board
   */
  it('throws when running a test for an unregistered board', async () => {
    await expect(runTest('UNKNOWN-001')).rejects.toThrow('has not been registered');
  });

  /**
   * Test that a forced failure produces a stage-2-shaped status word:
   * the first failing stage carries a fault digit 1-9 and every later
   * stage is skipped (F), matching the real DLL's contract
   */
  it('produces a stage-2-shaped status word on failure', async () => {
    await registerBoard({
      serialNumber: 'RG432-200',
      operator: 'Test Operator',
      timestamp: new Date().toISOString(),
    });

    const result = await runTest('RG432-200', 1);

    expect(result.status).toBe('fail');
    expect(result.statusDetails).toMatch(/^0x[0-9a-f]{4}$/);

    const digits = (result.statusDetails ?? '')
      .slice(2)
      .split('')
      .map((c) => parseInt(c, 16));
    const firstBad = digits.findIndex((d) => d !== 0);
    expect(firstBad).toBeGreaterThanOrEqual(0);
    expect(digits[firstBad]).toBeGreaterThanOrEqual(1);
    expect(digits[firstBad]).toBeLessThanOrEqual(9);
    for (const skipped of digits.slice(firstBad + 1)) {
      expect(skipped).toBe(0xf);
    }
  });

  /**
   * Test that a zero failure rate produces a clean pass word
   */
  it('returns 0x0000 when the failure rate is zero', async () => {
    await registerBoard({
      serialNumber: 'RG432-201',
      operator: 'Test Operator',
      timestamp: new Date().toISOString(),
    });

    const result = await runTest('RG432-201', 0);

    expect(result.status).toBe('pass');
    expect(result.statusDetails).toBe('0x0000');
  });

  /**
   * Test that a simulated USB disconnect throws a hardware fault error
   */
  it('simulates a USB disconnect when disconnectRate is 1', async () => {
    const interop = createMockDllInterop({ simulateTiming: false, disconnectRate: 1 });
    await interop.registerBoard({
      serialNumber: 'TEST-DISC',
      operator: 'Test Operator',
      timestamp: new Date().toISOString(),
    });
    await expect(interop.runTest('TEST-DISC')).rejects.toThrow('USB device disconnected');
  });

  /**
   * Test that the interop rejects tests for unregistered boards
   */
  it('interop rejects a test for an unregistered board', async () => {
    const interop = createMockDllInterop({ simulateTiming: false, disconnectRate: 0 });
    await expect(interop.runTest('TEST-NONE')).rejects.toThrow('has not been registered');
  });
});
