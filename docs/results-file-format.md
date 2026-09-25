# RG432 Results File (.dat) Format & Processing

Documents the output file written by `RunTest` in the RG432 DLL, how the
application locates and parses it, and how the parsed data is linked to the
SQLite test history. Based on the stage-1 DLL reference guide
(`dll/RG432Test1.0_ReadMe.md`).

## 1. File creation

`RunTest(byType, byErrorCode)` writes a binary `.dat` file into the results
directory. The directory is configured through the Windows registry key the
DLL reads:

```
HKCU\SOFTWARE\LittleStone\432\TestSettings
  szPath (REG_SZ) = <results directory>
```

The application sets `szPath` to `userData/Results` on every board
registration (`ensureResultsPath` in `src/native/real-dll.ts`), so results
land alongside the SQLite database rather than in a fixed system path.

`GetResult(wDetails, szResultsFile)` returns the absolute path of the file
the last `RunTest` wrote, so the app never has to guess the filename.

## 2. Binary layout

Verified empirically against real stage-1 output (the readme's ordering
description is misleading): the serial number comes **first** as a
null-padded ASCII field, and the measurement bytes are the **last** four
bytes of the file.

```
Offset          Size        Content
0               256 bytes   Serial number, ASCII, null-padded
                            (e.g. "54321" followed by NUL bytes)
len − 4         4 bytes     Four measurement bytes, each 0–6
```

A real file for serial `54321` is exactly 260 bytes:

```
35 34 33 32 31 00 00 ... 00 | 06 03 06 06
└─ serial "54321" + NUL padding (256 bytes) ─┘ └ measurements ┘
```

There is no length prefix, checksum, or footer. `parseResultsFile()`
extracts the serial from the bytes before the first NUL and reads the
measurements from the trailing four bytes, so it still works if the
serial field size changes.

## 3. Processing pipeline

```
RunTest ──writes──> <Results>/<file>.dat
   │
GetResult ──returns──> wDetails (uint16) + szResultsFile path
   │
parseResultsFile() ──reads──> serial (NUL-trimmed prefix)
                            + last 4 bytes → [b0, b1, b2, b3]
   │
serial check ──throws if file serial ≠ registered serial──>
isPassing() ──derives──> status: 'pass' | 'fail'
   │
diagnostics string ──stored──> tests.diagnostics column (SQLite)
```

### Pass/fail semantics (stage-1 assumption)

Each measurement byte is documented as a random value 0–6, so a test passes
when **all four bytes are ≤ 6**. This is a placeholder interpretation: the
stage-1 DLL always returns `0` for `wDetails` (`GetResult` returns `0x1234`)
and real result codes are not yet defined. `isPassing()` in
`src/native/real-dll.ts` is the single point to update when the final DLL
documents its real semantics.

### Failure handling

- Non-zero return or error codes from any DLL call throw immediately — the
  file is never read on a failed call.
- A missing/unreadable/short `.dat` file throws with the path in the
  message, so the diagnostic log shows which file failed.
- A `.dat` whose embedded serial doesn't match the board under test throws
  a mismatch error — guards against reading a stale file from a previous
  test run.
- All failures surface through the IPC layer to the operator UI and are
  written to `userData/logs/` by the diagnostics logger.

## 4. Link to SQLite

The `diagnostics` string stored per test row contains everything needed to
trace a result back to the raw hardware output:

```
Details=0x1234, measurements=[4,2,0,6], file=C:\...\Results\<file>.dat
```

- `tests.diagnostics` keeps the parsed bytes, the raw `wDetails` word, and
  the source file path — so a disputed result can be re-checked against the
  original `.dat`.
- `tests.status` stores the derived pass/fail used by history views and
  batch reports.
- The join to `boards` via `board_id` ties each `.dat` artefact to a
  registered serial number and operator.

## 5. When the final DLL arrives

Two things may change and both are contained:

1. **`wDetails` semantics** — if the final DLL encodes pass/fail in the
   details word, update `isPassing()` (and possibly drop the byte check).
2. **File layout** — if the final format differs, only
   `parseResultsFile()` and this document change; the pipeline and the
   SQLite linkage stay as they are. The layout documented above was
   verified against real stage-1 output, not just the readme — the readme
   alone was misleading once already.

The DLL location can also be overridden without a rebuild via the
`RG432_DLL_PATH` environment variable.
