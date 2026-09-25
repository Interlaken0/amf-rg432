# Sprint 3 Retrospective

**Dates:** 31 July – 13 August 2026 (completed 25 September 2026 during the fast-track recovery week; see the Fast-Track Recovery Plan in the strategy doc)  
**Sprint Goal:** Integrate the RG432 DLL through Koffi, parse the `.dat` results file, and link parsed output into SQLite test history.

## What went well

**The `DllInterop` abstraction paid for itself.** Koffi bindings, the mock, and persisted settings all sit behind one interface, so the renderer and IPC layer never changed while the real-DLL implementation was hardened underneath. Swapping mock ↔ real is a settings toggle.

**The `.dat` parser is small, documented, and testable.** `readMeasurementBytes()` + `isPassing()` in `real-dll.ts` encode the stage-1 format (four measurement bytes 0–6, then the serial) in ~30 lines with a clear note on what changes when the final DLL lands. `docs/results-file-format.md` records the full pipeline.

**The real DLL path is now genuinely tested.** Making the Electron dependency in `real-dll.ts` lazy (with `process.cwd()`/`RG432_*` env fallbacks) let a gated integration test load the stage-1 DLL through Koffi on Windows and run the full register → test → persist cycle against real hardware calls — skipped automatically in CI where the DLL isn't checked out.

**Batch reports + diagnostics came in early.** Sprint 4 scope (CSV export with aggregated SQL, timestamped failure logs) was pulled forward because it shared the same modules — flagged here honestly rather than silently absorbed.

## What slowed us down

**`electron` import blocked testing.** The initial `import { app } from 'electron'` made `real-dll.ts` unloadable under vitest. Fixed by resolving `app` lazily — a reminder that environment-bound imports should sit behind an indirection so core logic stays testable.

**CI commitlint vs squash merges.** GitHub's `Title (#N)` squash-merge messages aren't conventional commits, so `main` went red after PR #2 until `commitlint.config.js` was taught to ignore merge and release-bot commits. Cost a CI cycle and a fix commit.

**Stage-1 semantics are placeholders.** `wDetails` is always `0x1234` and pass/fail is derived from the documented byte range, not real result codes — correct for today, but the interpretation must be confirmed against Jeff's final DLL documentation.

## Sprint review notes

- Demo to Jeff ran on the stage-1 DLL in real mode: board registration, test run with live progress, pass/fail from `.dat` bytes, history, batch CSV export, and a simulated failure showing the diagnostics log path.
- UAT scripts (`docs/uat/uat-scripts.md`) delivered for Jeff's sign-off pass; installer verified locally (`AMF RG432 Test Rig Setup 0.0.1.exe`, 84 MB, DLL bundled in `resources/dll/`).
- Open item for Jeff: confirm the final DLL's export signatures, `wDetails` codes, and `.dat` layout so `isPassing()` can be updated if semantics changed.

## Action items for Sprint 4

- Swap in the final DLL when delivered; update `isPassing()`/`readMeasurementBytes()` if `wDetails` codes or file layout differ.
- Physical hardware validation — board + harness on the bench, run UAT-01 through UAT-08.
- Code-signing certificate decision (deferred from Sprint 4 planning).
- Final evidence packaging: link sprint PRs, CI runs, and UAT sign-off for the portfolio.
