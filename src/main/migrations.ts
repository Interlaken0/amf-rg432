import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

  // In dev mode, look for migrations in the source directory
  // In production, look in the compiled dist directory
  let migrationsDir = join(__dirname, 'migrations');
  if (!existsSync(migrationsDir)) {
    migrationsDir = join(__dirname, '../../src/main/migrations');
  }

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
