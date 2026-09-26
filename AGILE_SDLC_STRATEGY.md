# Agile SDLC Strategy: RG432 Automated Test Rig

## Project Timeline

| Field | Value |
|-------|-------|
| Project Start | Friday 3 July 2026 |
| Project End | Friday 28 August 2026 |
| Duration | 8 weeks (40 working days) |
| Working Pattern | Monday to Friday only, weekends excluded |
| Sprint Length | 2 weeks (10 working days) |
| Sprint Count | 4 |
| Estimation Method | Fibonacci story points (1, 2, 3, 5, 8, 13, 21) |
| Point Definition | 1 point = approximately half a day of focused development effort |

## Methodology

The project follows a **Scrumban** approach. This combines the 2-week sprint cadence of Scrum with the flow-based visibility of Kanban. Because the team is a single developer and several external dependencies — such as the final DLL and physical prototypes — are controlled by Jeff, Kanban flow and WIP limits help manage uncertainty without losing the sprint review rhythm.

| Element | Approach | Rationale |
|---------|----------|-----------|
| Sprints | 2-week fixed sprints | Provides regular demos with Jeff and clear sprint goals. |
| Board | Kanban-style board | Visualises work in progress, blockers, and backlog. |
| WIP limit | 1–2 items in progress | Stops the solo developer from splitting focus across too many tasks. |
| Daily check | Self-reported progress note | Replaces a stand-up meeting; written directly in the sprint notes. |
| Buffer tasks | Contingency items ready in backlog | Protects the sprint when external dependencies are late. |

## Sprint Overview

| Sprint | Dates | Focus | Sprint Goal |
|--------|-------|-------|-------------|
| Sprint 1 | 3 Jul – 16 Jul | Environment & UI Setup | A working Electron desktop shell with a board registration form and test initiation UI. |
| Sprint 2 | 17 Jul – 30 Jul | Database & Simulation Layer | SQLite persistence and a mock mode that can simulate hardware responses without DLLs. |
| Sprint 3 | 31 Jul – 13 Aug | Native DLL Integration & File Analysis | Koffi integration with the product DLL and parsing of any resulting output files. |
| Sprint 4 | 14 Aug – 28 Aug | Logging, Physical Integration & UAT | Diagnostic logging, batch reports, physical prototype testing, Windows installer, and UAT sign-off. |

## Project Scope and Out-of-Scope Items

The scope of this SDLC strategy is the automated test rig software only. Product-level recommendations, such as **Marketing the Analysis Feature** (promoting the built-in detection that prevents a track already in 432Hz from being converted twice), have been approved by Jeff as a product-level direction. They remain outside the test rig build scope and are not included in the sprint backlog.

## Requirements Artefacts

The following artefacts were brainstormed with Jeff and define the human-centred requirements for the test rig. They feed directly into the Trello backlog and Sprint 1 UI work.

| Artefact | Location | Purpose |
|----------|----------|---------|
| Personas | `docs/requirements/personas.md` | Describes Dave (factory operator), Sarah (production supervisor), and Jeff (stakeholder). |
| User stories | `docs/requirements/user-stories.md` | Short, backlog-ready statements covering registration, testing, results, history, and diagnostics. |
| Use cases | `docs/requirements/use-cases.md` | Step-by-step flows for board registration, test execution, result review, history search, and diagnostic export. |

## Fibonacci Point Guide

| Points | Effort |
|--------|--------|
| 1 | Very small task, up to half a day. |
| 2 | Small task, roughly half a day to one day. |
| 3 | Medium task, one day of work. |
| 5 | Large task, two to three days. |
| 8 | Very large task, three to four days. |
| 13 | Major feature, must be broken down if possible. |
| 21 | Too large for a sprint, must be split before acceptance. |

## Sprint 1: Environment & UI Setup

### Dates: 3 July – 16 July 2026

**Sprint Goal:** Establish the complete development environment and deliver a working operator interface for board registration and test initiation.

### Week 1

| Day | Date | Task | Story Points | Definition of Done |
|-----|------|------|--------------|--------------------|
| Day 1 | Fri 3 Jul | Sprint planning with Jeff; create GitHub repository and initial project structure. | 2 | Repo exists, README and licence added, project board configured. |
| Day 2 | Mon 6 Jul | Configure TypeScript, ESLint, and Vite for Electron. | 3 | Linting passes, TypeScript compiles, Vite dev server runs. |
| Day 3 | Tue 7 Jul | Set up Electron main process and renderer communication. | 3 | Main and renderer processes communicate, dev build launches. |
| Day 4 | Wed 8 Jul | Configure Vitest with a passing sample unit test. | 2 | `npm test` runs successfully with at least one passing test. |
| Day 5 | Thu 9 Jul | Set up Conventional Commits and commitlint in CI. | 2 | Commit messages are linted; CI workflow triggers on push. |

