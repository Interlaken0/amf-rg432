import { getDatabase } from './database';
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
    INSERT INTO tests (board_id, operator, tested_at, status, diagnostics)
    VALUES (?, ?, ?, ?, ?)
    RETURNING id
  `);
  const row = statement.get(
    boardId,
    result.operator,
    result.timestamp,
    result.status,
    result.diagnostics ?? null,
  ) as { id: number };
  return row.id;
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
      t.diagnostics
    FROM tests t
    JOIN boards b ON b.id = t.board_id
    ORDER BY t.id DESC
  `);
  return statement.all() as TestResult[];
}
