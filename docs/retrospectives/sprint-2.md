# Sprint 2 Retrospective

**Dates:** 17 July – 30 July 2026 (completed 25 September 2026 after a pause due to illness; see the Fast-Track Recovery Plan in the strategy doc)  
**Sprint Goal:** Build the SQLite persistence layer and a mock mode that simulates hardware and DLL responses so development can continue without physical hardware.

## What went well

The migration runner came out clean - SQL files are applied in order on startup and recorded in a `migrations` table, so schema changes stay auditable. The repository layer (`test-repository.ts`) keeps all queries parameterised, which satisfies the security checklist and made the persistence code easy to unit test against in-memory SQLite.

The `DllInterop` abstraction worked exactly as intended - the real DLL and the mock sit behind the same interface, so adding the mock mode toggle was just swapping which implementation gets constructed. The settings are persisted to a JSON file in `userData`, so the toggle survives restarts.

The seed script reuses the real repository functions rather than duplicating SQL, which means seeded data exercises the same code path as the app itself. It produces a deterministic data set (10 boards, ~22 test results) for development and UAT.

Mock timing and hardware state simulation were added so the mock now behaves like the real DLL - a ~3s programming delay on registration, four ~1s test stages, and a small chance of a simulated USB disconnect. This let us actually exercise the progress indicator and error handling in the UI.

## What slowed us down

**Illness mid-sprint** - development paused during August and the sprint was completed during the fast-track recovery week rather than on the original dates. The sprint structure and commit history still show what was done when.

**Native module rebuild state** - `better-sqlite3` and `koffi` need different builds for Electron (dev) vs Node (tests), so `npm test` rebuilds for Node and `npm run dev`/postinstall rebuilds for Electron. Forgetting which state the modules are in causes confusing `NODE_MODULE_VERSION` errors.

**Stage-1 DLL placeholder semantics** - the demo DLL always returns success and a fixed `wDetails` of `0x1234`, so pass/fail interpretation had to be designed from the documented byte format rather than real result codes. Documented inline so it can be updated when the final DLL arrives.

**Working tree hygiene** - a large amount of uncommitted work had accumulated (JSDoc pass, tests, CI release job, rebrand). Splitting it into logical commits took time and is a reminder to commit little and often.

## What to improve next sprint

**Keep the rebuild dance visible** - note which native-module build state is active when switching between `npm test` and `npm run dev`.

**Document result-code assumptions early** - when integrating against placeholder hardware responses, write down the assumed semantics and where they live so swapping in the final DLL is mechanical.

**Commit smaller** - avoid letting a working tree accumulate weeks of unrelated changes; it makes reviews and traceability harder.

## Action items for Sprint 3

- Validate the interop layer against Jeff's final DLL as soon as it's delivered; update `isPassing` in `real-dll.ts` to the documented result codes.
- Keep mock behaviour in parity with the real DLL as its semantics firm up.
- Carry the deferred Sprint 1 polish (validation, progress, error surfacing - now done) forward as "done properly first time" evidence.
