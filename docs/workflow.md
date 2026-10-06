# Operator Workflow — RG432 Test Rig

End-to-end flow for registering a board and running a test, built from
`docs/requirements/use-cases.md` (Use Cases 1–4) and the implemented
behaviour in `src/renderer/App.tsx` and `src/shared/status.ts`.

```mermaid
flowchart TD
    START([Launch application]) --> SERIAL[Enter or scan serial number<br/>or click New Board for the next free serial]
    SERIAL --> OPERATOR[Enter operator name]
    OPERATOR --> CANREG{Serial valid and<br/>operator entered?}
    CANREG -->|No| HINT[Register Board stays disabled<br/>inline hint if serial format invalid]
    HINT --> SERIAL
    CANREG -->|Yes| REGISTER[Register Board clicked]
    REGISTER --> EXISTS{Already registered?}
    EXISTS -->|Yes| CONFIRM[Amber warning<br/>Confirm Registration to update]
    CONFIRM --> REGISTERED
    EXISTS -->|No| REGISTERED[Board registered<br/>confirmation banner]
    REGISTERED --> STARTTEST[Click Start Test]
    STARTTEST --> RUNNING[Spinner — test in progress ~4s<br/>all inputs locked]
    RUNNING --> DLLCALL{DLL call succeeds?}
    DLLCALL -->|No| DIAG[Error banner with diagnostic log path<br/>attempt recorded as fail]
    DIAG --> HISTORY
    DLLCALL -->|Yes| VERDICT{Status word verdict}
    VERDICT -->|"all digits 0"| PASS[PASS — green badge]
    VERDICT -->|"any digit 6-9"| FAIL[FAIL — red badge, terminal<br/>Start Test disabled for this board]
    VERDICT -->|"first failing digit 1-5<br/>later stages skipped"| RETEST[RETEST — amber badge<br/>bad connexion prompt]
    RETEST -->|"check the board, run again"| STARTTEST
    PASS --> HISTORY[Result saved to test history]
    FAIL --> HISTORY
    HISTORY --> REVIEW[Search history / Export CSV]
```

## Notes

- The retest loop is Jeff's rule: status digits 6–9 are terminal faults,
  anything else is a connexion-type fault the operator may retry
  immediately (`isRetryable` in `src/shared/status.ts`).
- A board is "done" after a pass or a terminal fail — Start Test
  disables until a new serial is entered (`boardDone` in `App.tsx`).
- A failed DLL call still lands in history as a fail with the diagnostic
  log path, so no test attempt is ever untracked (Use Case 2
  alternative 4a).
