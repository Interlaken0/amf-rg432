import type { BoardRegistration, TestResult } from './shared/types';

declare global {
  interface Window {
    electronAPI: {
      registerBoard: (registration: BoardRegistration) => Promise<void>;
      runTest: (serialNumber: string) => Promise<TestResult>;
      getTestHistory: () => Promise<TestResult[]>;
    };
  }
}

export {};
