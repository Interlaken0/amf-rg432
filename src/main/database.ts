import { app } from 'electron';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { runMigrations } from './migrations';
import { getDatabase, setDatabase } from './db-instance';

/**
 * Initialise the SQLite database connection
 * @returns The database instance
 */
export function initialiseDatabase(): Database.Database {
  try {
    return getDatabase();
  } catch {
    // No instance yet - create one
  }

  const userDataPath = app.getPath('userData');
  const dbPath = join(userDataPath, 'rg432-test-rig.db');

  const db = new Database(dbPath);
  runMigrations(db);
  setDatabase(db);

  return db;
}

export { getDatabase, setDatabase };
