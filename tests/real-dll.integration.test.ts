import { describe, it, expect, beforeEach } from 'vitest';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import Database from 'better-sqlite3';
import { createRealDllInterop } from '../src/native/real-dll';
import { saveBoard, saveTest, getTests } from '../src/main/test-repository';
import { setDatabase, getDatabase } from '../src/main/db-instance';
import { runMigrations } from '../src/main/migrations';

const DLL_PATH = join(process.cwd(), 'dll', 'RG432Test1.1.dll');
const CAN_RUN = process.platform === 'win32' && existsSync(DLL_PATH);

// Only runs on Windows when the stage-2 DLL is present (skipped in CI,
// where dll/*.dll is gitignored and therefore not checked out)
describe.skipIf(!CAN_RUN)('real DLL integration (stage-2 DLL)', () => {
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
    expect(result.diagnostics).toMatch(/Details=0x[0-9A-Fa-f]{4}/);
    expect(result.diagnostics).toMatch(/qa=\[/);
    expect(result.statusDetails).toMatch(/^0x[0-9a-f]{4}$/);
    expect(result.testSummary).toBeTruthy();
    expect(result.qa).toHaveLength(4);

    // D8: parsed .dat data is persisted through to SQLite
    saveTest(result);
    const stored = getTests();
    expect(stored).toHaveLength(1);
    expect(stored[0].serialNumber).toBe(serial);
    expect(stored[0].status).toBe(result.status);
    expect(stored[0].diagnostics).toBe(result.diagnostics);
  }, 30000); // real DLL sleeps ~7s inside RunTest

  it('decodes a guaranteed failure at 100% fault injection', async () => {
    const interop = createRealDllInterop();
    const serial = `RG432-FAIL-${Date.now()}`;

    await interop.registerBoard({
      serialNumber: serial,
      operator: 'Integration Test',
      timestamp: new Date().toISOString(),
    });

    const result = await interop.runTest(serial, 100);

    // At 100% test 1 always fails (digit 1-9), tests 2-4 are skipped (F)
    expect(result.status).toBe('fail');
    expect(result.statusDetails).toMatch(/^0x[1-9]fff$/);
    expect(result.testSummary).toMatch(/^Test 1 \(/);
    expect(result.qa).toHaveLength(4);
  }, 30000);

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
