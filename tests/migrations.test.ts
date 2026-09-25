/**
 * Database migrations module tests
 */
import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/main/migrations';

/**
 * Test suite for database migrations
 */
describe('database migrations', () => {
  /**
   * Test that runMigrations creates the expected tables
   */
  it('creates the expected tables', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all() as { name: string }[];

    const names = tables.map((table) => table.name);
    expect(names).toContain('migrations');
    expect(names).toContain('boards');
    expect(names).toContain('tests');
  });

  /**
   * Test that runMigrations records each migration and skips already applied migrations
   */
  it('records each migration and skips already applied migrations', () => {
    const db = new Database(':memory:');
    runMigrations(db);
    runMigrations(db);

    const rows = db
      .prepare('SELECT id FROM migrations ORDER BY id')
      .all() as { id: number }[];

    expect(rows.map((row) => row.id)).toEqual([1, 2]);
  });
});
