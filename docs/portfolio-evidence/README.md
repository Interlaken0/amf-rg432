# Portfolio Evidence — RG432 Test Rig

Screenshot set and per-section write-ups for the project portfolio.
Each section file contains the screenshot(s) to use plus a caption
explaining what the evidence demonstrates.

## Sections

| File | Topic | Screenshots |
|---|---|---|
| [01-code-implementation.md](01-code-implementation.md) | Core algorithms and DLL integration | `code-status-rule.png`, `code-dat-parser.png`, `code-next-board-serial.png` |
| [02-database.md](02-database.md) | SQLite schema, migrations, live data | `db-live-rows.png` (+ `docs/uat/evidence/`) |
| [03-testing.md](03-testing.md) | Automated test suite and security testing | `tests-52-passing.png`, `test-injection.png` |
| [04-dll-results-verification.md](04-dll-results-verification.md) | Byte-level `.dat` verification | `dat-hex-8fff.png` (+ UAT-12 badges in `docs/uat/evidence/`) |
| [05-diagnostics-logging.md](05-diagnostics-logging.md) | Fault diagnostic logging | `diagnostics-log.png` |
| [06-process-ci-releases.md](06-process-ci-releases.md) | PRs, CI/CD, releases, authorship | `process-pr6.png`, `process-actions-green.png`, `process-releases.png`, `process-release-notes.png`, `process-release-assets.png`, `process-commits.png` |
| [07-uat.md](07-uat.md) | UAT dry-run — all 12 scripts | `docs/uat/evidence/` (21 screenshots, already labelled) |

## Note on UAT screenshots

The 21 UAT dry-run screenshots live in [`../uat/evidence/`](../uat/evidence/)
with descriptive filenames (`uat01-*` … `uat12-*`) — they are already
committed, labelled, and linked from the dry-run worksheet, so they are
not duplicated here.
