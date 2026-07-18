import { app } from 'electron';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { runMigrations } from './migrations';

/**
 * Singleton database instance
 */
let db: Database.Database | null = null;

/**
 * Initialise the SQLite database connection
 * @returns The database instance
 */
export function initialiseDatabase(): Database.Database {
  if (db) {
    return db;
  }

  const userDataPath = app.getPath('userData');
  const dbPath = join(userDataPath, 'rg432-test-rig.db');

  db = new Database(dbPath);
  runMigrations(db);

  return db;
}

/**
 * Get the current database instance
 * @returns The database instance
 * @throws Error if the database has not been initialised
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database has not been initialised');
  }
  return db;
}

/**
 * Set the database instance (primarily for testing)
 * @param database The database instance to set, or null to clear
 */
export function setDatabase(database: Database.Database | null): void {
  db = database;
}
