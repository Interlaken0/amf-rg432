# Evidence — Diagnostics & Logging

Automatic diagnostic capture when a test faults unexpectedly.

## Screenshot

### `diagnostics-log.png` — a real diagnostic log file

`diagnostic-2026-09-26T04-33-42.log` opened in Notepad, showing the
structured format:

- **Timestamp** — ISO-8601
- **Context** — `run-test serial=asa` (what was happening when it fired)
- **Error** — `Simulated hardware fault: USB device disconnected mid-test`
- **Stack** — full call chain through the run-test handler
- **Platform / versions** — OS arch plus Electron/Node component
  versions for reproduction

**Caption:** A diagnostic log written automatically when a test aborts
mid-run. The operator sees a clean error message; the log preserves
timestamp, context, stack, and platform details for engineering
investigation.

## Supporting behaviour

- Aborted attempts are still recorded in history (traceability, not
  silent loss)
- Logs live under `%APPDATA%\rg432-test-rig\logs\`, timestamped per
  fault — 13 real logs were on disk during the dry-run
- Operator-facing errors stay plain-English; the technical detail goes
  to the log, not the user

## What this demonstrates

- Fault handling designed for a production environment
- Separation of operator messaging vs engineering diagnostics
- Observability: faults are reproducible from log contents alone
