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

Per the stage-1 reference guide, the file is a flat binary record with no
header:

```
Offset  Size    Content
0       4 bytes Four measurement bytes, each a random value 0–6
4       N bytes Serial number (ASCII, as passed to InitialiseDevice)
```

There is no length prefix, checksum, or footer — the measurement block is
exactly the first four bytes and everything after is the serial string.

## 3. Processing pipeline

```
RunTest ──writes──> <Results>/<file>.dat
   │
GetResult ──returns──> wDetails (uint16) + szResultsFile path
   │
readMeasurementBytes() ──reads──> first 4 bytes → [b0, b1, b2, b3]
   │
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
- A missing/unreadable/short (<4 byte) `.dat` file throws with the path in
  the message, so the diagnostic log shows which file failed.
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
   `readMeasurementBytes()` and this document change; the pipeline and the
   SQLite linkage stay as they are.

The DLL location can also be overridden without a rebuild via the
`RG432_DLL_PATH` environment variable.
