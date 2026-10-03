# Open Questions for Jeff — RG432Test1.1 Integration

**Status: questions 1–7 answered by Jeff** — his verbatim responses are
recorded in [`open-questions-jeff-responses.md`](open-questions-jeff-responses.md)
alongside this file. Answers are summarised under each question below.
Question 8 is a later data-protection follow-up and is still open.

Questions arising from the stage-2 DLL reference guide
(`RG432Test1.1_ReadMe.md`) and `TestScheduleNotes.md`. Ordered by what
blocks implementation first.

## 1. Failure percentage — what should the app send `RunTest`?

`byType` is now the overall failure probability (0–100). Should it be a
fixed value baked into the app, or a configurable setting? And what
number do you want for demos and UAT? (The Delphi harness takes it as an
input, which suggests configurable — but confirm.)

**Answered:** any value — it's a simulator dial to demonstrate failure
processing. Jeff suggested ~20–30% for a ~100-record dataset, 2–3% for
larger ones. Implemented as a configurable `failurePercent` setting,
default **20**.

## 2. Retryable "bad connexion" fails — which digits exactly?

The notes say fails with digits `0`, `5` or `F` mean "bad connexion" and
keep Start Test enabled. But `0` means *pass*, and `1`/`2`/`3` are the
actual connexion faults (Board not connected / Connexion faulty / Board
not communicating). Should the retry set be **1, 2, 3, 5**? Or something
else?

**Answered:** Jeff supplied a cleaner three-way rule that supersedes the
digit list — `0x0000` is a pass; a response containing any digit `6`–`9`
is a terminal fail (move to the next board); **any other** non-zero
response is retryable. Implemented in `src/shared/status.ts` as
`isPassing`/`isRetryable`, and the UI shows an amber RETEST badge.

## 3. GUI flow — match the harness exactly?

The notes describe a fuller workflow: New Board enabled at startup →
auto-generated serial → Register Board → Start Test → everything locked
during the run → retry allowed on connexion fails. Our app has its own
two-panel layout already. Should we rework it to match the harness flow,
or keep our layout and just add the New Board serial generation? And is
this expected this sprint or later?

**Answered:** matching the harness exactly is not important — weave the
New Board flow into the existing two-panel layout, deferring anything
complex to a later sprint. Implemented: New Board sits in the
Registration panel and the lock-during-run + retry-enable flow follows
Jeff's notes.

## 4. New Board serial format

Is the prefix always `RG432-` followed by four hex digits (e.g.
`RG432-01AF`)? Is the prefix fixed, is any range reserved, and does
"next free slot" just mean "not already in our database"?

**Answered:** yes to all — `RG432-` + four hex digits, no reserved
range, and "next free" means the *lowest* unused value ("if at 123 pick
124 not 456"). Implemented as `nextBoardSerial()` in the repository —
lowest free slot against the `RG432-[0-9A-F]{4}` pattern.

## 5. Do the four test stages have real names?

For the Test Summary column — "Test 2: no output generated" works, but
if the stages have proper names (continuity, output waveform, etc.) the
summaries will read better.

**Answered:** temporary names supplied — 1. Input data acquisition,
2. Output data generation, 3. Spectral tests, 4. Algorithm accuracy.
Live in `STAGE_NAMES` in `src/shared/status.ts`; a rename is a
one-line change when Jeff finalises them.

## 6. Is DebugMessages needed on factory PCs?

Our app writes its own diagnostic logs, so we assume `DebugMessage.exe`
is a development tool only — confirm the DLL runs fine without it
installed.

**Answered:** confirmed — developer diagnostic viewer only, not required
on factory PCs. Not shipped in the installer.

## 7. Cosmetic doc slip

The notes say the failure % is set by "the `byType` parameter in
Initialise" — it's actually `RunTest`'s parameter. No action needed;
just flagging that the readme is the correct version.

**Answered:** acknowledged — Jeff confirmed the readme is correct and
the rate is passed to `RunTest`.

## 8. Data retention — how long do we keep operator names and test records? (follow-up, open)

The database stores operator names (personal data — GDPR applies) and test
records indefinitely today. The batch report gives us an export/archive
route. What retention do you want — e.g. keep everything on the rig PC
indefinitely, archive via CSV monthly, or purge after a set period? This
decision feeds `docs/data-protection.md` and, if you want it enforced in
software, a small retention setting.

**Status:** open — awaiting Jeff's answer.

---

## Verified independently (no question needed)

| Item | Status |
|---|---|
| `.dat` file layout | Verified by calling the DLL through Koffi directly and inspecting the output file |
| Function signatures | Confirmed identical in `RG432TestExports.h` — Koffi bindings unchanged |
| Registry configuration | Same key; the app already writes `szPath` itself via `ensureResultsPath` |
| Results-path buffer size | `MAX_PATH` (260) — same as stage-1, already handled |
| DLL filename | Done — `isRealDllAvailable()` and `resolveDllPath()` now use `RG432Test1.1.dll` |
| QA column types | Four float columns — our schema design decision |
| Installer packaging | `dll/` bundling already handled by electron-builder |
