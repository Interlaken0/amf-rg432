import { app } from 'electron';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { runMigrations } from './migrations';

let db: Database.Database | null = null;

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

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database has not been initialised');
  }
  return db;
}
