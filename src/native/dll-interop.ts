import type { BoardRegistration, DllInterop, TestResult } from '../shared/types';
import * as mockDll from './mock-dll';

export function createDllInterop(): DllInterop {
  // TODO: replace mock with Koffi FFI calls once Jeff supplies the DLL
  return {
    registerBoard: mockDll.registerBoard,
    runTest: mockDll.runTest,
    getTestHistory: mockDll.getTestHistory,
  };
}

export type { BoardRegistration, TestResult };