**Week 1 Velocity:** 12 points

### Week 2

| Day | Date | Task | Story Points | Definition of Done |
|-----|------|------|--------------|--------------------|
| Day 6 | Fri 10 Jul | Design and wireframe the board registration form, informed by the Dave persona and user stories. | 2 | Wireframe approved and UI components identified; design traceable to `docs/requirements/personas.md` and `docs/requirements/user-stories.md`. |
| Day 7 | Mon 13 Jul | Implement board registration form in React. | 3 | Form captures serial number, operator, and timestamp with validation. |
| Day 8 | Tue 14 Jul | Implement test initiation UI and live progress display. | 3 | Operator can start a test and see live progress indicators. |
| Day 9 | Wed 15 Jul | Implement Pass / Fail visual feedback and error handling. | 2 | UI clearly displays Pass / Fail states and basic error messages. |
| Day 10 | Thu 16 Jul | Regression testing, documentation update, and sprint review. | 2 | All tests pass, sprint demo delivered, retrospective notes captured. |

**Week 2 Velocity:** 12 points

**Sprint 1 Total Velocity:** 24 points

---

## Sprint 2: Database & Simulation Layer

### Dates: 17 July – 30 July 2026

**Sprint Goal:** Build the SQLite persistence layer and a mock mode that simulates hardware and DLL responses so development can continue without physical hardware.

### Week 1

| Day | Date | Task | Story Points | Definition of Done |
|-----|------|------|--------------|--------------------|
| Day 1 | Fri 17 Jul | Sprint planning; design SQLite database schema. | 3 | Schema reviewed and approved; tables for boards, operators, and tests defined. |
| Day 2 | Mon 20 Jul | Implement database connection and migration scripts. | 3 | Database file is created automatically; migrations run on startup. |
| Day 3 | Tue 21 Jul | Create board registration persistence layer. | 3 | Registration form saves board records to SQLite. |
| Day 4 | Wed 22 Jul | Create test result persistence layer. | 3 | Test outcomes are saved with serial number, operator, timestamp, and result. |
| Day 5 | Thu 23 Jul | Seed database with realistic mock data for development. | 2 | Seed script populates test records for UI and integration testing. |

**Week 1 Velocity:** 14 points

### Week 2

| Day | Date | Task | Story Points | Definition of Done |
|-----|------|------|--------------|--------------------|
| Day 6 | Fri 24 Jul | Design mock mode architecture and interfaces. | 2 | Mock provider interface defined and documented. |
| Day 7 | Mon 27 Jul | Implement mock DLL responses. | 5 | Mock returns realistic binary success/fail flags and output data. |
| Day 8 | Tue 28 Jul | Implement mock hardware responses and timing. | 3 | Mock simulates USB connection delays and hardware state changes. |
| Day 9 | Wed 29 Jul | Add mock mode toggle in the UI and settings. | 2 | Operator can enable/disable mock mode from the interface. |
| Day 10 | Thu 30 Jul | Integration tests, documentation, and sprint review. | 2 | SQLite and mock mode tested together; demo delivered. |

**Week 2 Velocity:** 14 points

**Sprint 2 Total Velocity:** 28 points

---

## Sprint 3: Native DLL Integration & File Analysis

### Dates: 31 July – 13 August 2026

**Sprint Goal:** Integrate Koffi to call the demo DLL (and later the final product DLL), pass commands, parse binary flags, and process any resulting output files.

### Week 1

| Day | Date | Task | Story Points | Definition of Done |
|-----|------|------|--------------|--------------------|
| Day 1 | Fri 31 Jul | Sprint planning; set up Koffi and define DLL interface types against the demo DLL. | 5 | Koffi installed, DLL path configurable, C function signatures mapped from the demo DLL. |
| Day 2 | Mon 3 Aug | Implement native interop module with abstraction layer. | 5 | Koffi calls isolated behind a testable module; mock can still be injected. |
| Day 3 | Tue 4 Aug | Implement command passing to the DLL. | 3 | UI commands are converted to C calls and sent to the DLL or mock. |
| Day 4 | Wed 5 Aug | Implement binary flag and response parsing from the DLL. | 3 | DLL output is parsed into typed JavaScript objects. |
| Day 5 | Thu 6 Aug | Add error handling and logging for DLL failures. | 3 | Errors are caught, logged, and surfaced to the UI without crashing. |

