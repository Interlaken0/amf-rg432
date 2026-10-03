# Evidence — Testing

Automated verification: unit, integration, live-DLL, and security
testing.

## Screenshots

### `tests-52-passing.png` — full suite run

`npm test` output: **12 test files, 52 tests, all green** — including
`real-dll.integration.test.ts`, which runs the genuine register → test →
persist cycle against the real `RG432Test1.1.dll` (visible in the
expanded lines: ~7.2s full cycle, ~4s fault-injection decode).

**Caption:** Full test suite — 52 tests across 12 files, including a
live real-DLL integration suite that exercises the vendor DLL end to
end and decodes a guaranteed failure at 100% fault injection.

### `test-injection.png` — `tests/test-repository.test.ts` (lines 131–148)

The hostile-input test: a serial and operator containing `DROP TABLE`
payloads are passed through the repository; the assertions verify the
values are stored literally and both tables still respond to queries.

**Caption:** Injection-resistance test — SQL-metacharacter input is
treated as data, not code. The parameterised-query claim is proven in a
test, not merely asserted in documentation.

## What this demonstrates

- A range of test types: unit, integration, live-vendor, security
- Tests that encode the contract (status-word shape, skipped stages,
  retry gating) — not just happy paths
- Regression protection: the suite runs in CI on every push
  (`process-actions-green.png`)
