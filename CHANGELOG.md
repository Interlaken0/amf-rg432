# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.0.12](https://github.com/Interlaken0/amf-rg432/compare/v0.0.11...v0.0.12) (2026-10-06)


### Documentation

* add consolidated functional and non-functional requirements ([f020870](https://github.com/Interlaken0/amf-rg432/commits/f020870fa747b62324bbe3b5a75ce41fbd60d1f5))

## [0.0.11](https://github.com/Interlaken0/amf-rg432/compare/v0.0.10...v0.0.11) (2026-10-06)


### Documentation

* record UAT sign-off and add workflow diagram ([07961a7](https://github.com/Interlaken0/amf-rg432/commits/07961a737e37e522c52bd4131b4914a6e8b02bf4))

## [0.0.10](https://github.com/Interlaken0/amf-rg432/compare/v0.0.9...v0.0.10) (2026-10-04)


### Documentation

* update test count in readme to 52 ([e8e3c12](https://github.com/Interlaken0/amf-rg432/commits/e8e3c125e0d92157cb09ff921207607b4d7e6822))

## [0.0.9](https://github.com/Interlaken0/amf-rg432/compare/v0.0.8...v0.0.9) (2026-10-03)


### Documentation

* add portfolio evidence pack with labelled screenshots and section write-ups ([1086656](https://github.com/Interlaken0/amf-rg432/commits/10866564e3af230644fd5d91f74451252006ea2f))

## [0.0.8](https://github.com/Interlaken0/amf-rg432/compare/v0.0.7...v0.0.8) (2026-10-03)


### Documentation

* add sprint 4 retrospective ([9c4e0ea](https://github.com/Interlaken0/amf-rg432/commits/9c4e0eacc5b470d4fd5820b241ca5202b8f0a07b))
* correct sprint 4 retrospective dates ([8aba57c](https://github.com/Interlaken0/amf-rg432/commits/8aba57cdb27bf6433494dd57ad809d4513bf4250))

## [0.0.7](https://github.com/Interlaken0/amf-rg432/compare/v0.0.6...v0.0.7) (2026-10-03)

## [0.0.6](https://github.com/Interlaken0/amf-rg432/compare/v0.0.5...v0.0.6) (2026-10-03)


### Documentation

* backfill changelog entries for 0.0.2-0.0.5 ([29e8592](https://github.com/Interlaken0/amf-rg432/commits/29e8592f118055c2eeed4891e089432cd0f7c9d9))

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
