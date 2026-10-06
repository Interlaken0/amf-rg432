# Functional and Non-Functional Requirements

Consolidated requirement list for the RG432 Test Rig, drawn from
`user-stories.md`, `use-cases.md`, Jeff's answered questions, and the
as-built behaviour. Each requirement is traceable to a use case, user
story, or UAT script.

## Functional requirements

| # | Requirement | Traceability |
|---|-------------|--------------|
| FR-01 | Register a board with a serial number and operator name; serial validated (letters, numbers, dashes; 3–32 chars) before saving | Use Case 1; US "Register a board"; UAT-02, UAT-03 |
| FR-02 | Generate the next free `RG432-XXXX` serial (lowest free hex slot) into the input via **New Board**, remaining overtypeable | TestScheduleNotes flow; UAT-11 |
| FR-03 | Warn and require **Confirm Registration** when registering an already-registered serial | Use Case 1 alt 2a |
| FR-04 | Run the four-stage board test through Jeff's DLL (`RunTest`, `byType` semantics) or the mock implementation | Use Case 2; UAT-04 |
| FR-05 | Show a progress indicator for the duration of the ~4s test and disable all inputs while it runs | Use Case 2 step 3; UAT-04 |
| FR-06 | Classify the status word into a three-way verdict: all-zero = PASS, any digit 6–9 = terminal FAIL, otherwise retryable | Jeff's verdict rule; UAT-04, UAT-12 |
| FR-07 | On a retryable (connexion-type) fault, show an amber RETEST badge with a "bad connexion" prompt and keep Start Test enabled for an immediate re-run | Use Case 2 alt 4c; UAT-12 |
| FR-08 | Persist every test result with serial, operator, timestamp, status, status details, decoded summary, and QA values to SQLite | Use Case 2 step 6; US "Store every test result"; UAT-07 |
| FR-09 | Show a persistent, searchable test history (serial, operator, status, date/time) with a five-row preview and on-demand expansion | Use Case 4; UAT-07, UAT-09 |
| FR-10 | Export the (filtered) history as a CSV batch report via a save dialog, including summary and per-operator breakdown | Use Case 4 alt 3b; UAT-08 |
| FR-11 | On an unexpected failure, write a timestamped diagnostic log to `userData/logs/` and record the aborted attempt as a fail | Use Case 5; UAT-06 |
| FR-12 | Provide a mock mode that simulates the DLL contract (timing, status words, faults) so the app runs without hardware | US "Run the test in mock mode"; ADR 010 |
| FR-13 | Expose a persisted Failure % control (0–100) passed to `RunTest` as `byType` for demo/UAT fault injection | Jeff's New-UPDATE contract; UAT-12 |
| FR-14 | Record the operator who ran each test at test time, preserving it even if the board's registration changes | `tests.operator` denormalisation; design-notes.md |
| FR-15 | Offer a light/dark theme toggle persisting across restarts | UAT-10 |

## Non-functional requirements

| # | Requirement | Evidence |
|---|-------------|----------|
| NFR-01 | Runs fully offline on a single Windows bench PC — no network dependency at runtime | Architecture (Electron + SQLite); no remote calls |
| NFR-02 | Deploys as a standalone Windows installer requiring no manual setup | `electron-builder.json5`; UAT-01 |
| NFR-03 | Starts in seconds; test cycle ≈4s matching hardware timing | `mock-dll.ts` stage timing; UAT-04 |
| NFR-04 | Usable by non-specialist operators: single screen, colour-coded verdict legible at arm's length, plain-language errors | wireframe.md design decisions; UAT-04, UAT-12 |
| NFR-05 | Reliable traceability: no test attempt is ever lost — aborted runs are persisted as fails | `index.ts` run-test handler; UAT-06 |
| NFR-06 | Data integrity enforced at the storage layer: `UNIQUE` serial, `NOT NULL`, status `CHECK`, board→test foreign key, parameterised SQL | `docs/database/design-notes.md`; migrations |
| NFR-07 | Data protection: stores only the personal data needed (operator names), local-only `userData` storage, GDPR-aware | `docs/data-protection.md`; ADR 002 |
| NFR-08 | Maintainable under contract change: DLL access isolated behind `DllInterop`; schema evolves via numbered migrations | ADR 010; migration ledger |
| NFR-09 | Secure desktop posture: context isolation, sandboxed renderer, allowlisted IPC bridge | `src/main/index.ts` window config |
| NFR-10 | Demonstrable without hardware or the final DLL | Mock mode parity (ADR 010); UAT dry-run |
