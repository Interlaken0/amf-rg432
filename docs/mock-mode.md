# Mock Mode Explained — Plain English

The **Mock mode** switch (top right of the app) decides where test results
come from. Everything on screen looks and behaves the same either way —
only the source of the results changes.

## Mock mode ON

The app does **not** talk to any hardware or to Jeff's DLL. Instead, a
built-in simulator (`src/native/mock-dll.ts`) pretends to be the test rig.

- **Register Board** waits about 3 seconds, then confirms — the same delay
  the real DLL would take.
- **Start Test** waits about 4 seconds, then produces a result — the same
  duration as a real test.
- The result is generated the same way the real one is: a four-digit
  status word, where each digit is a test stage. `0x0000` is a pass,
  digits 1–5 mean a retryable fault (amber **RETEST**), and digits 6–9
  mean a terminal failure (red **FAIL**).
- The **Failure %** dial works exactly as it does with the real DLL —
  0% always passes, 100% always fails.
- Occasionally the simulator pretends the hardware was unplugged — the
  test aborts, an error is shown, and a diagnostic log is written. This is
  deliberate: it exercises the fault-handling path without needing anyone
  to pull a cable.
- Results still save to the real database, appear in Test History, and
  export to CSV. Only the *hardware* is simulated.

**Use it for:** demos, development, training, and UAT dry-runs — anywhere
you want to show or test the app without the physical rig or DLL.

## Mock mode OFF

The app calls **Jeff's real DLL** (`RG432Test1.1.dll`), the same component
that drives the physical test hardware.

- **Register Board** calls `InitialiseDevice` — a real ~3 second
  initialisation.
- **Start Test** calls `RunTest` — a real ~4 second test run.
- The DLL writes a `.dat` results file (276 bytes) into the `Results`
  folder; the app reads it back, decodes the status word, and shows the
  badge. The same file Jeff's tools would produce.
- The **Failure %** dial is passed straight into `RunTest` — Jeff built it
  into the DLL as a simulator dial, so you can still force passes or
  failures without faulty hardware.
- Before the first real test, the app automatically writes the registry
  key that tells the DLL where to save results — no manual setup needed.

**Use it for:** factory deployment, final validation, and the real UAT
session — anywhere results must come from the actual hardware logic.

## The key point

The switch only changes **who generates the answer** — everything the
operator sees (badges, lockout, retry rules, history, CSV export) is
identical either way. That parity is deliberate and covered by tests, so
anything proven in mock mode behaves the same against the real DLL.

| | Mock ON | Mock OFF |
|---|---|---|
| Result source | Built-in simulator | Jeff's `RG432Test1.1.dll` |
| Hardware needed | No | DLL (bundled in installer) |
| `.dat` files written | No | Yes, real 276-byte files |
| Timings | Simulated (~3s / ~4s) | Real DLL timings |
| Failure % works | Yes | Yes — real DLL feature |
| Saved to history/CSV | Yes | Yes |
