# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.0.4](https://github.com/Interlaken0/amf-rg432/compare/v0.0.3...v0.0.4) (2026-09-25)

## [0.0.3](https://github.com/Interlaken0/amf-rg432/compare/v0.0.2...v0.0.3) (2026-09-25)

## [0.0.2](https://github.com/Interlaken0/amf-rg432/compare/v0.0.1...v0.0.2) (2026-09-25)

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
