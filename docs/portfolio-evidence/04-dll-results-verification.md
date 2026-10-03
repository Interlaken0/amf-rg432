# Evidence — DLL Results Verification

Proof that what the UI displays matches the literal bytes the vendor
DLL writes to disk — verification at byte level, not screen level.

## Screenshots

### `dat-hex-8fff.png` — hex dump of a real `.dat` file

`Format-Hex` on `261003-161626-RG432-001F.dat` (the terminal-fail run
from the UAT-12 dry-run), offset `0x100` onward:

```
08 0F 0F 0F   ← status digits = 0x8fff (8 = terminal fault; F = stage skipped)
98 53 8F 3F   ← QA1 (float32 LE)
05 2D 00 40   ← QA2
F4 E2 B2 BF   ← QA3
58 63 B6 BF   ← QA4
```

**Caption:** Hex view of the `.dat` file written by
`RG432Test1.1.dll`. Bytes 256–259 contain the status word `0x8fff` —
the same value shown as the red FAIL badge in the UI
(`uat12-fail-real-dll.png`). The remaining bytes are the four float32
QA values.

## Paired evidence

- `../uat/evidence/uat12-retest-real-dll.png` — amber RETEST badge for
  the `0x2fff` run (file `261003-161554-*.dat`)
- `../uat/evidence/uat12-fail-real-dll.png` — red FAIL badge for the
  `0x8fff` run shown above
- Parser that reads this layout: `code-dat-parser.png`

## What this demonstrates

- Verification against ground truth (file bytes) rather than
  trusting UI state
- Understanding of the vendor file format: offsets, endianness,
  float encoding
- End-to-end traceability: DLL output → parsed result → badge →
  persisted row → CSV export
