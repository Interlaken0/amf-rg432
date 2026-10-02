# Open Questions for Jeff — RG432Test1.1 Integration

Questions arising from the stage-2 DLL reference guide
(`RG432Test1.1_ReadMe.md`) and `TestScheduleNotes.md`. Ordered by what
blocks implementation first.

## 1. Failure percentage — what should the app send `RunTest`?

`byType` is now the overall failure probability (0–100). Should it be a
fixed value baked into the app, or a configurable setting? And what
number do you want for demos and UAT? (The Delphi harness takes it as an
input, which suggests configurable — but confirm.)

> You can add any value you wish; this is the whole point. The value will serve no purpose on the real tester, but wihtout it you can't demonstrate how it works nor test the database responses to a group of failed boards.
> 
> My thoughts, add as low a value as possible that gives enough failures to show that the data are being processed properly. For example, if you are ging to fill the database with 1,000 entries , then only 20 or 30 (i.e. 2% or 3%) are needed to show the handling of failures. On the other hand if you are only going to create a hundred entries, then 20% or £0% will be needed.

## 2. Retryable "bad connexion" fails — which digits exactly?

The notes say fails with digits `0`, `5` or `F` mean "bad connexion" and
keep Start Test enabled. But `0` means *pass*, and `1`/`2`/`3` are the
actual connexion faults (Board not connected / Connexion faulty / Board
not communicating). Should the retry set be **1, 2, 3, 5**? Or something
else?

> This was a tricky one to explain ... Best processed this way:
> 
>     First: If the response is 0000 it has passed.
> 
>     Secondly: If the response contains a 6, 7, 8, or 9 it must fail and move on.
> 
>     Thirdly: (any other response) a retest should be allowed.

## 3. GUI flow — match the harness exactly?

The notes describe a fuller workflow: New Board enabled at startup →
auto-generated serial → Register Board → Start Test → everything locked
during the run → retry allowed on connexion fails. Our app has its own
two-panel layout already. Should we rework it to match the harness flow,
or keep our layout and just add the New Board serial generation? And is
this expected this sprint or later?

> Not really importent; if it can be woven in to the two panels than do so (it's really part of the registration; though I expect it might be more complex. In which case this can be moved to a later sprint.

## 4. New Board serial format

Is the prefix always `RG432-` followed by four hex digits (e.g.
`RG432-01AF`)? Is the prefix fixed, is any range reserved, and does
"next free slot" just mean "not already in our database"?

> Yes, yes and yes but more accurately 'next free in our database' e.g. if we're at count 123 and 124 upwards are all free is then it is preferrable to choose 124 not say 456.

## 5. Do the four test stages have real names?

For the Test Summary column — "Test 2: no output generated" works, but
if the stages have proper names (continuity, output waveform, etc.) the
summaries will read better.

>  Not yet, but if you'd like some for now we could go with:
> 
> 1. Input data acquisition.
> 
> 2. Output data generation.
> 
> 3. Spectral tests.
> 
> 4. Algorithm accuracy.

## 6. Is DebugMessages needed on factory PCs?

Our app writes its own diagnostic logs, so we assume `DebugMessage.exe`
is a development tool only — confirm the DLL runs fine without it
installed.

> No, it is really for us to debug internal problems, not a user feature.

## 7. Cosmetic doc slip

The notes say the failure % is set by "the `byType` parameter in
Initialise" — it's actually `RunTest`'s parameter. No action needed;
just flagging that the readme is the correct version.

> Correct and well spotted. This means of course that you could make errors more or less likely yourself as the tests progress. The value is used per test, not overall.

---

## Verified independently (no question needed)

| Item                     | Status                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `.dat` file layout       | Verified by calling the DLL through Koffi directly and inspecting the output file                     |
| Function signatures      | Confirmed identical in `RG432TestExports.h` — Koffi bindings unchanged                                |
| Registry configuration   | Same key; the app already writes `szPath` itself via `ensureResultsPath`                              |
| Results-path buffer size | `MAX_PATH` (260) — same as stage-1, already handled                                                   |
| DLL filename             | `isRealDllAvailable()` checks for `RG432Test1.0.dll` — needs updating to `RG432Test1.1.dll`; our code |
| QA column types          | Four float columns — our schema design decision                                                       |
| Installer packaging      | `dll/` bundling already handled by electron-builder                                                   |
