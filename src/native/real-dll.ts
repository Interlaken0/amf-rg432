import koffi from 'koffi';
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
    `RG432Test1.0.dll was not found. Searched: ${candidates.join(', ')}`,
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
   * @param testType The test type (0 for standard test)
   * @throws Error if the DLL call fails
   */
  async function callRunTest(testType: number): Promise<void> {
    const { runTestFn } = await getLib();
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

    runTest: async (serialNumber: string): Promise<TestResult> => {
      await callRunTest(0);
      const { details, resultsFile } = await callGetResult();
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
