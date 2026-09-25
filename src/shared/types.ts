/**
 * Board registration details
 */
export interface BoardRegistration {
  serialNumber: string;
  operator: string;
  timestamp: string;
}

/**
 * Test result details
 */
export interface TestResult {
  id: number;
  serialNumber: string;
  operator: string;
  timestamp: string;
  status: 'pass' | 'fail' | 'pending';
  diagnostics?: string;
}

/**
 * DLL interop interface for native hardware calls
 */
export interface DllInterop {
  registerBoard: (registration: BoardRegistration) => Promise<void>;
  runTest: (serialNumber: string) => Promise<TestResult>;
  getTestHistory: () => Promise<TestResult[]>;
}
