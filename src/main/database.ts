import { app } from 'electron';
import { join } from 'node:path';
import Database from 'better-sqlite3';

let db: Database.Database | null = null;

export function initialiseDatabase(): Database.Database {
  if (db) {
    return db;
  }

  const userDataPath = app.getPath('userData');
  const dbPath = join(userDataPath, 'rg432-test-rig.db');

  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serial_number TEXT NOT NULL UNIQUE,
      operator TEXT NOT NULL,
      registered_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_id INTEGER NOT NULL,
      operator TEXT NOT NULL,
      tested_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pass', 'fail', 'pending')),
      diagnostics TEXT,
      FOREIGN KEY (board_id) REFERENCES boards(id)
    );
  `);

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database has not been initialised');
  }
  return db;
}