**Week 1 Velocity:** 19 points

### Week 2

| Day | Date | Task | Story Points | Definition of Done |
|-----|------|------|--------------|--------------------|
| Day 6 | Fri 7 Aug | Design output file processing workflow. | 2 | File format understood; parser design documented. |
| Day 7 | Mon 10 Aug | Implement output file parser. | 3 | Parser reads test output files and extracts relevant fields. |
| Day 8 | Tue 11 Aug | Link parsed file data to the SQLite database. | 3 | File results are stored alongside test records. |
| Day 9 | Wed 12 Aug | Integration tests covering Koffi, SQLite, and mock mode. | 3 | End-to-end tests pass for both real and mock DLL paths. |
| Day 10 | Thu 13 Aug | Regression test, documentation, and sprint review. | 2 | All tests pass; native interop module documented; demo delivered. |

**Week 2 Velocity:** 13 points

**Sprint 3 Total Velocity:** 32 points

---

## Sprint 4: Logging, Physical Integration & UAT

### Dates: 14 August – 28 August 2026

**Sprint Goal:** Add diagnostic logging and batch reporting, test with physical prototype boards, package the Windows installer, and complete UAT sign-off.

### Week 1

| Day | Date | Task | Story Points | Definition of Done |
|-----|------|------|--------------|--------------------|
| Day 1 | Fri 14 Aug | Sprint planning; design batch report and diagnostic log format. | 3 | Log and report schemas defined; export location agreed. |
| Day 2 | Mon 17 Aug | Implement final database persistence for results and batch records. | 3 | All test results and batch metadata are persisted correctly. |
| Day 3 | Tue 18 Aug | Implement batch report generation. | 3 | Operator can export a batch report of recent test results. |
| Day 4 | Wed 19 Aug | Implement automated diagnostic log export on failure. | 3 | Unexpected failures write a timestamped diagnostic log file. |
| Day 5 | Thu 20 Aug | Write UAT test scripts and acceptance criteria. | 2 | UAT scripts cover registration, testing, Pass/Fail, and reporting. |

**Week 1 Velocity:** 14 points

### Week 2

| Day | Date | Task | Story Points | Definition of Done |
|-----|------|------|--------------|--------------------|
| Day 6 | Fri 21 Aug | Physical prototype integration testing. | 5 | Application tested with a real RG432 board via USB-C. |
| Day 7 | Mon 24 Aug | Fix integration issues and refine mock mode if needed. | 3 | Defects resolved; mock mode remains accurate against real behaviour. |
| Day 8 | Tue 25 Aug | Package the application as a standalone Windows installer. | 3 | Installer builds successfully and installs on a clean Windows PC. |
| Day 9 | Wed 26 Aug | End-to-end testing and installer validation. | 3 | Full workflow tested from installation through to test completion. |
| Day 10 | Thu 27 Aug | Final documentation, KSB evidence review, and evidence packaging. | 2 | All documentation complete; apprenticeship evidence ready for review. |
| Day 11 | Fri 28 Aug | Sprint review with Jeff; UAT sign-off; project retrospective. | 2 | Jeff signs off UAT; project retrospective captured; sprint closed. |

**Week 2 Velocity:** 18 points

**Sprint 4 Total Velocity:** 32 points

---

## Fast-Track Recovery Plan

### Dates: 25 September – 1 October 2026 (5 working days)

**Goal:** Complete the outstanding Sprint 2–4 work in a single compressed week so the project closes within the original schedule. Sprint dates above are unchanged; this plan describes the catch-up execution.

Outstanding items from Sprints 2, 3 and 4 are consolidated below. Database tasks are prioritised early in the week because they generate evidence for the database-related KSB criteria (see the KSB Evidence Mapping section). Physical prototype testing and code signing remain deferred under the Risk Register until Jeff supplies hardware and a certificate.

