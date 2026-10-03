# ADR 009: Derive pass / retest / fail from the status word

## Status

Accepted

## Context

Jeff's stage-2 DLL returns a four-digit status word where the first non-`F`
digit is the verdict: `0` pass, `1`-`5` retryable connexion faults, `6`-`9`
terminal failures. That gives three operator outcomes but the `tests` table
only stored a two-valued `status` column (`pass` / `fail`).

I had to decide where the third state (`retest`) would live:

- **Add a `retryable` column to the DB** - explicit, but it can drift from the
  status word and does nothing for rows that already exist
- **Parse the `test_summary` text** - fragile, couples classification to
  wording
- **Derive it from `status_details` everywhere it's needed** - the word is
  already stored and is the authoritative source

## Decision

Derive the verdict from the stored status word via shared helpers in
`src/shared/status.ts` (`statusDigits`, `isRetryable`) and
`src/shared/history.ts` (`displayStatus`). No schema change; `status` keeps
its raw `pass`/`fail` value and `retest` is a display-level concept.

### Why this made sense

The status word is the single source of truth Jeff's DLL gives us - deriving
from it means the badge, the history pill, search, and the CSV export can
never disagree with each other. It also works for rows written before the
stage-2 schema existed. One shared module keeps the classification rule
(`6`-`9` terminal, `1`-`5` retryable) in exactly one place.

## What this means for us

### The good stuff

- One rule, one module - the result card, history table, search filter, and
  CSV all render identical verdicts
- Old rows classify correctly with no data migration
- Changing Jeff's classification rule later means editing one function

### The trade-offs

- `retest` is not a queryable column - SQL can't filter on it directly
- Any consumer that skips the shared helpers will show raw `fail` again

### How we're handling the downsides

- All filtering goes through `filterTestHistory`, which applies the derived
  status to search and export identically
- `report.test.ts` and `history.test.ts` pin the three-way classification
