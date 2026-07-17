# RG432Test1.0 DLL — Reference Guide

Stage 1 deliverable for the LittleStone 432 test rig: a 64-bit Windows DLL
(`RG432Test1.0.dll`) plus its exported-function header (`RG432TestExports.h`),
and a Delphi test harness (`RG432DLLTest.exe`) used to exercise it.

## Contents delivered

| File | Purpose |
|---|---|
| `DLL\Source\RG432Test1.0.dll` | The 64-bit DLL itself |
| `DLL\Source\RG432TestExports.h` | Public header — include this to call the DLL from C |
| `DLL\DLLTest\RG432DLLTest.exe` | Delphi test harness (source included) |

## Prerequisites

- **DebugMessages** must be installed and running to see the DLL's diagnostic
  output (see [Debug messages](#debug-messages) below).
- The DLL is **64-bit only** — it must be loaded by a 64-bit process.

## Exported functions

All three functions are declared in `RG432TestExports.h`:

```c
uint8_t InitialiseDevice(char *szSerial, uint8_t *byErrorCode);
uint8_t RunTest(uint8_t byType, uint8_t *byErrorCode);
uint8_t GetResult(uint16_t *wDetails, char *szResultsFile);
```

All three currently always return `0` (success) — this is stage 1 placeholder
logic with simulated timing and no real device/hardware interaction yet.
`byErrorCode` is likewise always set to `0` for now; the parameter exists so
the calling application doesn't need to change when real error reporting is
added in a later stage.

### `InitialiseDevice(szSerial, byErrorCode)`

Call this first, before `RunTest`.

- **In:** `szSerial` — the device's serial number, as a null-terminated string.
- **Out:** `byErrorCode` — always `0` in this stage.
- **Returns:** `0` on success.

What it does:
1. Stores `szSerial` internally (used later to name the results file).
2. Simulates programming the device (a 3 second pause).
3. Reads the results-folder path from the registry (see
   [Registry configuration](#registry-configuration)) — if the registry value
   isn't set, it falls back to `.` (the process's current directory) and logs
   an error via DebugMessages.

### `RunTest(byType, byErrorCode)`

Call this after `InitialiseDevice`.

- **In:** `byType` — reserved for a future test-type selector; currently
  ignored.
- **Out:** `byErrorCode` — always `0` in this stage.
- **Returns:** `0` on success.

What it does:
1. Runs four simulated test stages (about 1 second each), each producing a
   random byte (0–6) — this stands in for a real measurement in a later stage.
2. Saves the four bytes plus the serial number to a binary file named
   `yymmdd-hhnnss-<serial>.dat` in the results folder (from
   `InitialiseDevice`'s registry lookup).

### `GetResult(wDetails, szResultsFile)`

Call this after `RunTest`, to retrieve the outcome.

- **Out:** `wDetails` — a status/detail word. Currently always the placeholder
  value `0x1234`; will carry real result codes in a later stage.
- **Out:** `szResultsFile` — the full path of the `.dat` file `RunTest` just
  wrote. **The caller must supply a buffer of at least `MAX_PATH` (260)
  characters** — the DLL does not check the buffer length.
- **Returns:** `0` on success.

## Registry configuration

The DLL reads its results-folder path from:

```
Key:   HKEY_CURRENT_USER\SOFTWARE\LittleStone\432\TestSettings
Value: szPath   (REG_SZ)
```

Set `szPath` to the folder where you want `.dat` result files written, e.g.
`D:\RG432Results`. **This value is not currently set by any of the delivered
tools** — it needs to be created manually (`regedit`, or a small `.reg`
import) before `InitialiseDevice` is called, otherwise results are written to
the current working directory and a DebugMessages error is logged as a
reminder. Example `.reg` snippet:

```reg
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\SOFTWARE\LittleStone\432\TestSettings]
"szPath"="D:\\RG432Results"
```

(A `StoreSettings` function that writes this value from code is already
implemented inside the DLL for a later stage, but nothing calls it yet.)

## Debug messages

The DLL reports its progress and any errors via the standard LittleStone
`DebugMessage` mechanism — open **DebugMessages** before running anything
that calls into `RG432Test1.0.dll`, and you'll see one line per significant
step: function entry (with its input parameters), key progress points, and
function exit (with its output parameters). Errors — such as the missing
registry value above, or a failed file write — are shown in red.

## Running the Delphi test harness

`RG432DLLTest.exe` (in `DLL\DLLTest\`) is a small Win64 form for exercising
the three functions by hand:

1. Start **DebugMessages** first, if you want to see the DLL's own log output
   alongside the test harness's own call log.
2. Run `RG432DLLTest.exe`. On startup it looks for `RG432Test1.0.dll` next to
   the EXE first; if it isn't there, it falls back to the fixed development
   path (`...\432\TestSetUp\DLL\Source\RG432Test1.0.dll`). Either copy the DLL
   next to the EXE for a self-contained folder, or leave it in the `Source`
   folder if you have that path available.
3. Enter a **Serial Number** and click **Initialise Device**.
4. Enter a **Test Type** (0–255, currently unused by the DLL) and click
   **Run Test**.
5. Click **Get Result** to see the returned details word and the results
   file path.

Each button click logs its call and the values returned in the memo at the
bottom of the form — e.g. `RunTest(Type=0) -> Result=0, ErrorCode=0`.
