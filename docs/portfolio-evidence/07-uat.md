# Evidence — User Acceptance Testing

A complete dry-run of all 12 UAT scripts, executed and captured before
the stakeholder session.

## Worksheet

Full results table with per-test evidence links:
[`../uat/uat-dry-run.md`](../uat/uat-dry-run.md)

## Result summary

| Test | Result | Key evidence |
|---|---|---|
| UAT-01 launch | Pass | `uat01-*.png` — dev launch **and** installed build |
| UAT-02 registration | Pass | `uat02-registered.png` — green confirmation |
| UAT-03 validation | Pass | `uat03-*.png` — button disabled on empty fields |
| UAT-04 test run | Pass | `uat04-*.png` — spinner, lockout, PASS badge, `0x0000` |
| UAT-05 unregistered board | Pass | `uat05-unregistered-error.png` — clean error |
| UAT-06 diagnostic log | Pass | 13 logs on disk + `tests-52-passing.png` suite |
| UAT-07 persistence | Pass | `uat07-history-persisted.png` — 128 rows after restart |
| UAT-08 CSV export | Pass | `uat08-export-saved.png` — sections verified in file |
| UAT-09 search | Pass | `uat09-*.png` — `retest` search filters correctly |
| UAT-10 theme | Pass | `uat10-*.png` — persists across restart |
| UAT-11 New Board | Pass | `uat11-new-board-fail.png` — lowest free serial generated |
| UAT-12 real DLL fail | Pass | `uat12-*.png` — `0x2fff` retest → `0x8fff` fail, `.dat` byte-verified |

## Where the screenshots live

All 21 evidence files are in [`../uat/evidence/`](../uat/evidence/)
with descriptive names (`uatNN-description.png`), committed to the
repository.

## What this demonstrates

- UAT executed as a scripted process, not ad-hoc clicking
- Evidence captured per test before stakeholder sign-off
- Both mock-mode and real-DLL paths exercised and screenshotted
- The dry-run catches environment issues before the stakeholder's time
  is spent
