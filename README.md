# AMF RG432 Automated Test Rig

A Windows desktop application (Electron + React + SQLite) for programming and
verifying RG432 audio conversion boards on the production line. Operators
register boards by serial number, run the hardware test through Jeff's
`RG432Test1.1.dll` via Koffi, and every result is persisted with operator,
timestamp, status word, QA values, and diagnostics — with searchable history,
CSV batch reporting, and automatic diagnostic logs on failure. A mock mode
simulates the full DLL contract for development and training without hardware.

## How a test works

1. **New Board** generates the next free `RG432-XXXX` serial (lowest free hex
   slot); the operator enters their name and registers the board.
2. **Start Test** drives the DLL sequence `InitialiseDevice` →
   `RunTest(failurePercent)` → `GetResult`, then parses the 276-byte `.dat`
   results file (serial, 4 status digits, 4 float32 QA values).
3. The four-digit status word produces a three-way outcome:
   - `0x0000` → **PASS** (green)
   - any `6`–`9` digit → **FAIL** (red, terminal — move to the next board)
   - anything else → **RETEST** (amber, connexion fault — Start Test stays
     enabled for an immediate retry)
4. Everything is disabled while a test runs; after a pass or terminal fail
   only **New Board** is available.

The **Failure %** field (0–100, persisted) feeds `RunTest`'s `byType` — a
demo/UAT dial for exercising the failure paths, per Jeff's update.

## Quick start

```powershell
npm ci          # install deps (postinstall rebuilds native modules for Electron)
npm run dev     # rebuild natives for Electron and launch the dev app
npm test        # rebuild natives for Node and run the test suite (51 tests)
npm run seed    # populate the database with demo boards and results
npm run build   # type-check, bundle, and produce the Windows installer
```

### Operational notes

- **Mock mode** toggle (header) switches between the real DLL and the
  simulator; the app also falls back to mock automatically when the DLL is
  absent. Mock results emit identical status words, QA values and fields.
- **Close `DebugMessage.exe` before running `npm test`** — the DLL's debug
  channel crashes a second native process. It's a Jeff-side dev tool and is
  not shipped in the installer.
- **Native modules**: `npm run dev` rebuilds `better-sqlite3`/`koffi` for
  Electron; `npm test` rebuilds for Node. Stop the dev app before testing —
  Windows locks the native files while it runs.
- Data lives in `%APPDATA%\rg432-test-rig\` — `rg432-test-rig.db`, `Results\`
  (.dat files) and `logs\` (diagnostic logs). The DLL's results path is
  written to `HKCU\SOFTWARE\LittleStone\432\TestSettings\szPath` on
  registration.
- `RG432_DLL_PATH` and `RG432_USERDATA` env vars override the DLL path and
  data directory (used by the test suite).

## Documentation

### Requirements

- [Project Initiation](PROJECT_INITIATION.md) — objectives, scope, stakeholder needs
- [Personas](docs/requirements/personas.md) — Dave, Sarah, Jeff
- [User Stories](docs/requirements/user-stories.md)
- [Use Cases](docs/requirements/use-cases.md)
- [Wireframe](docs/requirements/wireframe.md) — as-built UI with traceability

### Design & architecture

- [Database schema](docs/database/schema.md)
- [Database design notes](docs/database/design-notes.md) — ERD, normalisation, constraints, indexing
- [Results file (.dat) format](docs/results-file-format.md) — verified 276-byte layout, status-word semantics, end-to-end sequence
- [Batch report & diagnostic log formats](docs/reports-and-logs.md)
- [Testing strategy](docs/testing-strategy.md) — test types, coverage and evidence
- [Data protection assessment](docs/data-protection.md) — data inventory, GDPR basis, risks and open actions
- [Algorithms & data structures](docs/algorithms-and-data-structures.md) — status-word decode, lowest-free-slot allocation, binary parsing
- [Architecture decision records](docs/adr/) — 001–008 foundations; 009–011 cover the stage-2 decisions (derived verdicts, mock parity, results-file handling)

### Stage-2 (Jeff's New-UPDATE package)

- [Open questions for Jeff](docs/open-questions-jeff.md) — all seven answered
- [Jeff's verbatim responses](docs/open-questions-jeff-responses.md)
- [Stage-2 integration plan](docs/stage-2-integration-plan.md) — the ordered rollout that was executed

### Process

- [Agile SDLC Strategy](AGILE_SDLC_STRATEGY.md) — sprint plan, DoD, stage-2 update record, KSB evidence mapping
- [Sprint retrospectives](docs/retrospectives/)
- [UAT test scripts](docs/uat/uat-scripts.md) — UAT-01–12 Given/When/Then cases for sign-off
