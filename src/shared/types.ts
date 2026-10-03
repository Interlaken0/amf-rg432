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
  /** Raw wDetails status word, e.g. "0x2fff" (real DLL results) */
  statusDetails?: string;
  /** Decoded first-failure summary, e.g. "Test 2 (output data generation): no output generated" */
  testSummary?: string;
  /** Four QA float values from the results file */
  qa?: number[];
  /** True when the failure is connexion-type and the test may be retried */
  retryable?: boolean;
}

/**
 * DLL interop interface for native hardware calls
 */
export interface DllInterop {
  registerBoard: (registration: BoardRegistration) => Promise<void>;
  /**
   * Run a test for a registered board
   * @param serialNumber The board serial number
   * @param failurePercent Overall failure probability 0-100 passed to
   *   the stage-2 DLL's RunTest(byType); the mock maps it onto its
   *   simulated fail rate. Defaults to 0 (always pass).
   */
  runTest: (serialNumber: string, failurePercent?: number) => Promise<TestResult>;
}
