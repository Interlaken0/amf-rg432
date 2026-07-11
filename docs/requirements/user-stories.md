# User Stories

These user stories were brainstormed with Jeff and derived from the project objectives in the Project Initiation Document. They will be used to build and prioritise the sprint backlog.

## Board registration

- As Dave, I want to register a board by entering or scanning its serial number so that every test is traceable to a specific unit.
- As Dave, I want to enter my operator name once per shift so that I do not have to type it for every board.
- As the test rig, I want to validate that a serial number is not empty and matches the expected format so that corrupt data cannot be saved.

## Test execution

- As Dave, I want to start a test with one button click so that I can keep the production line moving quickly.
- As Dave, I want to see live progress while a test runs so that I know the test rig has not frozen.
- As Dave, I want to run the test in mock mode when no hardware or DLL is available so that development and training can continue.

## Results and feedback

- As Dave, I want to see a clear Pass or Fail result so that I know immediately whether the board can move forward.
- As Dave, I want obvious visual feedback — such as colour and a large icon — for Pass and Fail states so that I cannot misread the result in a noisy factory environment.
- As Dave, I want to see a simple error message if a test fails unexpectedly so that I know whether to retry, quarantine, or call engineering.

## Traceability and reporting

- As Sarah, I want every test result stored with the board serial number, operator, timestamp, and status so that we can trace any board back to its test record.
- As Sarah, I want to search test history by serial number so that I can respond quickly to customer returns or audits.
- As Sarah, I want to export test history to a file so that I can analyse trends in a spreadsheet or share data with engineering.

## Diagnostics and maintenance

- As Jeff, I want unexpected failures to export a diagnostic log automatically so that engineering can investigate without reproducing the failure manually.
- As Jeff, I want the application packaged as a standalone Windows installer so that it can be deployed to factory PCs without complex setup.
- As Greg, I want the native DLL calls isolated behind a mockable interface so that the test rig keeps working even if the final DLL changes.

## Priority summary

| Story | Priority | Sprint |
|-------|----------|--------|
| Register a board with serial number and operator | Must have | Sprint 1 |
| Start a test with one click | Must have | Sprint 1 |
| Show clear Pass / Fail feedback | Must have | Sprint 1 |
| Store test results in SQLite | Must have | Sprint 2 |
| Run tests in mock mode | Must have | Sprint 2 |
| Search and export test history | Should have | Sprint 2 / Sprint 4 |
| Export diagnostic logs on failure | Should have | Sprint 4 |
| Package as Windows installer | Must have | Sprint 4 |
