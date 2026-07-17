import { describe, it, expect } from 'vitest';
import { registerBoard, runTest, getTestHistory } from '../src/native/mock-dll';

describe('mock DLL', () => {
  it('registers a board and returns it in history after a test', async () => {
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

    const history = await getTestHistory();
    expect(history.length).toBeGreaterThan(0);
  });

  it('throws when running a test for an unregistered board', async () => {
    await expect(runTest('UNKNOWN-001')).rejects.toThrow('has not been registered');
  });
});
