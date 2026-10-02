/**
 * Probe RG432Test1.1.dll directly through Koffi to verify the stage-2
 * results file layout empirically. Writes .dat files to a temp results
 * directory, then dumps their structure.
 *
 * Run: npx vite-node scripts/probe-dll.ts
 */
import koffi from 'koffi';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DLL_PATH = join(process.cwd(), 'dll', 'RG432Test1.1.dll');
const RESULTS_DIR = join(tmpdir(), 'rg432-probe-results');
const MAX_PATH = 260;

mkdirSync(RESULTS_DIR, { recursive: true });

// Point the DLL's registry lookup at our temp results directory
const key = 'HKCU\\SOFTWARE\\LittleStone\\432\\TestSettings';
execFileSync('reg.exe', ['add', key, '/f'], { windowsHide: true });
execFileSync(
  'reg.exe',
  ['add', key, '/v', 'szPath', '/t', 'REG_SZ', '/d', RESULTS_DIR, '/f'],
  { windowsHide: true },
);
console.log(`Results dir: ${RESULTS_DIR}\n`);

const lib = koffi.load(DLL_PATH);
const InitialiseDevice = lib.func(
  'uint8_t __cdecl InitialiseDevice(const char *szSerial, _Out_ uint8_t *byErrorCode)',
);
const RunTest = lib.func(
  'uint8_t __cdecl RunTest(uint8_t byType, _Out_ uint8_t *byErrorCode)',
);
const GetResult = lib.func(
  'uint8_t __cdecl GetResult(_Out_ uint16_t *wDetails, _Out_ char *szResultsFile)',
);

function runOnce(serial: string, failPercent: number): void {
  const err = [0];
  const initRet = InitialiseDevice(serial, err);
  console.log(`InitialiseDevice("${serial}") -> ret=${initRet} err=${err[0]}`);

  const runRet = RunTest(failPercent, err);
  console.log(`RunTest(${failPercent}) -> ret=${runRet} err=${err[0]}`);

  const details = [0];
  const buf = Buffer.alloc(MAX_PATH);
  const getRet = GetResult(details, buf);
  const nullIdx = buf.indexOf(0);
  const filePath = buf.subarray(0, nullIdx === -1 ? MAX_PATH : nullIdx).toString('latin1');
  console.log(
    `GetResult -> ret=${getRet} wDetails=0x${details[0].toString(16).padStart(4, '0')}`,
  );
  console.log(`  file: ${filePath}`);

  const dat = readFileSync(filePath);
  console.log(`  size: ${dat.length} bytes`);

  // Serial: bytes before first NUL
  const serialEnd = dat.indexOf(0);
  console.log(`  first NUL at offset: ${serialEnd}`);
  console.log(`  serial: "${dat.subarray(0, serialEnd).toString('latin1')}"`);

  // Region between serial field end and QA floats - is anything there?
  const mid = dat.subarray(256, dat.length - 16);
  console.log(
    `  bytes 256..${dat.length - 16} (${mid.length} bytes): ${mid.length > 0 ? mid.toString('hex').slice(0, 64) : 'none'}`,
  );

  // Last 16 bytes as four float32 LE (the documented QA values)
  const qa = [
    dat.readFloatLE(dat.length - 16),
    dat.readFloatLE(dat.length - 12),
    dat.readFloatLE(dat.length - 8),
    dat.readFloatLE(dat.length - 4),
  ];
  console.log(`  QA floats (last 16 bytes): [${qa.map((v) => v.toFixed(4)).join(', ')}]`);

  // Full tail hex for eyeballing
  const tail = dat.subarray(Math.max(0, dat.length - 32));
  console.log(`  last 32 bytes hex: ${tail.toString('hex')}\n`);
}

const serial = 'RG432-00A1';
console.log('=== Run 1: failPercent=0 (expect all pass, 0x0000) ===');
runOnce(serial, 0);

console.log('=== Run 2: failPercent=100 (expect a fail digit + F skips) ===');
runOnce(serial, 100);

console.log('=== Files written ===');
for (const f of readdirSync(RESULTS_DIR)) {
  console.log(' ', f, readFileSync(join(RESULTS_DIR, f)).length, 'bytes');
}
