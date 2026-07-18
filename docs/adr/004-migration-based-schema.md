# ADR 004: Use migration-based schema for database changes

## Status

Accepted

## Context

The SQLite database schema is going to evolve as the project progresses. I initially used inline `CREATE TABLE` statements in the database initialisation code, but that approach makes it difficult to track the schema history, roll back changes if something goes wrong, deploy updates to existing installations, or even understand what the current state of the database actually is.

I looked at a few options:

- **Inline CREATE TABLE** - simple but no version control or rollback capability
- **Migration-based schema** - numbered SQL files applied in order, with tracking
- **ORM auto-migration** - complex for a simple schema, adds another dependency
- **Manual SQL scripts** - error-prone, no automated tracking

## Decision

I went with a **migration-based schema** using numbered SQL files and a migrations table.

### Why this approach works

Each schema change becomes a separate, versioned file. The migrations get applied in lexical order and we track what's been run in a `migrations` table. This means existing installations can be upgraded safely by just running any pending migrations. The schema history is explicit and auditable, which aligns with how databases are handled in other frameworks like Rails and Django. It's also simple to implement with a small runner script.

## What this means for us

### The good stuff

- Clear history of all schema changes
- Safe upgrades for deployed applications
- Easy to roll back by reversing migrations
- No manual SQL intervention needed when upgrading

### The trade-offs

- Slightly more complex than inline schema
- Need to be disciplined about using migrations for all schema changes
- Migration files must be carefully named and ordered

### How we're handling the downsides

- Keeping the migration runner simple and well-tested
- Documenting the migration process in the project docs
- Using descriptive filenames (e.g., `001_create_boards.sql`)
- Running migrations automatically on application startup
