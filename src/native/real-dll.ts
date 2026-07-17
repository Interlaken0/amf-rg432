import koffi from 'koffi';
import { app } from 'electron';
import { join } from 'node:path';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import type { BoardRegistration, DllInterop, TestResult } from '../shared/types';

const DLL_FILE_NAME = 'RG432Test1.0.dll';
const MAX_PATH = 260;

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

function readDatBytes(filePath: string): number[] {
  try {
    const buffer = readFileSync(filePath);
    const start = Math.max(0, buffer.length - 4);
    return Array.from(buffer.subarray(start));
  } catch (error) {
    throw new Error(`Failed to read results file ${filePath}: ${error}`);
  }
}

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

  function callInitialiseDevice(serialNumber: string): void {
    const errorCode = [0];
    const result = initialiseDevice(serialNumber, errorCode);

    if (result !== 0) {
      throw new Error(
        `InitialiseDevice failed with return code ${result} and error code ${errorCode[0]}`,
      );
    }
  }

  function callRunTest(testType: number): void {
    const errorCode = [0];
    const result = runTestFn(testType, errorCode);

    if (result !== 0) {
      throw new Error(
        `RunTest failed with return code ${result} and error code ${errorCode[0]}`,
      );
    }
  }

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
      const bytes = readDatBytes(resultsFile);

      return {
        id: 0,
        serialNumber,
        operator: '',
        timestamp: new Date().toISOString(),
        status: 'pass',
        diagnostics: `Details=0x${details.toString(16)}, raw bytes=[${bytes.join(',')}], file=${resultsFile}`,
      };
    },

    getTestHistory: async (): Promise<TestResult[]> => [],
  };
}