| Day | Date | Task | Story Points | KSB Evidence | Definition of Done |
|-----|------|------|--------------|--------------|--------------------|
| Day 1 | Fri 25 Sep | Commit outstanding work in logical chunks; fix lint errors in `tests/database.test.ts`; run the full test suite for a green baseline; extend ADR 002 with an explicit relational vs non-relational comparison and a data protection section covering operator PII, retention, and GDPR. | 4 | K10, K8, B5 | All work committed with Conventional Commits; lint, type-check and tests pass; ADR 002 updated. |
| Day 2 | Mon 28 Sep | Implement the database seed script (carried over from Sprint 2 Day 5); add the mock mode toggle in the UI and settings; integration tests covering SQLite, mock and real DLL paths together. | 5 | S3 | `npm run seed` populates boards and tests; operator can switch mock mode; integration tests pass for both providers. |
| Day 3 | Tue 29 Sep | Fix `runTest` in `real-dll.ts` to interpret the DLL result bytes into real pass/fail instead of the hardcoded `'pass'`; surface DLL errors to the UI; validate against `RG432TestExports.h` and the demo DLL. | 3 | S3 | Pass/fail derived from the documented DLL semantics; failures show an operator-readable message. |
| Day 4 | Wed 30 Sep | Implement batch report generation using aggregated SQL queries over the tests table; implement automated diagnostic log export on unexpected failure. | 5 | S3, K10, B5 | Operator can export a batch report; failures write a timestamped diagnostic log; queries are parameterised and covered by tests. |
| Day 5 | Thu 1 Oct | Package the Windows installer and validate it; write UAT scripts; update `docs/database/schema.md`; sprint review with Jeff, UAT sign-off, retrospective and evidence packaging. | 4 | K10 | Installer builds via the CI release job and installs cleanly; UAT signed off; retro captured; evidence bundle exported. |

**Recovery Plan Velocity:** 21 points across 5 days (roughly double the normal rate — days will run long, and scope may be descoped per the Contingency Rules if a task overruns).

---

## Summary Velocity

| Sprint | Week 1 Points | Week 2 Points | Sprint Total |
|--------|---------------|---------------|--------------|
| Sprint 1 | 12 | 12 | 24 |
| Sprint 2 | 14 | 14 | 28 |
| Sprint 3 | 19 | 13 | 32 |
| Sprint 4 | 14 | 18 | 32 |
| **Total** | **59** | **57** | **116** |

*Plus 21 points of carried-over scope executed in the Fast-Track Recovery Plan.*

## Ceremonies and Rituals

| Ceremony | Frequency | Purpose |
|----------|-----------|---------|
| Sprint Planning | Day 1 of each sprint | Select backlog items, agree acceptance criteria, estimate tasks. |
| Daily Progress Check | Every working day | Greg notes progress, blockers, and the plan for the day as the sole developer. |
| Mid-Sprint Review | Day 5 of each sprint | Demo progress to Jeff and adjust plan if needed. |
| Sprint Review | Last day of each sprint | Demonstrate completed work to the stakeholder. |
| Sprint Retrospective | Last day of each sprint | Capture what went well, what slowed down, and one improvement action. |
| Backlog Refinement | Last day of each sprint | Prepare and estimate items for the next sprint. |

## Kanban Board

The board is a simple set of columns used during each sprint. It can be managed in a Trello board, GitHub Project, or a physical board.

| Column | Purpose | WIP Limit |
|--------|---------|-----------|
| Backlog | Items ready for a future sprint. | No limit |
| Ready | Items that meet the Definition of Ready and are candidates for the current sprint. | No limit |
| In Progress | Items actively being worked on. | 2 |
| Blocked | Items waiting on an external dependency or decision. | 1 |
| In Review | Code complete, self-reviewed, and awaiting final check or merge. | 2 |
| Done | Completed and merged into the main branch. | No limit |

Items should move from left to right. If the **In Progress** column reaches its limit, no new item can be started until one moves out.

## Definition of Done


A task is only considered complete when all of the following are true:

- Code is written and self-reviewed.
- Unit tests pass and coverage is acceptable.
- ESLint reports no errors.
- Security checklist is satisfied for the change (context isolation, IPC bridge, CSP, parameterised queries, no hardcoded secrets, validated inputs).
- Documentation is updated if the change affects the architecture or public interface.
- The change is merged into the main branch (pull request retained for traceability where possible, or merged directly as a solo developer).
- The commit message follows Conventional Commits.

## Definition of Ready

A backlog item may only enter a sprint when it meets all of the following:

