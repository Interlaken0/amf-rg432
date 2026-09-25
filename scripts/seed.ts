/**
 * Database seed script
 *
 * Populates the development database with realistic board registrations and
 * test results for UI development and UAT. Run with: npm run seed
 *
 * The database location can be overridden with the RG432_DB_PATH environment
 * variable; by default it targets the Electron userData directory so the app
 * picks up the seeded data on next launch.
 */
import { join, dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/main/migrations';
import { setDatabase } from '../src/main/db-instance';
import { saveBoard, saveTest } from '../src/main/test-repository';

/**
 * Deterministic PRNG so the seeded data set is reproducible
 */
let rngState = 0x432;
function nextRandom(): number {
  rngState = (rngState * 1103515245 + 12345) % 2147483648;
  return rngState / 2147483648;
}

/**
 * Resolve the database file path
 * @returns The path to the database file
 */
function resolveDbPath(): string {
  if (process.env.RG432_DB_PATH) {
    return process.env.RG432_DB_PATH;
  }
  const appData = process.env.APPDATA ?? process.cwd();
  return join(appData, 'rg432-test-rig', 'rg432-test-rig.db');
}

const OPERATORS = ['Dave', 'Sarah', 'Greg'];
const FAIL_DIAGNOSTICS = [
  'Error flag 0x01: converter self-test failed',
  'Error flag 0x02: output level out of tolerance',
  'Error flag 0x04: checksum mismatch on verification pass',
];

const DAY_MS = 24 * 60 * 60 * 1000;

function main(): void {
  const dbPath = resolveDbPath();
  mkdirSync(dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  runMigrations(db);
  setDatabase(db);

  const now = Date.now();
  let boardCount = 0;
  let testCount = 0;

  const seed = db.transaction(() => {
    for (let i = 1; i <= 10; i++) {
      const serialNumber = `RG432-${String(i).padStart(4, '0')}`;
      const operator = OPERATORS[i % OPERATORS.length];
      const registeredAt = new Date(now - (30 - i) * DAY_MS).toISOString();

      saveBoard({ serialNumber, operator, timestamp: registeredAt });
      boardCount++;

      const testRuns = 1 + Math.floor(nextRandom() * 3);
      for (let j = 0; j < testRuns; j++) {
        const isPass = nextRandom() > 0.12;
        saveTest({
          id: 0,
          serialNumber,
          operator: OPERATORS[Math.floor(nextRandom() * OPERATORS.length)],
          timestamp: new Date(now - Math.floor(nextRandom() * 25) * DAY_MS).toISOString(),
          status: isPass ? 'pass' : 'fail',
          diagnostics: isPass
            ? undefined
            : FAIL_DIAGNOSTICS[Math.floor(nextRandom() * FAIL_DIAGNOSTICS.length)],
        });
        testCount++;
      }
    }
  });

  seed();
  db.close();

  console.log(`Seeded ${boardCount} boards and ${testCount} test results`);
  console.log(`Database: ${dbPath}`);
}

main();
