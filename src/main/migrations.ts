import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type Database from 'better-sqlite3';

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    )
  `);

  const appliedRows = db.prepare('SELECT id FROM migrations').all() as { id: number }[];
  const appliedIds = new Set(appliedRows.map((row) => row.id));

  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const id = parseInt(file.split('_')[0], 10);
    if (Number.isNaN(id) || appliedIds.has(id)) {
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    db.exec(sql);
    db.prepare('INSERT INTO migrations (id, name, applied_at) VALUES (?, ?, ?)').run(
      id,
      file,
      new Date().toISOString(),
    );
  }
}
