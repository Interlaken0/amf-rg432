# Data Protection Assessment

A lightweight DPIA-style record for the RG432 test rig (supports K8). The
tool stores a small amount of personal data on a single factory PC — this
document inventories it, records the risks and mitigations, and tracks the
open decisions.

## What personal data is stored

| Data | Sensitivity | Where | Why it's needed |
|------|-------------|-------|-----------------|
| Operator name | Personal data (GDPR) | `boards.operator`, `tests.operator`, CSV exports | Traceability — every test must attribute who ran it |
| Board serial numbers | Commercial, not personal | `boards.serial_number`, `.dat` files, CSV exports | Product traceability |
| Test timestamps / outcomes | Commercial | `tests` table, `.dat` files, CSV exports, diagnostic logs | Quality records and audit |

That is the entire personal-data footprint — a single free-text name field.
No emails, IDs, or other identifiers are collected (data minimisation).

## Where it lives

- `%APPDATA%\rg432-test-rig\rg432-test-rig.db` (SQLite) — OS-standard
  per-user application directory on the test-rig PC
- `%APPDATA%\rg432-test-rig\Results\*.dat` — binary results files
- `%APPDATA%\rg432-test-rig\logs\*.log` — diagnostic logs (serial numbers
  and error context, no operator names)
- Operator-chosen CSV export location — Sarah's reporting path; the only
  route by which operator names leave the machine

Nothing is transmitted off the PC — the app has no network surface.

## Lawful basis

Legitimate interest: operator names are recorded for manufacturing
traceability and quality-audit purposes — a standard factory record-keeping
requirement. Employees are identifiable only by the first name they type.

## Access path

The Electron main process is the only code path to the database file. The
renderer reaches data exclusively through the allowlisted IPC bridge
(`contextIsolation` + `sandbox` on), so there is no direct filesystem or
SQL access from UI code. On the OS side, `%APPDATA%` is scoped to the
logged-in Windows account's ACL.

## Risk register

| Risk | Likelihood | Impact | Mitigation / status |
|------|------------|--------|---------------------|
| Operator name readable in plaintext DB on the PC | Medium | Low | User-scoped `%APPDATA%` ACL; single-operator tool; names are first names only |
| Shared factory PC exposes another user's records | Low (today) | Medium | Deferred — if deployment moves to a shared account, revisit with OS-level separation or operator logins; recorded in ADR 002 |
| SQL injection corrupts the store | Low | High | All queries parameterised; proven by `test-repository.test.ts` hostile-input case |
| Malicious/renderer-side access to DB | Low | High | Sandboxed renderer + allowlisted IPC; no direct file access |
| Indefinite retention of operator names | Medium | Low | **Open** — retention period is Jeff's decision; CSV export provides the archive route once agreed |
| `.dat` files accumulate unbounded on disk | Medium | Low | Filename-timestamped, small (276 B); periodic housekeeping covers it |

## Open actions

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Agree a retention period for test records and operator names | Jeff | Open — raised in `docs/open-questions-jeff.md` question 8 |
| 2 | Revisit access control if the app moves to a shared factory PC | Greg | Deferred — see ADR 002 |

## Review

This assessment should be revisited if the deployment model changes
(shared PC, network storage, or additional personal data collected).
