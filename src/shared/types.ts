export interface BoardRegistration {
  serialNumber: string;
  operator: string;
  timestamp: string;
}

export interface TestResult {
  id: number;
  serialNumber: string;
  operator: string;
  timestamp: string;
  status: 'pass' | 'fail' | 'pending';
  diagnostics?: string;
}

export interface DllInterop {
  registerBoard: (registration: BoardRegistration) => Promise<void>;
  runTest: (serialNumber: string) => Promise<TestResult>;
  getTestHistory: () => Promise<TestResult[]>;
}
