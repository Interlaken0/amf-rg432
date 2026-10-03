# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.0.5](https://github.com/Interlaken0/amf-rg432/compare/v0.0.4...v0.0.5) (2026-10-03) - Sprint 4, week 2

### Features
- Real `RG432Test1.1.dll` integration via Koffi: `InitialiseDevice`, `RunTest`, `GetResult` with 276-byte `.dat` results parsing and QA values
- Three-way verdicts per stakeholder rule: `0x0000` PASS, digits 6–9 terminal FAIL (Start Test locked), other non-zero amber RETEST (retry enabled)
- New Board lowest-free `RG432-XXXX` serial allocation
- Configurable Failure % setting passed to `RunTest`
- Mock parity with the stage-2 DLL contract, with auto-fallback when the DLL is absent
- Clean plain-English IPC error messages; terminal-failure lockout
- Data-protection assessment and injection-resistance test

### Bug Fixes
- Preload ESM/CJS race on app launch
- Registry results path restored after real-DLL integration tests
- Report: local UK timestamps, derived `retest` status in CSV, notes column, search-filtered export
- Shared `displayStatus` derivation replaces duplicated status logic

### Documentation
- ADRs 009–011 (derived verdicts, mock parity, results-file storage)
- UAT dry-run: all 12 scripts passed with screenshot evidence (`docs/uat/`)
- Corrected schema, reports, testing-strategy, algorithms, and stakeholder-question docs
- Plain-English mock-mode guide

## [0.0.4](https://github.com/Interlaken0/amf-rg432/compare/v0.0.3...v0.0.4) (2026-09-25) - Sprint 4, week 1

### Features
- Shared serial-number validation (`src/shared/validation.ts`) with dedicated tests
- Theme styling and UI refinements

### Chore
- Preload and type-contract cleanup; expanded repository and report tests

## [0.0.3](https://github.com/Interlaken0/amf-rg432/compare/v0.0.2...v0.0.3) (2026-09-25) - Sprint 3, week 2

### Features
- Real `.dat` results-file parsing (status digits + QA float32 values)
- Live real-DLL integration test suite

### Documentation
- `docs/results-file-format.md`; Sprint-3 retrospective

## [0.0.2](https://github.com/Interlaken0/amf-rg432/compare/v0.0.1...v0.0.2) (2026-09-25) - Sprint 2 + Sprint 3, week 1

### Features
- SQLite persistence: `boards`/`tests` tables, migration runner, indexed queries, repository layer
- Batch CSV report: summary, operator breakdown, failed-tests and full-results sections
- Diagnostic log writer for unexpected failures
- Persisted app settings

### Documentation
- UAT scripts drafted (`docs/uat/uat-scripts.md`)

### Tests
- Expanded suite: database, migrations, repository, settings, integration, report

## 0.0.1 (2026-07-17) - Sprint 1

### Features
- Initial Electron scaffold with tooling, CI/CD, and mock DLL
- Integrate RG432Test1.0.dll via Koffi and fix dev server startup
- Add personas, user stories, use cases, and link them from README
- Add Given/When/Then acceptance criteria to user stories

### Bug Fixes
- Disable electron-builder auto-publishing in CI

### Documentation
- Add personas, user stories, use cases, and link them from README
- Add Given/When/Then acceptance criteria to user stories

### Chore
- Add test DLL and deliverables for RG432 integration
- Add gitignore to exclude project planning documents

### CI
- Run pipeline on sprint branches
- Fetch full history in checkout so commitlint can compare HEAD~1..HEAD
- Add automatic changelog and version update on main branch pushes
