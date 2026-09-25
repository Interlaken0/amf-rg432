import koffi from 'koffi';
import { app } from 'electron';
import { join } from 'node:path';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import type { BoardRegistration, DllInterop, TestResult } from '../shared/types';

/**
 * DLL file name constant
 */
const DLL_FILE_NAME = 'RG432Test1.0.dll';

/**
 * Maximum path length for Windows
 */
const MAX_PATH = 260;

/**
 * Resolve the path to the DLL file
 * @returns The absolute path to the DLL
 * @throws Error if the DLL is not found
 */
function resolveDllPath(): string {
  const candidates = [
    join(app.getAppPath(), 'dll', DLL_FILE_NAME),
    join(
      (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath ?? '',
      'dll',
      DLL_FILE_NAME,
    ),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `RG432Test1.0.dll was not found. Searched: ${candidates.join(', ')}`,
  );
}

/**
 * Ensure the results directory exists and configure the registry
 * @returns The results directory path
 */
function ensureResultsPath(): string {
  const resultsPath = join(app.getPath('userData'), 'Results');
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
 * Read the 4 measurement bytes from a .dat results file
 *
 * Per the DLL reference guide, RunTest writes four measurement bytes
 * followed by the serial number, so the measurements are the first
 * bytes of the file.
 * @param filePath The path to the results file
 * @returns Array of the first 4 bytes
 * @throws Error if the file cannot be read or is too short
 */
function readMeasurementBytes(filePath: string): number[] {
  let buffer: Buffer;
  try {
    buffer = readFileSync(filePath);
  } catch (error) {
    throw new Error(`Failed to read results file ${filePath}: ${error}`);
  }

  if (buffer.length < 4) {
    throw new Error(`Results file ${filePath} is too short (${buffer.length} bytes)`);
  }

  return Array.from(buffer.subarray(0, 4));
}

/**
 * Determine pass/fail from the measurement bytes
 *
 * Stage 1 semantics: each byte is a simulated measurement in the range 0-6.
 * A test passes only if all four bytes are within that range. When Jeff's
 * final DLL documents real result codes this function should be updated to
 * match.
 * @param bytes The measurement bytes from the results file
 * @returns True if the test passed
 */
function isPassing(bytes: number[]): boolean {
  return bytes.every((byte) => byte <= 6);
}

/**
 * Create a real DLL interop instance
 * @returns The real DLL interop instance
 */
export function createRealDllInterop(): DllInterop {
  const lib = koffi.load(resolveDllPath());

  const initialiseDevice = lib.func(
    'uint8_t __cdecl InitialiseDevice(const char *szSerial, _Out_ uint8_t *byErrorCode)',
  );
  const runTestFn = lib.func(
    'uint8_t __cdecl RunTest(uint8_t byType, _Out_ uint8_t *byErrorCode)',
  );
  const getResult = lib.func(
    'uint8_t __cdecl GetResult(_Out_ uint16_t *wDetails, _Out_ char *szResultsFile)',
  );

  /**
   * Call the InitialiseDevice DLL function
   * @param serialNumber The board serial number
   * @throws Error if the DLL call fails
   */
  function callInitialiseDevice(serialNumber: string): void {
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
   * @param testType The test type (0 for standard test)
   * @throws Error if the DLL call fails
   */
  function callRunTest(testType: number): void {
    const errorCode = [0];
    const result = runTestFn(testType, errorCode);

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
  function callGetResult(): { details: number; resultsFile: string } {
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
      ensureResultsPath();
      callInitialiseDevice(registration.serialNumber);
    },

    runTest: async (serialNumber: string): Promise<TestResult> => {
      callRunTest(0);
      const { details, resultsFile } = callGetResult();
      const bytes = readMeasurementBytes(resultsFile);
      const passed = isPassing(bytes);

      return {
        id: 0,
        serialNumber,
        operator: '',
        timestamp: new Date().toISOString(),
        status: passed ? 'pass' : 'fail',
        diagnostics: `Details=0x${details.toString(16).padStart(4, '0')}, measurements=[${bytes.join(',')}], file=${resultsFile}`,
      };
    },

    getTestHistory: async (): Promise<TestResult[]> => [],
  };
}
