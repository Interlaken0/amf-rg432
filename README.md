# AMF RG432 Automated Test Rig

A Windows desktop application (Electron + React + SQLite) for programming and
verifying RG432 audio conversion boards on the production line. Operators
register boards by serial number, run the hardware test through the RG432 DLL
via Koffi, and every result is persisted with operator, timestamp, and
diagnostics — with CSV batch reporting and automatic diagnostic logs on
failure. A mock mode simulates the DLL for development and training without
hardware.

## Quick start

```powershell
npm ci          # install deps (postinstall rebuilds native modules for Electron)
npm run dev     # rebuild natives for Electron and launch the dev app
npm test        # rebuild natives for Node and run the test suite
npm run seed    # populate the database with demo boards and results
npm run build   # type-check, bundle, and produce the Windows installer
```

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
- [Results file (.dat) format](docs/results-file-format.md) — DLL output layout and processing
- [Batch report & diagnostic log formats](docs/reports-and-logs.md)
- [Architecture decision records](docs/adr/) — framework, SQLite, Koffi, migrations, TypeScript, JSDoc, CI/CD, Tailwind

### Process

- [Agile SDLC Strategy](AGILE_SDLC_STRATEGY.md) — sprint plan, DoD, KSB evidence mapping
- [Sprint retrospectives](docs/retrospectives/)
- [UAT test scripts](docs/uat/uat-scripts.md) — Given/When/Then cases for sign-off
