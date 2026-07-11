# Use Cases

These use cases describe the main interactions between the factory operator and the RG432 Automated Test Rig. They were agreed with Jeff as the primary flows the application must support.

## Use Case 1: Register a board for testing

**Actor:** Dave (factory operator)

**Preconditions:**

- The test rig application is open on the factory PC.
- Dave knows his operator name.
- The board has a readable serial number.

**Main flow:**

1. Dave enters or scans the board serial number into the registration form.
2. Dave enters his operator name, or the application uses the name from the current shift.
3. Dave selects **Register Board**.
4. The application validates the serial number format.
5. The application records the board, operator, and timestamp in the database.
6. The screen confirms the board is registered and ready for testing.

**Alternative flows:**

- **2a. Serial number already registered:** The application warns Dave and asks whether to continue or re-enter.
- **2b. Serial number format invalid:** The application highlights the field and asks Dave to correct it.

**Postconditions:**

- The board is recorded as pending test.
- The operator can now start a test for this board.

---

## Use Case 2: Run a board test

**Actor:** Dave (factory operator)

**Preconditions:**

- The board is registered in the system.
- The application is in normal or mock mode.

**Main flow:**

1. Dave confirms the serial number on screen matches the physical board.
2. Dave selects **Start Test**.
3. The application shows a progress indicator while the test runs.
4. The application invokes the DLL or mock to program and verify the board.
5. The application receives the result flags from the DLL or mock.
6. The application stores the result in the database.
7. The application displays a large Pass or Fail result to Dave.

**Alternative flows:**

- **4a. DLL call fails unexpectedly:** The application shows an error, exports a diagnostic log, and records the failure.
- **4b. Mock mode is active:** The application uses the mock DLL and returns a simulated result.

**Postconditions:**

- The test result is persisted with serial number, operator, timestamp, and status.
- Dave knows whether the board passed or failed.

---

## Use Case 3: Review Pass / Fail result

**Actor:** Dave (factory operator)

**Preconditions:**

- A test has just completed.

**Main flow:**

1. The application displays the result as Pass or Fail with clear visual styling.
2. If the result is Pass, Dave places the board in the pass tray.
3. If the result is Fail, Dave reads the short failure reason and places the board in the fail/quarantine tray.

**Alternative flows:**

- **2a. Diagnostics are available:** Dave can view the diagnostic details on screen or note the exported log file location.
- **2b. Result seems wrong:** Dave can re-run the test for the same board if allowed by factory policy.

**Postconditions:**

- The board is routed correctly based on the result.
- The result remains in the database for traceability.

---

## Use Case 4: Search test history

**Actor:** Sarah (production supervisor)

**Preconditions:**

- The supervisor has access to the test rig PC or exported data.
- At least one test has been recorded.

**Main flow:**

1. Sarah opens the test history screen or exported file.
2. Sarah searches by serial number, date, operator, or result status.
3. The application returns matching test records.
4. Sarah reviews the records to answer a query, investigate a return, or prepare an audit report.

**Alternative flows:**

- **3a. No records found:** The application shows a clear empty state and suggests refining the search.
- **3b. Export requested:** Sarah selects Export and saves the records to a file.

**Postconditions:**

- Sarah has the information needed for her investigation or report.

---

## Use Case 5: Export diagnostic log after unexpected failure

**Actor:** Dave (factory operator) or Jeff (engineering)

**Preconditions:**

- A test has failed in an unexpected way, such as a DLL error or crash.

**Main flow:**

1. The application detects an unexpected failure.
2. The application writes a timestamped diagnostic log file containing board details, environment info, error flags, and any stack trace.
3. The log is saved to a known location, such as the application data directory or desktop.
4. Dave or Jeff can send the log to engineering for analysis.

**Postconditions:**

- Engineering has a diagnostic artefact to investigate the failure.
- The production line can continue once the affected board is quarantined.
