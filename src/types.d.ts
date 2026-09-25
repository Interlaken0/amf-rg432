/**
 * Global type declarations for the Electron API
 */
import type { BoardRegistration, TestResult } from './shared/types';

/**
 * Extend the Window interface to include the Electron API
 */
declare global {
  interface Window {
    electronAPI: {
      registerBoard: (registration: BoardRegistration) => Promise<void>;
      runTest: (serialNumber: string) => Promise<TestResult>;
      isBoardRegistered: (serialNumber: string) => Promise<boolean>;
      getTestHistory: () => Promise<TestResult[]>;
      getMockMode: () => Promise<boolean>;
      setMockMode: (enabled: boolean) => Promise<boolean>;
      exportBatchReport: () => Promise<string | null>;
    };
  }
}

export {};
