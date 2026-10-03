# UAT Dry-Run Worksheet — pre-Jeff validation

Internal rehearsal of `uat-scripts.md` before the sign-off session. Purpose:
catch anything broken *before* Jeff sees it, and produce screenshot evidence
of each path working.

**Dry-run completed 3 October 2026 — all 12 scripts passed.** Screenshots
are in `docs/uat/evidence/`; UAT-06 is additionally proven by
`tests/mock-dll.test.ts` + `tests/diagnostics.test.ts` (8/8) and real log
files in `userData/logs/`; UAT-08's CSV was verified at byte level;
UAT-12's two real-DLL results were byte-verified against their `.dat`
files (`261003-161554`/`161626-RG432-001F.dat`).

## Environment prep (do first)

- [ ] `npm run dev` — launch the app (native rebuild on first launch is normal)
- [ ] Close `DebugMessage.exe` if open — it crashes the real-DLL path
- [ ] Mock mode **ON** for UAT-02–10 (toggle in header)
- [ ] `npm run seed` first if you want populated history for UAT-07/08/09
- [ ] Failure % = 20 (default) unless a test says otherwise
- [ ] Screenshot each expected result into `docs/uat/evidence/` (or your
      evidence bundle location)

## Script walkthrough — dry-run results

| # | What to do | Expected | Result | Evidence |
|---|-----------|----------|--------|----------|
| UAT-01 | Launch app | Header with mock toggle + theme button; registration panel; run-test panel; history table | **PASS** — dev launch + installed build (`AMF RG432 Test Rig Setup 0.0.3.exe`): desktop shortcut, launch, full UI, 131 persisted results | [dev app](evidence/uat01-app-window.png), [dev history](evidence/uat01-history.png), [installed shortcut](evidence/uat01-installed-shortcut.png), [installed app](evidence/uat01-installed-app.png), [installed history](evidence/uat01-installed-history.png) |
| UAT-02 | Serial `RG432-UAT01`, operator `Jeff` → Register Board | Green "registered and ready for testing" message | **PASS** | [shot](evidence/uat02-registered.png) |
| UAT-03 | Clear serial and/or operator | Register Board disabled; nothing saved | **PASS** | [empty serial](evidence/uat03-empty-serial.png), [empty operator](evidence/uat03-empty-operator.png) |
| UAT-04 | Start Test on `RG432-UAT01` | Spinner + lockout during run; badge with decoded summary; history row | **PASS** (`0x0000` PASS, Start Test locked) | [re-register prompt](evidence/uat04-reregister-prompt.png), [pass badge](evidence/uat04-pass-badge.png), [history](evidence/uat04-history-row.png) |
| UAT-05 | `RG432-NOPE` unregistered → Start Test | Clean error, no history row | **PASS** | [shot](evidence/uat05-unregistered-error.png) |
| UAT-06 | Diagnostic log on hardware fault | Log written under `userData/logs/`; aborted attempt saved as fail | **PASS** (unit-test proven + 13 real logs on disk) | `tests/mock-dll.test.ts`, `tests/diagnostics.test.ts` |
| UAT-07 | Restart app | History intact; 5-row preview + "View all" | **PASS** (128 results persisted) | [shot](evidence/uat07-history-persisted.png) |
| UAT-08 | Export CSV → open in Excel | All four sections; `retest` status; Notes guidance; UK filename | **PASS** (contents verified; `rg432-batch-report-03-10-2026-16-06.csv`) | [shot](evidence/uat08-export-saved.png) |
| UAT-09 | Search serial/`pass`/`fail`/`retest`/date | Matching rows only, across all records | **PASS** | [retest search](evidence/uat09-retest-search.png), [more](evidence/uat09-retest-search-2.png) |
| UAT-10 | Theme toggle → restart | Theme flips and persists | **PASS** | [light theme](evidence/uat10-light-theme.png), [after relaunch](evidence/uat10-relaunched-light.png) |
| UAT-11 | Click New Board | Serial field fills with lowest free slot; editable | **PASS** (`RG432-001E`, then `001F`) | [shot](evidence/uat11-new-board-fail.png) |
| UAT-12 | Mock off, Failure % = 100 → Start Test | Amber RETEST (1–5, retry allowed) or red FAIL (6–9, locked) | **PASS** — both branches on the real DLL: `0x2fff` retest (enabled) then `0x8fff` fail (locked); `.dat` files byte-verified | [retest](evidence/uat12-retest-real-dll.png), [fail](evidence/uat12-fail-real-dll.png) |

## Known-pass items (verified in code/tests today)

- UAT-03/05 boundary validation and clean IPC errors — `App.tsx` + tests
- UAT-06 abort-saves-fail + log path — `index.ts` run-test handler +
  `diagnostics.test.ts`; disconnect proof in `mock-dll.test.ts`
- UAT-08 report content — `report.test.ts` (10 cases incl. retest status,
  notes, UK timestamps)
- UAT-09 retest/date search — `history.test.ts`
- UAT-11 lowest-free serial — `test-repository.test.ts`
- UAT-12 retry gating — verified live today: `0x0004` → RETEST (enabled),
  `0x7fff` → FAIL (locked)

## For the Jeff session itself

- UAT-01: installer built (`npm run build` → `release\AMF RG432 Test Rig
  Setup 0.0.3.exe`) and verified installed on the dev PC with the existing
  database. Still outstanding: a machine with **no** existing `%APPDATA%`
  data to prove fresh-database creation. The real-DLL registry key is
  self-provisioned — `ensureResultsPath` in `src/native/real-dll.ts`
  writes `szPath` on the first real-DLL run, so no manual setup is needed
  on a clean PC
- Fill the Result column live during the session; Jeff signs the block at
  the bottom of `uat-scripts.md`
