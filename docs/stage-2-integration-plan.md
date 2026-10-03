# Stage-2 DLL Integration Plan

Ordered steps for integrating `RG432Test1.1.dll`, based on Jeff's
responses to `open-questions-jeff.md` and the verified `.dat` layout
(probe evidence: 276-byte file = 256B serial + 4 status bytes + 16B
float32 QA values).

Work in order — each step assumes the ones above it. Steps 1–9 are the
pipeline (backend); 10–13 are the operator-facing work; 14+ is the
evidence tail.

## Phase 1 — Native layer

### 1. Point the interop at the new DLL

- `src/native/real-dll.ts`: `DLL_FILE_NAME` → `RG432Test1.1.dll`
- `src/native/dll-interop.ts`: `isRealDllAvailable()` candidates → `RG432Test1.1.dll`
- Also update error strings that name the old file

### 2. Rewrite `parseResultsFile()` for the stage-2 layout

- Serial: first NUL-terminated ASCII field in the 256-byte prefix (unchanged logic)
- Status digits: 4 bytes at `len-20`..`len-16`, one nibble value per byte
- QA values: 4 × float32 LE in the last 16 bytes
- Return `{ serial, digits, qa }`

### 3. Status-word decoding

- Nibble table `0..F` → meanings (from the readme)
- Stage names (Jeff's answer 5): 1 Input data acquisition, 2 Output data
  generation, 3 Spectral tests, 4 Algorithm accuracy
- `testSummary` = first non-zero, non-F digit decoded with its stage name
  (e.g. "Test 2 (output data generation): no output generated"); `F`
  digits only ever follow a failure so they never decode first

### 4. Three-way result classification (Jeff's answer 2, verbatim)

- `wDetails === 0x0000` → **pass**
- **any** digit in `6`–`9` → **terminal fail** (move on — the board has
  failed outright; the remaining `F` digits are just skipped stages)
- **any other response** → **retryable fail** — "bad connexion",
  operator may retest (in practice the first failing digit is `1`–`5`;
  `A`–`E` are reserved and never produced)

`isPassing()` becomes `details === 0`; add `isRetryable()` for the UI.

### 5. Plumb `failurePercent` through `RunTest`

- `callRunTest(failurePercent)` instead of hardcoded `0`
- Value comes from settings (step 8); `DllInterop.runTest` signature gains
  a parameter or the interop reads it at construction — decide when
  writing step 8

## Phase 2 — Persistence & settings

### 6. Migration 004

`ALTER TABLE tests ADD COLUMN`: `status_details TEXT`, `test_summary
TEXT`, `qa1 REAL`, `qa2 REAL`, `qa3 REAL`, `qa4 REAL` — all nullable so
existing rows and mock-mode results stay valid.

### 7. Repository + types

- `TestResult` gains optional `statusDetails`, `testSummary`,
  `qa: number[]` (or `qa1..qa4`)
- `saveTest` writes the new columns; `getTests` reads them
- Update `schema.md` + migration table

### 8. `failurePercent` in settings

- `AppSettings.failurePercent` (default **20** — Jeff: "as low a value as
  possible that gives enough failures to show the data are being
  processed properly"; his guidance was 20–30% for ~100 records, 2–3%
  for ~1,000). Note Jeff also remarked the value "is used per test, not
  overall" — his readme documents the opposite (the DLL derives a
  per-test rate so the *overall* rate matches `byType`); we pass a single
  number either way so this doesn't change the implementation, but it
  explains why small values produce fewer failures than intuition suggests
- `SettingsStore` gains `setFailurePercent`; IPC handlers
  `get-failure-percent` / `set-failure-percent` mirroring mock mode
- Wire into `run-test` handler → `dllInterop.runTest(serial, percent)`

### 9. Diagnostics string

Keep `Details=0x…, file=…` but add `summary="…"` and `qa=[…]` so the CSV
columns can be parsed back out (same split the report already does for
measurements — measurements column is replaced by QA/status columns).

## Phase 3 — Renderer

### 10. New Board button

- Repository: `nextBoardSerial()` — scan `boards.serial_number` for
  `RG432-%` hex values, return `RG432-` + the **lowest unused** 4-digit
  hex. Jeff's example ("at count 123, prefer 124 not 456") asks for the
  smallest available value — lowest-free satisfies that in the common
  contiguous case; if he actually means "highest used + 1" the function
  is a one-line change. Serials not matching the pattern (seed data,
  manual entries) are ignored by the scan
