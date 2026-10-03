# Batch Report & Diagnostic Log Formats

Design schemas for the two export artefacts (Sprint 4 Day 1 DoD): the batch
report CSV and the failure diagnostic log. Implemented in
`src/main/report.ts` and `src/main/diagnostics.ts`.

## Batch report (CSV)

Triggered by **Export CSV** in the app → save dialog → written to the
operator-chosen path. Default filename
`rg432-batch-report-<DD-MM-YYYY-HH-MM>.csv` (UK local date and time). The
export follows the Test History search box: a blank search exports every
record, a search term exports only the matching rows — the CSV always
mirrors what the history table is showing.
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
ID,Serial Number,Operator,Tested At,Status,Status Details,Test Summary,QA1,QA2,QA3,QA4,Results File,Notes
6,RG432-0007,Greg,24/09/2026 09:15:31,retest,0x2fff,Test 1 (input data acquisition): connexion faulty,-0.4616,0.5784,0.4317,1.151,260924-091531-RG432-0007.dat,Bad connexion - check the board and retest

TEST RESULTS
ID,Serial Number,Operator,Tested At,Status,Status Details,Test Summary,QA1,QA2,QA3,QA4,Results File,Notes
10,RG432-0003,Greg,25/09/2026 14:40:24,pass,0x0000,All four tests passed,-0.0224,0.5546,-0.2907,0.075,260925-144024-RG432-0003.dat,Passed all four tests
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
- **Timestamps are human-readable UK format** (`DD/MM/YYYY HH:mm:ss`,
  local time) rather than raw ISO strings.
- **Status uses the displayed verdict** — a retryable failure exports as
  `retest` (derived from the status word via `displayStatus`), so the CSV
  matches the on-screen badge rather than the raw stored `fail`.
- **Stage-2 results land in dedicated columns** — `Status Details` (the
  raw `wDetails` word, e.g. `0x2fff`), `Test Summary` (the decoded first
  failure with its stage name), `QA1`–`QA4` (the four float32 QA values,
  rounded to four decimals), and `Results File` (the `.dat` filename
  only — the folder is always `<userData>/Results`, so the full path
  adds noise). These come straight from the `tests` table columns added
  in migration 004, not from re-parsing the diagnostics string. Mock
  results populate the same columns, so a mock-mode CSV looks identical.
- **Notes gives the operator's next step** for stage-2 rows: `Passed all
  four tests`, `Bad connexion - check the board and retest`, or `Failed
  outright - start a new board`. Mock and legacy stage-1 rows keep their
  raw free text (aborted-test messages, mock diagnostics, or the raw
  `Details=` line) instead. Everything still traces back to the source
  artefact in `docs/results-file-format.md`.
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
