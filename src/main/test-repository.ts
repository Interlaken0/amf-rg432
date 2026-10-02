import { getDatabase } from './db-instance';
import type { BoardRegistration, TestResult } from '../shared/types';

/**
 * Save a board registration to the database
 * @param registration The board registration details
 * @returns The ID of the inserted or updated board
 */
export function saveBoard(registration: BoardRegistration): number {
  const db = getDatabase();
  const statement = db.prepare(`
    INSERT INTO boards (serial_number, operator, registered_at)
    VALUES (?, ?, ?)
    ON CONFLICT(serial_number) DO UPDATE SET
      operator = excluded.operator,
      registered_at = excluded.registered_at
    RETURNING id
  `);
  const row = statement.get(
    registration.serialNumber,
    registration.operator,
    registration.timestamp,
  ) as { id: number };
  return row.id;
}

/**
 * Get a board registration by serial number
 * @param serialNumber The board serial number
 * @returns The board registration, or undefined if not found
 */
export function getBoard(serialNumber: string): BoardRegistration | undefined {
  const db = getDatabase();
  const statement = db.prepare(
    'SELECT serial_number AS serialNumber, operator, registered_at AS timestamp FROM boards WHERE serial_number = ?',
  );
  return statement.get(serialNumber) as BoardRegistration | undefined;
}

/**
 * Get the internal database ID for a board
 * @param serialNumber The board serial number
 * @returns The board ID
 * @throws Error if the board is not registered
 */
function getBoardId(serialNumber: string): number {
  const db = getDatabase();
  const statement = db.prepare('SELECT id FROM boards WHERE serial_number = ?');
  const row = statement.get(serialNumber) as { id: number } | undefined;
  if (!row) {
    throw new Error(`Board ${serialNumber} is not registered`);
  }
  return row.id;
}

/**
 * Save a test result to the database
 * @param result The test result details
 * @returns The ID of the inserted test
 */
export function saveTest(result: TestResult): number {
  const db = getDatabase();
  const boardId = getBoardId(result.serialNumber);
  const statement = db.prepare(`
    INSERT INTO tests (
      board_id, operator, tested_at, status, diagnostics,
      status_details, test_summary, qa1, qa2, qa3, qa4
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `);
  const row = statement.get(
    boardId,
    result.operator,
    result.timestamp,
    result.status,
    result.diagnostics ?? null,
    result.statusDetails ?? null,
    result.testSummary ?? null,
    result.qa?.[0] ?? null,
    result.qa?.[1] ?? null,
    result.qa?.[2] ?? null,
    result.qa?.[3] ?? null,
  ) as { id: number };
  return row.id;
}

/**
 * Generate the next free RG432 board serial
 *
 * Scans registered serials matching RG432-XXXX (four hex digits) and
 * returns the prefix plus the lowest unused value, padded to four
 * digits. Non-matching serials (seed data, manual entries) are ignored.
 * @returns The next free serial, e.g. "RG432-0124"
 */
export function nextBoardSerial(): string {
  const db = getDatabase();
  const rows = db.prepare('SELECT serial_number FROM boards').all() as {
    serial_number: string;
  }[];

  const used = new Set<number>();
  for (const { serial_number: serial } of rows) {
    const match = /^RG432-([0-9A-Fa-f]{4})$/.exec(serial);
    if (match) {
      used.add(parseInt(match[1], 16));
    }
  }

  let next = 1;
  while (used.has(next)) {
    next += 1;
  }
  return `RG432-${next.toString(16).toUpperCase().padStart(4, '0')}`;
}

/**
 * Get all test results from the database
 * @returns Array of all test results
 */
export function getTests(): TestResult[] {
  const db = getDatabase();
  const statement = db.prepare(`
    SELECT
      t.id,
      b.serial_number AS serialNumber,
      t.operator,
      t.tested_at AS timestamp,
      t.status,
      t.diagnostics,
      t.status_details AS statusDetails,
      t.test_summary AS testSummary,
      t.qa1, t.qa2, t.qa3, t.qa4
    FROM tests t
    JOIN boards b ON b.id = t.board_id
    ORDER BY t.id DESC
  `);
  const rows = statement.all() as (Omit<TestResult, 'qa'> & {
    qa1: number | null;
    qa2: number | null;
    qa3: number | null;
    qa4: number | null;
  })[];
  return rows.map(({ qa1, qa2, qa3, qa4, ...rest }) => ({
    ...rest,
    qa: qa1 === null ? undefined : [qa1, qa2, qa3, qa4].map((v) => v ?? 0),
  }));
}
