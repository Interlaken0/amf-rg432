/**
 * Test repository module tests
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/main/migrations';
import { setDatabase } from '../src/main/database';
import { saveBoard, getBoard, saveTest, getTests } from '../src/main/test-repository';

/**
 * Test suite for test repository functions
 */
describe('test repository', () => {
  let db: Database.Database;

  beforeAll(() => {
    db = new Database(':memory:');
    runMigrations(db);
    setDatabase(db);
  });

  afterAll(() => {
    setDatabase(null);
    db.close();
  });

  /**
   * Test that saveBoard saves a board and getBoard retrieves it by serial number
   */
  it('saves a board and retrieves it by serial number', () => {
    const registration = {
      serialNumber: 'RG432-001',
      operator: 'Greg',
      timestamp: '2026-01-01T00:00:00.000Z',
    };

    const id = saveBoard(registration);
    expect(id).toBeGreaterThan(0);

    const board = getBoard('RG432-001');
    expect(board).toEqual(registration);
  });

  /**
   * Test that saveBoard updates an existing board when registered again
   */
  it('updates an existing board when registered again', () => {
    const first = {
      serialNumber: 'RG432-002',
      operator: 'Greg',
      timestamp: '2026-01-01T00:00:00.000Z',
    };
    const second = {
      serialNumber: 'RG432-002',
      operator: 'Jeff',
      timestamp: '2026-01-02T00:00:00.000Z',
    };

    saveBoard(first);
    saveBoard(second);
    const board = getBoard('RG432-002');

    expect(board).toEqual(second);
  });

  /**
   * Test that saveTest saves a test result and getTests returns it in history
   */
  it('saves a test result and returns it in history', () => {
    const registration = {
      serialNumber: 'RG432-003',
      operator: 'Greg',
      timestamp: '2026-01-01T00:00:00.000Z',
    };
    saveBoard(registration);

    const result = {
      id: 0,
      serialNumber: 'RG432-003',
      operator: 'Greg',
      timestamp: '2026-01-02T00:00:00.000Z',
      status: 'pass' as const,
      diagnostics: undefined,
    };

    const id = saveTest(result);
    expect(id).toBeGreaterThan(0);

    const history = getTests();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]).toMatchObject({
      serialNumber: 'RG432-003',
      operator: 'Greg',
      status: 'pass',
    });
  });

  /**
   * Test that saveTest throws when saving a test for an unregistered board
   */
  it('throws when saving a test for an unregistered board', () => {
    const result = {
      id: 0,
      serialNumber: 'UNKNOWN-001',
      operator: 'Greg',
      timestamp: '2026-01-01T00:00:00.000Z',
      status: 'fail' as const,
      diagnostics: 'Missing board',
    };

    expect(() => saveTest(result)).toThrow('Board UNKNOWN-001 is not registered');
  });
});
