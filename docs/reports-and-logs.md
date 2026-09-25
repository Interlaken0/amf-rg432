# Batch Report & Diagnostic Log Formats

Design schemas for the two export artefacts (Sprint 4 Day 1 DoD): the batch
report CSV and the failure diagnostic log. Implemented in
`src/main/report.ts` and `src/main/diagnostics.ts`.

## Batch report (CSV)

Triggered by **Export CSV** in the app → save dialog → written to the
operator-chosen path. Default filename `rg432-batch-report-<YYYY-MM-DD>.csv`.
RFC-4180-style quoting, CRLF line endings for Excel compatibility.

### Structure

The report is split into three labelled sections: a run summary, a
per-operator breakdown, then the detail rows.

```csv
RG432 Test Rig - Batch Report
Generated,2026-09-25 15:02:08

SUMMARY
Total Tests,10
Passed,9
Failed,1
Pass Rate,90.0%

OPERATOR BREAKDOWN
Operator,Tests,Passed,Failed,Pass Rate
Greg,10,9,1,90.0%

TEST RESULTS
ID,Serial Number,Operator,Tested At,Status,Result Code,Measurements,Results File,Notes
10,RG432-003,Greg,2026-09-25 14:40:24,pass,0x1234,"0, 0, 3, 0",260925-144024-RG432-003.dat,
```

### Conventions

- **Operator grouping is case-insensitive** — `Greg` and `greg` merge into a
  single row, keeping the first-seen casing. Prevents split statistics when
  operators capitalise inconsistently.
- **All-digit serial numbers are emitted as `="serial"`** — otherwise Excel
  converts long numeric serials to scientific notation (`1.11E+10`) and loses
  precision past 15 digits. The `="..."` form is also the standard CSV
  formula-injection mitigation.
- **Timestamps are human-readable** (`YYYY-MM-DD HH:mm:ss` UTC) rather than
  raw ISO strings.
- **Diagnostics are split into columns** — real-DLL records unpack into
  `Result Code` (the `wDetails` word), `Measurements` (the four bytes), and
  `Results File` (the `.dat` filename only — the folder is always
  `<userData>/results`, so the full path adds noise). Mock failures and other
  messages land in `Notes` unchanged. Everything still traces back to the
  source artefact in `docs/results-file-format.md`.
- Aggregation runs in `summariseTests()` over the result set already fetched
  for the detail section — one query, one aggregation pass.

## Diagnostic log (`.log`)

Written automatically on any unexpected IPC-layer failure (DLL error,
registration failure, crash). Not operator-triggered.

### Location

`<userData>/logs/diagnostic-<ISO timestamp>.log`

(`%APPDATA%\rg432-test-rig\logs\` on a standard install.) The path is shown
to the operator in the error banner so it can be sent to engineering.

### Format

Plain text:

```
RG432 Test Rig - Diagnostic Log
Timestamp: 2026-09-25T15:04:31.221Z
Context: run-test serial=RG432-001
Error: RunTest failed with return code 2 and error code 5

Stack:
<error stack trace, when available>

Platform: win32 x64
Electron/Node versions: {"electron":"35.7.5","node":"22.14.0",...}
```

### Design rationale

- **Timestamped filenames** — collisions impossible; ordering is chronological.
- **Context field** — the operation and serial number at failure time.
- **Environment block** — platform + runtime versions so Jeff can reproduce
  without asking the operator for details.
- **Single write point** — both `register-board` and `run-test` handlers funnel
  through `diagnostics.write()`, so no failure path is missed.
