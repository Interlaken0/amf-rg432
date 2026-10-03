# ADR 011: Carry the results file path inside diagnostics

## Status

Accepted (transitional - a dedicated column remains an option)

## Context

Jeff's `GetResult` returns the `.dat` file name via the `szResultsFile`
out-parameter. The report needs that path for its Results File column, but
the `tests` table was designed before the field existed, and stage-2 already
had a migration (004) landing in the same sprint.

Options considered:

- **Add a `results_file` column (migration 005)** - clean schema, but another
  migration mid-sprint for one field
- **Pack it into `diagnostics`** - the column exists, is free-text, and the
  report already parses `key=value` fragments out of it
- **Drop the field** - loses traceability between a DB row and its `.dat`

## Decision

For now the real-DLL path appends `file=<name>` to the `diagnostics` string
(alongside `Details=`, `summary=`, `qa=` fragments for backwards
compatibility), and `buildBatchReportCsv` extracts it for the Results File
column.

### Why this made sense

It delivered the report field without touching the schema during a sprint
where migrations were already in flight, and legacy/mock diagnostics still
flow through the same column untouched.

## What this means for us

### The good stuff

- No schema churn mid-sprint; works for every existing row shape
- CSV exports the file name today

### The trade-offs

- It's a packed string, not a column - the report has to regex the value
  back out, and SQL can't query it
- `diagnostics` on stage-2 rows partially duplicates what's already in the
  structured columns

### How we're handling the downsides

- The packing and parsing are confined to `real-dll.ts` and `report.ts` -
  nothing else knows the format
- If the field ever needs to be queryable, migration 005 to a real
  `results_file` column is the documented upgrade path; the report change is
  then a one-line swap
