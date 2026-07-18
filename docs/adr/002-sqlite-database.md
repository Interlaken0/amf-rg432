# ADR 002: Choose SQLite with better-sqlite3 for data persistence

## Status

Accepted

## Context

The test rig needs to store a few things permanently - board registrations with serial numbers, who ran the test and when, plus the actual test results including status and diagnostics. We also need to keep a history of all tests for traceability and reporting.

I had a few options to consider:

- **SQLite with better-sqlite3** - embedded database with a synchronous API
- **SQLite with sql.js** - in-memory or WASM-based, not great for long-term storage
- **JSON files** - simple but can't really query them properly and no integrity guarantees
- **IndexedDB** - browser-only, doesn't work in the Electron main process
- **PostgreSQL/MySQL** - needs an external server, overkill for a single PC

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
