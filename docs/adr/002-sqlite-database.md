# ADR 002: Choose SQLite with better-sqlite3 for data persistence

## Status

Accepted

## Context

The test rig must persist:

- Board registrations (serial number, operator, timestamp)
- Test results (status, diagnostics, timestamp)
- Test history for traceability and reporting

Options considered:

- **SQLite with better-sqlite3**: Embedded SQL database, synchronous API
- **SQLite with sql.js**: In-memory or WASM-based, not ideal for long-term persistence
- **JSON files**: Simple but lacks query capabilities and integrity
- **IndexedDB**: Browser-only, not suitable for Electron main process
- **PostgreSQL/MySQL**: Requires external server, overkill for a single PC

## Decision

Use **SQLite** with the **better-sqlite3** library for data persistence.

### Rationale

- SQLite is embedded and requires no external server
- better-sqlite3 provides a synchronous API, simpler for Electron main process
- Full SQL support for complex queries (joins, aggregations)
- Transaction support for data integrity
- File-based storage is easy to back up and export
- Electron's userData directory provides a standard, secure location for the database file

## Consequences

### Positive

- Zero configuration, no database server to manage
- Fast performance for the expected data volume
- Easy to export the entire database file for analysis
- ACID compliance ensures reliable test record storage

### Negative

- Concurrency is limited (single writer, multiple readers)
- Not suitable for multi-user network access
- Synchronous API can block the main process if queries are slow

### Mitigations

- The test rig is a single-user application, so concurrency is not a concern
- Keep queries simple and indexed to avoid blocking
- Use parameterised queries to prevent SQL injection
- Run migrations to manage schema changes safely