- IPC `next-board-serial` → button in the Registration panel that fills
  the serial input with the generated value (operator can still overtype)

### 11. Button enable/disable flow (woven into existing panels)

Jeff's stated flow from `TestScheduleNotes.md`, adapted to our two-panel
layout (his answer 3: weave it in, it's part of registration):

1. Startup: only **New Board** is enabled (Register Board and Start Test
   disabled until a serial exists)
2. **New Board** fills the serial field with the generated `RG432-XXXX`
   — Register Board enables once the serial is valid and not already
   registered
3. After registration: Register Board and New Board disable, **Start
   Test** enables (registration always passes at this stage, per the
   notes)
4. During a run: everything locked, "Test in progress" shown (existing
   spinner covers this)
5. Result — **pass** or **terminal fail** (digit 6–9): everything
   disabled except New Board, to start the next board
6. Result — **retryable fail**: show "bad connexion" message, keep
   **Start Test** enabled for an immediate retest

Our existing extras (manual serial entry, re-registration confirm,
history, search, export) stay — they extend the flow, they don't
conflict with it.

### 12. Result badge upgrade

- Show the decoded `testSummary` under PASS/FAIL
- Retryable fails show a distinct "RETEST" style/message per Jeff's flow

### 13. History table

- Optional: show `testSummary` in the row tooltip or a column if it fits
  without crowding (decide in review — keep the 5-row preview behaviour)

## Phase 4 — Report & mock parity

### 14. CSV report

- Replace `Result Code`/`Measurements`/`Results File` columns with
  `Status Details`, `Test Summary`, `QA1–4`, `Results File`
- Update `docs/reports-and-logs.md` schema section

### 15. Mock parity (optional but recommended)

- Mock generates a status word in the same nibble format + four QA floats
  so the UI/DB/CSV exercise identical code paths in mock mode — otherwise
  the new columns only get tested against the real DLL

## Phase 5 — Tests, docs, close-out

### 16. Tests

- Parser fixture: real 276-byte `.dat` generated by the probe (0% and
  100% runs already exist in temp — copy one as a test fixture, or
  synthesize with `Buffer.alloc`)
- Decode table unit tests; classification tests (0000 / 6–9 / 1–5)
- Migration test → expect `[1,2,3,4]`; repository tests for new columns
- Settings test for `failurePercent`
- `nextBoardSerial` tests: empty DB → `RG432-0001`; gaps → lowest free

### 17. Documentation

- `docs/results-file-format.md` — rewrite layout + sequence diagram
- `docs/database/schema.md` + `design-notes.md` — new columns
- `docs/reports-and-logs.md` — new CSV columns
- `docs/requirements/wireframe.md` — New Board button + retry flow
- `docs/uat/uat-scripts.md` — update for retry behaviour + New Board
- `docs/testing-strategy.md` — state diagram gains the retryable state
- `docs/algorithms-and-data-structures.md` — nibble decode + lowest-free-slot
- `docs/open-questions-jeff.md` — mark all seven answered with Jeff's
  responses (paste his reply file into `docs/` as the record)

### 18. Cleanup & verify

- Delete `scripts/probe-dll.ts` (served its purpose) — or keep as an
  example of direct-DLL verification if you want it for the portfolio
- Full suite green: `npm run lint && npm run type-check && npm test`
- `npm run dev` smoke test: mock registration + test, then real-DLL path
  with `failurePercent` at 0 (clean pass) and 100 (decode a fail)

### 19. Commit & push

Two commits keeps the history readable:

1. `feat: integrate RG432Test1.1 stage-2 DLL (status word, QA values)`
   — steps 1–9, 16 (backend tests)
2. `feat: new board serial generation, retry flow, report columns`
   — steps 10–15, UI tests, docs

Or one squash-per-phase if you'd rather keep it granular.

## Suggested order over two days

- **Day 1:** steps 1–9 + 16 (backend: compiles, tests green against the
  real DLL)
- **Day 2:** steps 10–15 + 17–19 (UI, report, docs, push)
- **Buffer:** mock parity (15) and history column (13) are the first
  things to cut if time runs short — neither blocks the real pipeline
