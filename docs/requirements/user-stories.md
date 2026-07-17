# User Stories

These user stories were brainstormed with Jeff and derived from the project objectives in the Project Initiation Document. They will be used to build and prioritise the sprint backlog. Each story includes acceptance criteria in Given/When/Then format.

## Board registration

### Register a board by serial number

- **As** Dave, **I want** to register a board by entering or scanning its serial number **so that** every test is traceable to a specific unit.
- **Given** the registration form is open
- **When** I enter a serial number and click Register Board
- **Then** the board is saved and I see confirmation that it is ready for testing.

### Enter operator name once per shift

- **As** Dave, **I want** to enter my operator name once per shift **so that** I do not have to type it for every board.
- **Given** I have already entered my operator name
- **When** I register another board during the same shift
- **Then** the operator field keeps my name so I only enter the new serial number.

### Validate serial number format

- **As** the test rig, **I want** to validate that a serial number is not empty and matches the expected format **so that** corrupt data cannot be saved.
- **Given** I leave the serial number field empty
- **When** I click Register Board
- **Then** I see a validation error and the board is not saved.

## Test execution

### Start a test with one click

- **As** Dave, **I want** to start a test with one button click **so that** I can keep the production line moving quickly.
- **Given** a board is registered
- **When** I click Start Test
- **Then** the test begins and I see it running.

### See live progress while a test runs

- **As** Dave, **I want** to see live progress while a test runs **so that** I know the test rig has not frozen.
- **Given** a test is running
- **When** several seconds have passed
- **Then** I see a progress indicator or status message updating until the test completes.

### Run the test in mock mode

- **As** Dave, **I want** to run the test in mock mode when no hardware or DLL is available **so that** development and training can continue.
- **Given** the real DLL is not present
- **When** I start a test
- **Then** the app falls back to mock mode and returns a simulated result.

## Results and feedback

### See a clear Pass or Fail result

- **As** Dave, **I want** to see a clear Pass or Fail result **so that** I know immediately whether the board can move forward.
- **Given** a test has finished
- **When** the result is shown
- **Then** I can read whether the status is Pass or Fail without guessing.

### Obvious visual feedback for Pass and Fail

- **As** Dave, **I want** obvious visual feedback — such as colour and a large icon — for Pass and Fail states **so that** I cannot misread the result in a noisy factory environment.
- **Given** a test has finished
- **When** the result is displayed
- **Then** Pass is shown in green and Fail is shown in red, with a large icon or label.

### Simple error message on unexpected failure

- **As** Dave, **I want** to see a simple error message if a test fails unexpectedly **so that** I know whether to retry, quarantine, or call engineering.
- **Given** a test cannot complete because of an error
- **When** the error is shown
- **Then** I see plain language guidance such as "Try again" or "Call engineering" instead of a technical stack trace.

## Traceability and reporting

### Store every test result

- **As** Sarah, **I want** every test result stored with the board serial number, operator, timestamp, and status **so that** we can trace any board back to its test record.
- **Given** a test has completed
- **When** I search for the board in the history
- **Then** I find the matching serial number, operator, timestamp, and Pass/Fail status.

### Search test history by serial number

- **As** Sarah, **I want** to search test history by serial number **so that** I can respond quickly to customer returns or audits.
- **Given** the history screen is open
- **When** I type a serial number into the search field
- **Then** only matching records are shown.

### Export test history to a file

- **As** Sarah, **I want** to export test history to a file **so that** I can analyse trends in a spreadsheet or share data with engineering.
- **Given** I have filtered the history to a date range or serial number
- **When** I click Export
- **Then** a CSV file is created with the visible records.

## Diagnostics and maintenance

### Export diagnostic logs on unexpected failures

- **As** Jeff, **I want** unexpected failures to export a diagnostic log automatically **so that** engineering can investigate without reproducing the failure manually.
- **Given** a test fails with an unexpected error
- **When** the error occurs
- **Then** a timestamped diagnostic log file is written to the configured location.

### Standalone Windows installer

- **As** Jeff, **I want** the application packaged as a standalone Windows installer **so that** it can be deployed to factory PCs without complex setup.
- **Given** the installer has been built
- **When** it runs on a clean Windows PC
- **Then** the test rig installs and launches without requiring extra command-line setup.

### Mockable native DLL interface

- **As** Greg, **I want** the native DLL calls isolated behind a mockable interface **so that** the test rig keeps working even if the final DLL changes.
- **Given** the real DLL is replaced with a different version
- **When** the app starts
- **Then** only the adapter module needs updating; the rest of the app remains unchanged.

## Priority summary

| Story | Priority | Sprint |
|-------|----------|--------|
| Register a board with serial number and operator | Must have | Sprint 1 |
| Start a test with one button click | Must have | Sprint 1 |
| Show clear Pass / Fail feedback | Must have | Sprint 1 |
| Store test results in SQLite | Must have | Sprint 2 |
| Run tests in mock mode | Must have | Sprint 2 |
| Search and export test history | Should have | Sprint 2 / Sprint 4 |
| Export diagnostic logs on failure | Should have | Sprint 4 |
| Package as Windows installer | Must have | Sprint 4 |
