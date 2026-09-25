# ADR 002: Choose SQLite with better-sqlite3 for data persistence

## Status

Accepted

## Context

The test rig needs to store a few things permanently - board registrations with serial numbers, who ran the test and when, plus the actual test results including status and diagnostics. We also need to keep a history of all tests for traceability and reporting.

I had a few options to consider:

- **SQLite with better-sqlite3** - embedded relational database with a synchronous API
- **SQLite with sql.js** - in-memory or WASM-based, not great for long-term storage
- **JSON files** - simple but can't really query them properly and no integrity guarantees
- **IndexedDB** - browser-only, doesn't work in the Electron main process
- **PostgreSQL/MySQL** - needs an external server, overkill for a single PC

## Relational vs non-relational

The choice here is really between a relational database and a non-relational store, and it's worth spelling out why relational wins for this project.

Our data is inherently relational. A board has many tests, and every test record needs to trace back to a registered board and an operator. That maps naturally onto tables with foreign keys - the `tests` table references `boards`, and the schema enforces that you can't record a test against a serial number that was never registered. A non-relational store like JSON files or a document database can't enforce that integrity; the relationship would only exist as a convention in the code, and nothing would stop a bad write from corrupting it.

Relational also gives us declarative querying through SQL. The batch reports and test history need joins and aggregations - "all tests for this board", "pass rate per operator this week". In a document store I'd be loading everything into memory and filtering in JavaScript, which is both slower and more error-prone. Migrations are another point: the schema evolves through versioned SQL migration files, so every database upgrade is explicit and auditable.

The trade-off is that a relational schema is rigid - changing the structure means writing a migration rather than just saving a different-shaped object. For a test rig where the record format is stable and traceability matters, that rigidity is a feature, not a bug. Non-relational stores shine when the data shape varies per record or when you need horizontal scaling across servers; neither applies to a single-operator Windows desktop app.

## Data protection

The database stores personal data - operator names are recorded against board registrations and test results - so GDPR applies even though this is an internal tool.

The approach I'm taking:

- **Data minimisation** - we only store the operator identifier needed for traceability, nothing else personal
- **Storage limitation** - the database lives in the OS-standard `userData` directory on the local machine only; it is never transmitted off the PC
- **Integrity** - all queries use parameterised placeholders, which prevents SQL injection and accidental corruption (see the Security Checklist)
- **Retention** - test records need to be kept for production traceability, but the batch report export gives us a route to archive or purge old records when a retention policy is agreed with Jeff
- **Access control** - the Electron main process is the only path to the database file; the renderer reaches it through the allowlisted IPC bridge, so there's no direct filesystem access from UI code

If the tool is ever deployed to a shared factory PC, we should revisit this - operator logins and OS-level file permissions would become relevant.

## Decision

I chose **SQLite** with the **better-sqlite3** library for storing data.

### Why this approach works

SQLite is embedded, so there's no separate database server to worry about. The better-sqlite3 library gives us a synchronous API which is simpler to work with in the Electron main process. We get full SQL support for when we need to do more complex queries like joins and aggregations. Transactions keep the data integrity intact, and since it's file-based, backing up or exporting the database is just copying a file. Electron's userData directory gives us a standard, secure place to put that database file.

## What this means for us

### The good stuff

- No setup needed - no database server to manage
- Fast enough for the amount of data we're expecting
- Easy to grab the whole database file for analysis
- ACID compliance means our test records are stored reliably

### The trade-offs

- Concurrency is limited - one writer, multiple readers
- Not built for multi-user network access
- The synchronous API could block the main process if queries get slow

### How we're handling the downsides

- The test rig is single-user anyway, so concurrency isn't really an issue
- Keeping queries simple and indexed to avoid blocking
- Using parameterised queries to prevent SQL injection
- Running migrations to manage schema changes safely
