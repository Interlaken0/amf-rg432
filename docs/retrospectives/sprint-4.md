# Sprint 4 Retrospective

**Dates:** 25 September – 3 October 2026 (planned 25 Sep – 1 Oct; completed 3 Oct with the stage-2 scope Jeff delivered mid-sprint)  
**Sprint Goal:** Complete the stage-2 upgrade to `RG432Test1.1.dll` — live DLL calls, status-word verdicts, New Board flow, failure-% control — and take the application to a UAT-ready, installed state.

## What went well

**One verdict rule, one place.** Jeff's three-way classification (`0x0000` pass, digits 6–9 terminal fail, anything else retryable) lives in `src/shared/status.ts`, and `displayStatus` in `src/shared/history.ts` is the single derivation consumed by the result badge, history pills, search, and CSV export. Catching and removing the duplicated `statusCell` logic in `report.ts` was the moment the codebase stopped being able to disagree with itself — a retryable fault can no longer show as RETEST on screen but `fail` in a report.

**Real-DLL verification was byte-level, not vibes.** The integration suite runs the actual DLL end-to-end — register → test → `.dat` on disk → parse → persist — including 100% fault injection. During the UAT dry-run, the `0x2fff` RETEST and `0x8fff` FAIL badges were confirmed against the literal bytes in the written `.dat` files. What the operator sees is provably what the DLL produced.

**The dry-run caught nothing — which is the point.** All 12 UAT scripts were executed and screenshotted before the stakeholder session (`docs/uat/evidence/`). Doing it in mock first and finishing UAT-12 on the real DLL mirrors exactly how the session with Jeff will run, and it surfaced no surprises. Confidence in the sign-off session comes from evidence, not hope.

**Release plumbing works end-to-end.** `npm run build` produced a working NSIS installer that was installed, launched, and verified outside dev mode. The CI release job versions and tags on every `main` push, and the manual Release workflow built and published a versioned installer to GitHub Releases — `releases/latest` now serves `Setup 0.0.7.exe` permanently.

**Errors speak operator.** The IPC boundary strips the Electron noise — an operator reads "Board RG432-001F has not been registered", never `Error invoking remote method`. Aborted runs still write a diagnostic log and record the attempt, so fault traceability survives hardware disconnects.

## What slowed us down

**The preload ESM/CJS race.** The most painful bug of the sprint: the preload bundle could load in either module format depending on timing, breaking the IPC bridge intermittently at launch. Fixed by shipping both formats and gating on availability — a reminder that build-pipeline assumptions deserve explicit tests, not luck.

**Real-DLL tests polluted the registry.** `ensureResultsPath` writes `szPath` for the DLL — necessary at runtime, but tests that ran it left the machine's registry changed. Now restored after each integration run. Environment mutation in tests needs the same discipline as the code under test.

**DebugMessages.exe interference.** Jeff's debug tool holds the DLL's channel; forgetting it was running cost one confusing session of failures. It's now an explicit pre-flight check in the UAT notes.

**The changelog generator only half-automates.** `commit-and-tag-version` built version headers but empty bodies, because squash-merge titles (`Sprint 4 week 2 (#6)`) aren't conventional commits. The backfill was hand-written — worthwhile, but conventional PR titles would have generated it for free.

## Sprint review notes

- Milestone report, installation notes, and the installer delivered to Jeff (email + WhatsApp); UAT session requested.
- Dry-run evidence published on GitHub for Jeff to review before the session.
- Installer now distributed via GitHub Releases rather than ad-hoc file transfer.
- Outstanding stakeholder items: UAT sign-off session, data-retention policy (open question 8), code-signing certificate, physical hardware validation.

## Action items for next sprint / project close-out

- **Jeff's UAT session** — walk UAT-01–12 on the installed app, record results live, obtain signed acceptance.
- Record Jeff's retention answer in `open-questions-jeff-responses.md` and update `docs/data-protection.md`.
- Wire a signing certificate into `electron-builder.json5` if AMF supplies one; otherwise document the approved unsigned deployment.
- Physical board validation if a rig is offered; otherwise confirm DLL-level sign-off suffices.
- Deferred technical debt (documented, optional): real `results_file` column per ADR-011's upgrade path; per-instance mock state; stage-2-aware seed data.