- The user story is written in **As/I want/So that** format and has acceptance criteria in **Given/When/Then** format.
- The story has a Fibonacci estimate agreed by the developer and Jeff.
- The external dependencies are identified and either available or covered by a buffer task.
- The security impact is understood and any checklist items are listed.
- The UI or workflow is traceable to a persona and user story.
- There are no unresolved questions that would block implementation.

## Security Checklist

Every sprint must consider the following security requirements. These are derived from the Security & Data Protection section of the PID.

| # | Security Measure | Verification |
|---|--------------------|--------------|
| 1 | Context isolation enabled in Electron | `contextIsolation: true` in `webPreferences`; renderer cannot access Node.js directly. |
| 2 | Sandbox mode enabled | `sandbox: true` in `webPreferences` for renderer processes. |
| 3 | Controlled IPC bridge | Preload script exposes only an allowlisted set of IPC channels to the renderer. |
| 4 | Strict Content Security Policy | CSP headers block inline scripts, eval, and remote resource loading. |
| 5 | Parameterised SQLite queries | All database queries use placeholders; no string concatenation in SQL. |
| 6 | No hardcoded secrets or DLL paths | Sensitive values and DLL paths loaded from environment variables or secure config. |
| 7 | Windows code signing | Installer and executable signed with a trusted certificate before release. |

## Contingency Rules

- If a task exceeds its estimated points, the developer must flag it in the daily progress check and decide whether to descope, split, or carry it over.
- If external dependencies (final DLLs, hardware, or Jeff's testing EXE) are delayed, the demo DLL, mock mode, and buffer tasks allow the sprint to continue.
- Any item larger than 8 points must be broken down before acceptance into a sprint.
- No new work is introduced mid-sprint unless it replaces an existing item of equal or lower priority.

## Risk Register

The following risks are tracked because they depend on external factors or could disrupt the sprint plan.

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Final DLL is not delivered on time | Medium | High | Use the demo DLL and mock mode to continue development; the adapter layer is isolated. | Jeff |
| Physical prototype hardware is not available | Medium | High | Validate against the test DLL and mock; defer physical integration until hardware arrives. | Jeff |
| Windows installer packaging issues | Low | Medium | Test the installer early in Sprint 4 on a clean Windows VM. | Greg |
| Factory PC restrictions block deployment | Low | High | Build a standalone installer and avoid admin-only dependencies. | Greg |
| Scope creep from product-level ideas | Medium | Medium | Reject new features unless they replace a sprint item of equal or lower priority. | Greg and Jeff |
| Apprenticeship evidence is incomplete | Low | High | Document decisions and commit messages as work progresses; review evidence weekly. | Greg |
| Project schedule slips due to absence | Occurred | High | Handled via the Fast-Track Recovery Plan: outstanding scope is compressed into a single week under the Contingency Rules while the original sprint dates are retained. | Greg |

## KSB Evidence Mapping

The following apprenticeship KSB criteria are evidenced directly by project artefacts. Database-related criteria are the focus of the database tasks in the Fast-Track Recovery Plan.

| KSB | Criterion | Where it is evidenced |
|-----|-----------|------------------------|
| K10 | Principles and uses of relational and non-relational databases | ADR 002 (`docs/adr/002-sqlite-database.md`) compares SQLite against non-relational alternatives (JSON files, IndexedDB) and external RDBMS options; `docs/database/schema.md` documents the relational schema, keys and constraints; `docs/database/design-notes.md` covers the ERD, normalisation, constraints and indexing rationale; Recovery Plan Day 1 extends the ADR with an explicit relational vs non-relational rationale. |
| S3 | Link code to data sets | `src/main/database.ts`, `src/main/test-repository.ts` and the migration runner connect the application to SQLite using parameterised queries; the Recovery Plan seed script and batch report exercise data reads/writes end to end; `docs/reports-and-logs.md` documents the report/log export schemas; `docs/database/design-notes.md` annotates the queries that link code to the dataset; `tests/test-repository.test.ts` verifies the data-access layer. |
| K8 | Data protection and handling sensitive data | The Security Checklist requires parameterised queries and no hardcoded secrets; Recovery Plan Day 1 adds a data protection section to ADR 002 covering operator PII stored in the `boards`/`tests` tables, retention and GDPR handling. |
| B5 | Ownership and robustness | Sprint milestone reports, retrospectives (`docs/retrospectives/`), ADRs and the OTJ logs record decisions and follow-through on action items. |
