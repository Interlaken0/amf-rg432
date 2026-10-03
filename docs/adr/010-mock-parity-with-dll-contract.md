# ADR 010: Mock DLL simulates the stage-2 contract, not just pass/fail

## Status

Accepted

## Context

The mock DLL exists so the app can be developed and tested without Jeff's
hardware library - on CI, on machines without the DLL, and for demos where a
controllable failure rate matters more than real faults.

The question was how faithful the mock needs to be:

- **Random pass/fail** - simplest, but can't exercise any of the status-word
  logic the app now depends on
- **Simulate the full stage-2 contract** - status words with real fault
  digits, stage skipping, the `byType` failure percentage, timing delays,
  and disconnect faults

## Decision

The mock simulates the stage-2 contract end to end. `createMockDllInterop`
emits four-digit status words with plausible fault digits (1-9), skips later
stages with `F` after a failure, honours the same `failurePercent` argument
`RunTest` takes, simulates the ~3s registration and ~1s-per-stage delays,
and can throw a USB-disconnect error mid-test.

### Why this made sense

The app's interesting behaviour is all downstream of the status word - the
three-way verdict, stage names, QA extraction. A mock that only flips a coin
could never tell us whether that logic works. With contract parity, the UI,
history, search, and CSV export can all be verified without hardware - and
the mock demonstrated identical badge behaviour to the real DLL in manual
runs.

## What this means for us

### The good stuff

- Full test coverage of the stage-2 logic without hardware
- Failure-percent-driven demos in mock mode look identical to real runs
- Disconnect injection exercises the operator error path safely

### The trade-offs

- The mock has to track the real DLL's semantics - if Jeff changes the
  status-word rules, the mock must be updated too
- Simulated randomness means mock tests assert on properties (word shape,
  skip pattern) rather than exact values

### How we're handling the downsides

- The shared `status.ts` module decodes words for both paths, so the mock
  and the real DLL can't implement different rules
- `mock-dll.test.ts` pins the word shape and stage-skip pattern
- Jeff's `DebugMessages` tool stays out of the shipped installer - it's a
  dev-only debug window for the DLL, not part of the product
