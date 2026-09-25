/**
 * Integration tests covering SQLite persistence and the mock DLL provider together
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/main/migrations';
import { setDatabase } from '../src/main/db-instance';
import { saveBoard, getBoard, saveTest, getTests } from '../src/main/test-repository';
import { createMockDllInterop } from '../src/native/mock-dll';

/**
 * End-to-end flow: register board -> run test -> persist -> query history
 */
describe('sqlite and mock dll integration', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    runMigrations(db);
    setDatabase(db);
  });

  afterEach(() => {
    setDatabase(null);
    db.close();
  });

  it('persists a board registered through the interop layer', async () => {
    const interop = createMockDllInterop({ simulateTiming: false, disconnectRate: 0 });
    const registration = {
      serialNumber: 'RG432-1001',
      operator: 'Dave',
      timestamp: new Date().toISOString(),
    };

    await interop.registerBoard(registration);
    saveBoard(registration);

    const stored = getBoard('RG432-1001');
    expect(stored).toBeDefined();
    expect(stored?.operator).toBe('Dave');
  });

  it('persists a mock test result against a registered board', async () => {
    const interop = createMockDllInterop({ simulateTiming: false, disconnectRate: 0 });
    const registration = {
      serialNumber: 'RG432-1002',
      operator: 'Sarah',
      timestamp: new Date().toISOString(),
    };

    await interop.registerBoard(registration);
    saveBoard(registration);

    const result = await interop.runTest('RG432-1002');
    saveTest({ ...result, operator: registration.operator });

    const history = getTests();
    expect(history).toHaveLength(1);
    expect(history[0].serialNumber).toBe('RG432-1002');
    expect(['pass', 'fail']).toContain(history[0].status);
    expect(history[0].operator).toBe('Sarah');
  });

  it('rejects a test result for an unregistered board', async () => {
    const interop = createMockDllInterop({ simulateTiming: false, disconnectRate: 0 });
    await expect(interop.runTest('RG432-9999')).rejects.toThrow('has not been registered');

    expect(() =>
      saveTest({
        id: 0,
        serialNumber: 'RG432-9999',
        operator: 'Dave',
        timestamp: new Date().toISOString(),
        status: 'pass',
      }),
    ).toThrow('not registered');
  });
});
