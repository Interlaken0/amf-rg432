# Batch Report & Diagnostic Log Formats

Design schemas for the two export artefacts (Sprint 4 Day 1 DoD): the batch
report CSV and the failure diagnostic log. Implemented in
`src/main/report.ts` and `src/main/diagnostics.ts`.

## Batch report (CSV)

Triggered by **Export CSV** in the app → save dialog → written to the
operator-chosen path. Default filename `rg432-batch-report-<YYYY-MM-DD>.csv`.
RFC-4180-style quoting, CRLF line endings for Excel compatibility.

### Structure

The report is split into labelled sections: a run summary, a per-operator
breakdown, a dedicated failure list, then the full chronological log.

```csv
RG432 Test Rig - Batch Report
Generated,25/09/2026 15:02:08
Period,17/07/2026 to 25/09/2026

SUMMARY
Total Tests,10
Passed,9
Failed,1
Pass Rate,90.0%

OPERATOR BREAKDOWN
Operator,Tests,Passed,Failed,Pass Rate
Greg,10,9,1,90.0%

FAILED TESTS
ID,Serial Number,Operator,Tested At,Status,Result Code,Measurements,Results File,Notes
6,RG432-007,Greg,24/09/2026 09:15:31,fail,0x00ff,"9, 0, 3, 0",260924-091531-RG432-007.dat,

TEST RESULTS
ID,Serial Number,Operator,Tested At,Status,Result Code,Measurements,Results File,Notes
10,RG432-003,Greg,25/09/2026 14:40:24,pass,0x1234,"0, 0, 3, 0",260925-144024-RG432-003.dat,
```

### Conventions

- **Operator grouping is case-insensitive** — `Greg` and `greg` merge into a
  single row, keeping the first-seen casing. Prevents split statistics when
  operators capitalise inconsistently.
- **All-digit serial numbers are emitted as `SN-<digits>`** — Excel's CSV
  import still number-converts the `="serial"` formula trick on current
  builds (scientific notation, `12,345` separators, precision loss past 15
  digits). A non-numeric prefix is the only representation it cannot mangle.
  Alphanumeric serials like `RG432-001` are emitted unchanged.
- **Failures are pulled into their own section** — the part a supervisor
  reads first — while TEST RESULTS still lists every attempt newest-first,
  so a failed board followed by a passing retest stays visible in sequence.
  `None` is emitted when the period had no failures.
- **Detail rows are newest-first** and the header carries a `Period` line
  covering the earliest-to-latest test date.
- **Timestamps are human-readable UK format** (`DD/MM/YYYY HH:mm:ss`, UTC)
  rather than raw ISO strings.
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
