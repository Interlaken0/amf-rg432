# Algorithms and Data Structures

Where the project actually uses them — written for the K9/S16 evidence. This
is a data-entry and device-control app, so there is no bespoke graph or
sorting machinery; what it does have is a set of deliberate structure and
algorithm choices worth explaining.

## Hash map for registered boards (`Map`)

`src/native/mock-dll.ts` holds registered boards in a `Map<string,
BoardRegistration>`. A `Map` gives O(1) average lookup keyed by serial —
chosen over an array (O(n) `find` per test) and over a plain object because
`Map` preserves insertion order and handles any string key safely.

## B-tree index (`idx_tests_board_id`)

Migration 003 adds a secondary index on `tests.board_id`. SQLite indexes are
B-trees: without one, the history join `tests → boards` scans every test
row; with it, each board lookup is O(log n). The index is also what backs
the `UNIQUE` constraint on `serial_number` — uniqueness is enforced by the
index structure, not by application code.

## Fixed-offset binary parsing (`.dat`)

`parseResultsFile()` in `src/native/real-dll.ts` treats the results file as
a byte buffer with a fixed layout: 256-byte null-padded ASCII serial prefix,
then four measurement bytes at offset 256. Parsing is bounds-checked slicing
plus ASCII decoding — linear in file size, no scanning. Getting this wrong
(reading the serial's ASCII bytes as measurements) was the Sprint 3 parser
bug, and the fix notes are the kind of low-level data-structure reasoning
the criterion looks for.

## Serial validation (regular expression)

`SERIAL_PATTERN` in `src/shared/validation.ts` is a regex — effectively a
finite automaton compiled by the JS engine — enforcing the serial grammar
`[A-Za-z0-9][A-Za-z0-9-]{2,31}` in one pass. Shared between renderer and
main so the rule cannot diverge.

## Sorting and grouping in reports

`buildBatchReportCsv()` sorts results newest-first (comparison sort on the
timestamp) and `summariseTests()` groups by operator using a normalised
lowercase key — a hash-grouping pattern: one pass over the rows, O(n), with
the first-seen casing kept for display. That function was itself a bug fix:
case-sensitive grouping split `greg`/`Greg` into two operators.

## Search filter

History search is a linear scan over the full record set with case-folded
substring matching — the right choice at this data volume; an index-backed
SQL `LIKE` would be premature for a screen-sized dataset. The rendered view
then caps the list at a five-row preview unless expanded or a search is
active, which is a display constraint only, never a data one.

## Race-condition handling

The mock simulates the real failure mode: a mid-test disconnect flips
`deviceConnected` mid-iteration, throwing at the point a real USB fault
would. On the main-process side, the `run-test` handler holds the invariant
that a thrown test still leaves a fail row — the "critical section" here is
ordering (log diagnostics → persist → rethrow) rather than locking.
