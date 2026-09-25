import { describe, it, expect, beforeEach } from 'vitest';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import Database from 'better-sqlite3';
import { createRealDllInterop } from '../src/native/real-dll';
import { saveBoard, saveTest, getTests } from '../src/main/test-repository';
import { setDatabase, getDatabase } from '../src/main/db-instance';
import { runMigrations } from '../src/main/migrations';

const DLL_PATH = join(process.cwd(), 'dll', 'RG432Test1.0.dll');
const CAN_RUN = process.platform === 'win32' && existsSync(DLL_PATH);

// Only runs on Windows when the stage-1 DLL is present (skipped in CI,
// where dll/*.dll is gitignored and therefore not checked out)
describe.skipIf(!CAN_RUN)('real DLL integration (stage-1 DLL)', () => {
  beforeEach(() => {
    // Route results + DB to a temp location so the test leaves no state behind
    process.env.RG432_USERDATA = join(tmpdir(), `rg432-test-${Date.now()}`);
    setDatabase(new Database(':memory:'));
    runMigrations(getDatabase());
  });

  it('runs the full register -> test -> persist cycle against the DLL', async () => {
    const interop = createRealDllInterop();
    const serial = `RG432-INT-${Date.now()}`;
    const operator = 'Integration Test';

    saveBoard({ serialNumber: serial, operator, timestamp: new Date().toISOString() });
    await interop.registerBoard({ serialNumber: serial, operator, timestamp: new Date().toISOString() });

    const result = await interop.runTest(serial);

    expect(result.serialNumber).toBe(serial);
    expect(['pass', 'fail']).toContain(result.status);
    expect(result.diagnostics).toMatch(/Details=0x[0-9A-Fa-f]+/);
    expect(result.diagnostics).toMatch(/measurements=\[\d+,\d+,\d+,\d+\]/);

    // D8: parsed .dat data is persisted through to SQLite
    saveTest(result);
    const stored = getTests();
    expect(stored).toHaveLength(1);
    expect(stored[0].serialNumber).toBe(serial);
    expect(stored[0].status).toBe(result.status);
    expect(stored[0].diagnostics).toBe(result.diagnostics);
  }, 30000); // real DLL sleeps ~7s inside RunTest

  it('throws a descriptive error when the DLL is missing', async () => {
    process.env.RG432_DLL_PATH = join(tmpdir(), 'nonexistent-dll.dll');
    const interop = createRealDllInterop();
    await expect(
      interop.registerBoard({
        serialNumber: 'RG432-X',
        operator: 'Test',
        timestamp: new Date().toISOString(),
      }),
    ).rejects.toThrow(/nonexistent-dll\.dll/);
    delete process.env.RG432_DLL_PATH;
  });
});
