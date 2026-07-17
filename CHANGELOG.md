# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [Sprint 1]

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
