import koffi from 'koffi';
import { join } from 'node:path';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import type { BoardRegistration, DllInterop, TestResult } from '../shared/types';

/**
 * DLL file name constant
 */
const DLL_FILE_NAME = 'RG432Test1.1.dll';

/**
 * Maximum path length for Windows
 */
const MAX_PATH = 260;

/**
 * Resolve the app path, falling back to the working directory when
 * Electron is not available (e.g. running under vitest)
 */
async function appPath(): Promise<string> {
  try {
    const electron = (await import('electron')) as {
      app?: { getAppPath?: () => string };
    };
    return electron.app?.getAppPath?.() ?? process.cwd();
  } catch {
    return process.cwd();
  }
}

/**
 * Resolve the Electron userData path, falling back to a local
 * directory or the RG432_USERDATA environment variable when
 * Electron is not available
 */
async function userDataPath(): Promise<string> {
  const fallback = process.env.RG432_USERDATA ?? join(process.cwd(), 'userdata');
  try {
    const electron = (await import('electron')) as {
      app?: { getPath?: (name: string) => string };
    };
    return electron.app?.getPath?.('userData') ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Resolve the path to the DLL file
 * @returns The absolute path to the DLL
 * @throws Error if the DLL is not found
 */
async function resolveDllPath(): Promise<string> {
  // An explicit override is authoritative: fail if it points nowhere
  if (process.env.RG432_DLL_PATH) {
    if (existsSync(process.env.RG432_DLL_PATH)) {
      return process.env.RG432_DLL_PATH;
    }
    throw new Error(`RG432_DLL_PATH does not exist: ${process.env.RG432_DLL_PATH}`);
  }

  const base = await appPath();
  const candidates = [
    join(base, 'dll', DLL_FILE_NAME),
    join(process.cwd(), 'dll', DLL_FILE_NAME),
    join(
      (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath ?? '',
      'dll',
      DLL_FILE_NAME,
    ),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `${DLL_FILE_NAME} was not found. Searched: ${candidates.join(', ')}`,
  );
}

/**
 * Ensure the results directory exists and configure the registry
 * @returns The results directory path
 */
async function ensureResultsPath(): Promise<string> {
  const resultsPath = join(await userDataPath(), 'Results');
  mkdirSync(resultsPath, { recursive: true });

  const key = 'HKCU\\SOFTWARE\\LittleStone\\432\\TestSettings';
  try {
    execFileSync('reg.exe', ['add', key, '/f'], { windowsHide: true });
    execFileSync(
      'reg.exe',
      ['add', key, '/v', 'szPath', '/t', 'REG_SZ', '/d', resultsPath, '/f'],
      { windowsHide: true },
    );
  } catch (error) {
    console.warn('Failed to write registry results path:', error);
  }

  return resultsPath;
}

/**
 * Parsed contents of a stage-2 .dat results file
 */
interface ResultsFile {
  serial: string;
  /** Status digit values 0-15, one per test stage (0xF = skipped) */
  digits: number[];
  /** Four float32 QA values, in the order generated */
  qa: number[];
}

/**
 * Stage names for the four test stages, supplied by Jeff
 */
const STAGE_NAMES = [
  'input data acquisition',
  'output data generation',
  'spectral tests',
  'algorithm accuracy',
];

/**
 * Meaning of each status digit in the wDetails word and the .dat file
 */
const DIGIT_MEANINGS: Record<number, string> = {
  0: 'pass',
  1: 'board not connected',
  2: 'connexion faulty',
  3: 'board not communicating',
  4: 'no output generated',
  5: 'no input detected',
  6: 'maths error',
  7: 'output waveform faulty',
  8: 'input waveform faulty',
  9: 'spectral distortion',
  15: 'test skipped',
};

const SKIPPED = 0xf;

/**
 * Parse a stage-2 .dat results file written by RunTest
 *
 * Empirically verified 276-byte layout (RG432Test1.1.dll):
 *   offset 0     256 bytes  serial, ASCII null-padded
 *   offset 256   4 bytes    status digits, one byte per test (0-F)
 *   offset 260   16 bytes   four float32 LE QA values
 * @param filePath The path to the results file
 * @returns The parsed serial, status digits and QA values
 * @throws Error if the file cannot be read or is too short
 */
function parseResultsFile(filePath: string): ResultsFile {
  let buffer: Buffer;
  try {
    buffer = readFileSync(filePath);
  } catch (error) {
    throw new Error(`Failed to read results file ${filePath}: ${error}`);
  }

  if (buffer.length < 276) {
    throw new Error(`Results file ${filePath} is too short (${buffer.length} bytes)`);
  }

  const nullIndex = buffer.indexOf(0);
  const serialEnd = nullIndex === -1 ? 256 : Math.min(nullIndex, 256);
  const serial = buffer.subarray(0, serialEnd).toString('latin1');

  const digits = Array.from(buffer.subarray(buffer.length - 20, buffer.length - 16));
  const qa = [
    buffer.readFloatLE(buffer.length - 16),
    buffer.readFloatLE(buffer.length - 12),
    buffer.readFloatLE(buffer.length - 8),
    buffer.readFloatLE(buffer.length - 4),
  ];

  return { serial, digits, qa };
}

/**
 * Decode the four status digits into a human-readable summary of the
 * first failing stage. A test that fails skips the remaining stages, so
 * the first non-zero, non-skipped digit is the one that matters.
 * @param digits The four status digit values
 * @returns The decoded summary, or the pass message
 */
function decodeStatus(digits: number[]): string {
  const firstFailure = digits.findIndex((digit) => digit !== 0 && digit !== SKIPPED);
  if (firstFailure === -1) {
    return 'All four tests passed';
  }
  const meaning = DIGIT_MEANINGS[digits[firstFailure]] ?? `unknown code ${digits[firstFailure]}`;
  return `Test ${firstFailure + 1} (${STAGE_NAMES[firstFailure]}): ${meaning}`;
}

/**
 * Determine pass/fail from the status digits - stage-2 semantics: only
 * an all-zero word means pass.
 * @param digits The four status digit values
 * @returns True if the test passed
 */
function isPassing(digits: number[]): boolean {
  return digits.every((digit) => digit === 0);
}

/**
 * Determine whether a failed result is retryable. Per Jeff: digits 6-9
 * are outright failures; any other failure is a connexion-type fault
 * that may be retested.
 * @param digits The four status digit values
 * @returns True if the operator may retry the test
 */
function isRetryable(digits: number[]): boolean {
  return !isPassing(digits) && !digits.some((digit) => digit >= 6 && digit <= 9);
}

/**
 * Loaded DLL function bindings
 */
interface DllFunctions {
  initialiseDevice: (serialNumber: string, errorCode: number[]) => number;
  runTestFn: (testType: number, errorCode: number[]) => number;
  getResult: (wDetails: number[], resultsBuffer: Buffer) => number;
}

/**
 * Create a real DLL interop instance
 * @returns The real DLL interop instance
 */
export function createRealDllInterop(): DllInterop {
  /**
   * Lazily loaded DLL bindings - loaded on first call so the module
   * can be imported in environments without the DLL present
   */
  let libPromise: Promise<DllFunctions> | null = null;

  /**
   * Load the DLL and bind the exported functions
   * @returns The bound DLL functions
   */
  async function loadLib(): Promise<DllFunctions> {
    const lib = koffi.load(await resolveDllPath());

    return {
      initialiseDevice: lib.func(
        'uint8_t __cdecl InitialiseDevice(const char *szSerial, _Out_ uint8_t *byErrorCode)',
      ),
      runTestFn: lib.func(
        'uint8_t __cdecl RunTest(uint8_t byType, _Out_ uint8_t *byErrorCode)',
      ),
      getResult: lib.func(
        'uint8_t __cdecl GetResult(_Out_ uint16_t *wDetails, _Out_ char *szResultsFile)',
      ),
    };
  }

  /**
   * Get the loaded DLL functions, loading them on first use
   * @returns The bound DLL functions
   */
  function getLib(): Promise<DllFunctions> {
    libPromise ??= loadLib();
    return libPromise;
  }

  /**
   * Call the InitialiseDevice DLL function
   * @param serialNumber The board serial number
   * @throws Error if the DLL call fails
   */
  async function callInitialiseDevice(serialNumber: string): Promise<void> {
    const { initialiseDevice } = await getLib();
    const errorCode = [0];
    const result = initialiseDevice(serialNumber, errorCode);

    if (result !== 0) {
      throw new Error(
        `InitialiseDevice failed with return code ${result} and error code ${errorCode[0]}`,
      );
    }
  }

  /**
   * Call the RunTest DLL function
   * @param failurePercent Overall failure probability 0-100 (stage-2
   *   byType semantics - the DLL derives a per-test rate internally)
   * @throws Error if the DLL call fails
   */
  async function callRunTest(failurePercent: number): Promise<void> {
    const { runTestFn } = await getLib();
    const errorCode = [0];
    const result = runTestFn(failurePercent, errorCode);

    if (result !== 0) {
      throw new Error(
        `RunTest failed with return code ${result} and error code ${errorCode[0]}`,
      );
    }
  }

  /**
   * Call the GetResult DLL function
   * @returns Object containing details and results file path
   * @throws Error if the DLL call fails
   */
  async function callGetResult(): Promise<{ details: number; resultsFile: string }> {
    const { getResult } = await getLib();
    const wDetails = [0];
    const resultsBuffer = Buffer.alloc(MAX_PATH);
    const result = getResult(wDetails, resultsBuffer);

    if (result !== 0) {
      throw new Error(`GetResult failed with return code ${result}`);
    }

    const nullIndex = resultsBuffer.indexOf(0);
    const fileLength = nullIndex === -1 ? MAX_PATH : nullIndex;
    const resultsFile = koffi.decode(resultsBuffer, 'char', fileLength);

    return { details: wDetails[0], resultsFile };
  }

  return {
    registerBoard: async (registration: BoardRegistration): Promise<void> => {
      await ensureResultsPath();
      await callInitialiseDevice(registration.serialNumber);
    },

    runTest: async (serialNumber: string, failurePercent = 0): Promise<TestResult> => {
      await callRunTest(failurePercent);
      const { details, resultsFile } = await callGetResult();
      const { serial, digits, qa } = parseResultsFile(resultsFile);

      if (serial !== serialNumber) {
        throw new Error(
          `Results file serial mismatch: expected ${serialNumber}, file contains ${serial}`,
        );
      }

      const passed = isPassing(digits);
      const statusDetails = `0x${details.toString(16).padStart(4, '0')}`;
      const testSummary = decodeStatus(digits);

      return {
        id: 0,
        serialNumber,
        operator: '',
        timestamp: new Date().toISOString(),
        status: passed ? 'pass' : 'fail',
        retryable: isRetryable(digits),
        statusDetails,
        testSummary,
        qa,
        diagnostics: `Details=${statusDetails}, summary="${testSummary}", qa=[${qa.join(',')}], file=${resultsFile}`,
      };
    },
  };
}
