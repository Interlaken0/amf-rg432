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
