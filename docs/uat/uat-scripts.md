# UAT Test Scripts — RG432 Test Rig

**Version:** 1.0
**Date:** 25 September 2026
**Tester:** Jeff (stakeholder sign-off)
**Traceability:** each script maps to a use case in `docs/requirements/use-cases.md`.

**Environment:** clean Windows PC with the installer build applied; stage-2 DLL (`RG432Test1.1.dll`) in `dll/` for hardware-path tests; mock mode available for all tests. The `failurePercent` setting (default 20) controls how often the DLL injects failures — raise it to see fail/retest paths quickly.

| # | Result (Pass/Fail) | Notes |
|---|--------------------|-------|
| UAT-01 | | |
| UAT-02 | | |
| UAT-03 | | |
| UAT-04 | | |
| UAT-05 | | |
| UAT-06 | | |
| UAT-07 | | |
| UAT-08 | | |
| UAT-09 | | |
| UAT-10 | | |
| UAT-11 | | |
| UAT-12 | | |

---

## UAT-01: Install and launch the application

**Covers:** installer packaging
**Given** a clean Windows PC with the `AMF RG432 Test Rig` installer
**When** the installer is run and the app is launched
**Then** the main window opens showing AMF RG432 Test Rig with the header (mock-mode switch, theme toggle), registration and run-test panels, and the test history table

## UAT-02: Register a board

**Covers:** Use Case 1
**Given** the application is running with mock mode enabled
**When** I enter serial `RG432-UAT01` and operator `Jeff`, then click **Register Board**
**Then** a confirmation banner shows the board is registered and ready for testing

## UAT-03: Registration validation

**Covers:** Use Case 1 alternative 2b
**Given** the application is running
**When** the serial number and/or operator fields are empty
**Then** the **Register Board** button is disabled and no record is created

## UAT-04: Run a passing test with live progress

**Covers:** Use Case 2
**Given** board `RG432-UAT01` is registered and mock mode is enabled
**When** I click **Start Test**
**Then** a spinner and "Test in progress" message show while the test runs (~4s), all inputs and buttons are disabled during the run, and a large colour-coded **PASS** (green), **RETEST** (amber) or **FAIL** (red) badge is displayed with the decoded test summary and result is stored

## UAT-05: Test blocked for unregistered board

**Covers:** Use Case 2 alternative flow
**Given** no board with serial `RG432-NOPE` is registered
**When** I enter `RG432-NOPE` and click **Start Test**
**Then** an error message is shown explaining the board is not registered, and nothing is written to history

## UAT-06: Hardware fault produces diagnostic log

**Covers:** Use Case 2 alternative 4a; diagnostic log export
**Given** mock mode is enabled and a registered board exists
**When** a simulated USB disconnect occurs during a test (small random chance per run — repeat tests until it triggers, or verify via unit test `simulates a USB disconnect`)
**Then** the UI shows the failure message including the path to the diagnostic log file under `userData/logs/`, the log file exists containing context, error and stack, and the aborted test is recorded in history as a fail so the attempt stays traceable

## UAT-07: Test history persists

**Covers:** Use Case 4 (history)
**Given** several tests have been run
**When** I restart the application
**Then** the Test History table still shows the previous results with serial, status and operator — the five most recent by default, with a "View all N results" link expanding to the full log

## UAT-08: Export batch report

**Covers:** Use Case 5 (reporting); Sprint 4 batch reports
**Given** the database contains test results (run `npm run seed` beforehand for realistic data if needed)
**When** I click **Export CSV** and choose a save location
**Then** a CSV file is written containing a labelled SUMMARY, an OPERATOR BREAKDOWN (case-insensitive grouping, per-operator pass rates), a FAILED TESTS section and the full TEST RESULTS log newest-first with Status Details, Test Summary and QA1–QA4 columns for real results, and it opens cleanly in Excel with serial numbers intact (all-digit serials export as `SN-<digits>` text, not scientific notation)

## UAT-09: Search test history

**Covers:** Use Case 4 (search); user story "Search test history by serial number"
**Given** at least two test records exist with different serial numbers
**When** I type part of a serial number into the history search field
**Then** only matching records are shown — including matches older than the five-row preview — and clearing the search restores the preview list

## UAT-10: Light/dark theme toggle

**Covers:** operator UI preference (Sprint 4 UI work)
**Given** the application is running
**When** I click the theme toggle in the header, then restart the app
**Then** the UI switches between light and dark themes and the choice persists after restart

## UAT-11: New Board generates the next free serial

**Covers:** TestScheduleNotes flow (serial allocation)
**Given** the application is running and boards `RG432-0001` and `RG432-0002` are already registered
**When** I click **New Board**
**Then** the serial field is filled with `RG432-0003` (the lowest free `RG432-XXXX` hex slot), and I can still overtype it if needed

## UAT-12: Connexion-type failure offers a retest

**Covers:** Jeff's retry rule — any digit 6–9 = terminal, anything else = retryable
**Given** a registered board and the failure percentage set high enough to produce failures (e.g. 50%)
**When** a test returns a connexion-type fault (status digit 1–5, e.g. `0x2fff`)
**Then** an amber **RETEST** badge shows with "Bad connexion — check the board and start the test again", Start Test stays enabled for an immediate retest, and the attempt is still recorded in history as a fail

---

## Sign-off

| | |
|---|---|
| Tester | Jeff |
| Date | |
| Result | Accepted / Accepted with notes / Rejected |
| Notes | |
