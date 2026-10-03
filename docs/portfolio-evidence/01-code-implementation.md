# Evidence — Code Implementation

Core logic excerpts showing the translation of stakeholder requirements
into working algorithms.

## Screenshots

### `code-status-rule.png` — `src/shared/status.ts` (lines 57–94)

The three-way verdict rule supplied by the stakeholder, implemented as
small testable functions:

- `isPassing` — all four status digits zero (`0x0000`)
- `isRetryable` — non-zero but no digit 6–9 → the operator may retest
- `statusWord` / `statusDigits` — hex formatting and parsing

**Caption:** The stakeholder's pass/retest/fail classification rule
implemented in `src/shared/status.ts`. This single derivation is shared
by the result badge, history pills, search filtering, and CSV export,
so every view agrees on the verdict.

### `code-dat-parser.png` — `src/native/real-dll.ts` (lines 121–156)

`parseResultsFile` — binary parsing of the 276-byte `.dat` file written
by the real DLL: 256-byte serial, 4 status-digit bytes, then four
float32 QA values read little-endian.

**Caption:** Byte-level parsing of the DLL results file
(`parseResultsFile`). The layout was empirically verified and is
documented in the code comment and `docs/results-file-format.md`.

### `code-next-board-serial.png` — `src/main/test-repository.ts` (lines 96–115)

`nextBoardSerial` — scans registered serials, parses `RG432-XXXX` hex
values, and returns the lowest unused slot per the stakeholder's "pick
the lowest free number, not the next after the highest" instruction.

**Caption:** Lowest-free-slot serial allocation. Matches the
stakeholder requirement exactly: gaps in the numbering are reused
before higher numbers are issued.

## What this demonstrates

- Requirements translated into isolated, testable functions
- Binary/file-format handling against a real vendor artefact
- Algorithm design (lowest-free allocation, set-based gap scan)
- Comments that record the *why*, not the *what*
