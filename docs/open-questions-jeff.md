# Open Questions for Jeff — RG432Test1.1 Integration

Questions arising from the stage-2 DLL reference guide
(`RG432Test1.1_ReadMe.md`) and `TestScheduleNotes.md`. Ordered by what
blocks implementation first.

## 1. Failure percentage — what should the app send `RunTest`?

`byType` is now the overall failure probability (0–100). Should it be a
fixed value baked into the app, or a configurable setting? And what
number do you want for demos and UAT? (The Delphi harness takes it as an
input, which suggests configurable — but confirm.)

## 2. Retryable "bad connexion" fails — which digits exactly?

The notes say fails with digits `0`, `5` or `F` mean "bad connexion" and
keep Start Test enabled. But `0` means *pass*, and `1`/`2`/`3` are the
actual connexion faults (Board not connected / Connexion faulty / Board
not communicating). Should the retry set be **1, 2, 3, 5**? Or something
else?

## 3. GUI flow — match the harness exactly?

The notes describe a fuller workflow: New Board enabled at startup →
auto-generated serial → Register Board → Start Test → everything locked
during the run → retry allowed on connexion fails. Our app has its own
two-panel layout already. Should we rework it to match the harness flow,
or keep our layout and just add the New Board serial generation? And is
this expected this sprint or later?

## 4. New Board serial format

Is the prefix always `RG432-` followed by four hex digits (e.g.
`RG432-01AF`)? Is the prefix fixed, is any range reserved, and does
"next free slot" just mean "not already in our database"?

## 5. Do the four test stages have real names?

For the Test Summary column — "Test 2: no output generated" works, but
if the stages have proper names (continuity, output waveform, etc.) the
summaries will read better.

## 6. Is DebugMessages needed on factory PCs?

Our app writes its own diagnostic logs, so we assume `DebugMessage.exe`
is a development tool only — confirm the DLL runs fine without it
installed.

## 7. Cosmetic doc slip

The notes say the failure % is set by "the `byType` parameter in
Initialise" — it's actually `RunTest`'s parameter. No action needed;
just flagging that the readme is the correct version.

---

## Verified independently (no question needed)

| Item | Status |
|---|---|
| `.dat` file layout | Verified by calling the DLL through Koffi directly and inspecting the output file |
| Function signatures | Confirmed identical in `RG432TestExports.h` — Koffi bindings unchanged |
| Registry configuration | Same key; the app already writes `szPath` itself via `ensureResultsPath` |
| Results-path buffer size | `MAX_PATH` (260) — same as stage-1, already handled |
| DLL filename | `isRealDllAvailable()` checks for `RG432Test1.0.dll` — needs updating to `RG432Test1.1.dll`; our code |
| QA column types | Four float columns — our schema design decision |
| Installer packaging | `dll/` bundling already handled by electron-builder |
