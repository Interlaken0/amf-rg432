import type Database from 'better-sqlite3';

/**
 * Singleton database instance
 */
let db: Database.Database | null = null;

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
 * Set the database instance (primarily for testing and seeding)
 * @param database The database instance to set, or null to clear
 */
export function setDatabase(database: Database.Database | null): void {
  db = database;
}
