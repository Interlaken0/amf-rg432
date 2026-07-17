# Database Schema

The test rig uses a SQLite database stored in the Electron `userData` directory. The file is named `rg432-test-rig.db`. Schema changes are applied through numbered SQL migration files in `src/main/migrations`.

## Tables

### boards

Stores every registered RG432 board.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Internal identifier. |
| serial_number | TEXT | NOT NULL, UNIQUE | Board serial number entered or scanned by the operator. |
| operator | TEXT | NOT NULL | Name of the operator who registered the board. |
| registered_at | TEXT | NOT NULL | ISO 8601 timestamp of registration. |

### tests

Stores the result of every test run.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Internal identifier. |
| board_id | INTEGER | NOT NULL, FOREIGN KEY | Reference to `boards.id`. |
| operator | TEXT | NOT NULL | Operator who ran the test. |
| tested_at | TEXT | NOT NULL | ISO 8601 timestamp of the test. |
| status | TEXT | NOT NULL, CHECK | `pass`, `fail`, or `pending`. |
| diagnostics | TEXT | nullable | Optional failure message or diagnostic detail. |

## Migrations

Migrations are tracked in the `migrations` table. Each migration is applied once and records an `applied_at` timestamp. The migration runner executes files in `src/main/migrations` in lexical order and skips any migration already recorded.

| Migration | Description |
|-----------|-------------|
| 001 | Create the `boards` table. |
| 002 | Create the `tests` table with a foreign key to `boards`. |
