# Evidence — Database

Relational persistence in SQLite: schema, migrations, and live rows
from the production database.

## Screenshots

### `db-live-rows.png` — live query of the production database

A direct query of `%APPDATA%\rg432-test-rig\rg432-test-rig.db` showing
real rows from both tables:

- `boards` — serial numbers, operators, registration timestamps
- `tests` — `board_id` foreign key, stored status, `status_details`
  status word (`0x9fff`, `0x2fff`, `0x8fff`, `0x0000`), and the decoded
  `test_summary`

**Caption:** Live rows from the production SQLite database. The
`tests.board_id → boards.id` foreign key links every result to its
registered board, and stage-2 columns hold the decoded status word,
summary, and QA values per test.

## Supporting material

- Migrations: `src/main/migrations/` — `001` boards, `002` tests +
  CHECK constraint, `003` index, `004` stage-2 columns
- Schema documentation: `docs/database/schema.md`, `design-notes.md`
  (ERD, normalisation to 3NF, constraint table)
- All queries parameterised — proven by the hostile-input test
  (`test-injection.png`)

## What this demonstrates

- Relational design chosen and justified over non-relational (ADR 002)
- Migration-evolved schema applied incrementally in order
- Application code reading/writing a real data set, evidenced by
  production rows
