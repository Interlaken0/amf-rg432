import type { BoardRegistration, DllInterop, TestResult } from '../shared/types';

/**
 * In-memory storage for mock board registrations
 */
const registeredBoards: Map<string, BoardRegistration> = new Map();

/**
 * In-memory storage for mock test results
 */
const testResults: TestResult[] = [];

/**
 * Counter for generating mock test result IDs
 */
let resultId = 1;

/**
 * Register a board in the mock DLL
 * @param registration The board registration details
 */
export async function registerBoard(registration: BoardRegistration): Promise<void> {
  registeredBoards.set(registration.serialNumber, registration);
}

/**
 * Run a mock test for a board
 * @param serialNumber The board serial number
 * @returns The test result (90% pass rate for simulation)
 * @throws Error if the board has not been registered
 */
export async function runTest(serialNumber: string): Promise<TestResult> {
  const board = registeredBoards.get(serialNumber);

  if (!board) {
    throw new Error(`Board ${serialNumber} has not been registered`);
  }

  const isPass = Math.random() > 0.1;
  const result: TestResult = {
    id: resultId++,
    serialNumber,
    operator: board.operator,
    timestamp: new Date().toISOString(),
    status: isPass ? 'pass' : 'fail',
    diagnostics: isPass ? undefined : 'Mock failure: simulated DLL returned error flag 0x01',
  };

  testResults.push(result);
  return result;
}

/**
 * Get the mock test history
 * @returns Array of all mock test results
 */
export async function getTestHistory(): Promise<TestResult[]> {
  return [...testResults];
}

/**
 * Create a mock DLL interop instance
 * @returns The mock DLL interop instance
 */
export function createMockDllInterop(): DllInterop {
  return {
    registerBoard,
    runTest,
    getTestHistory,
  };
}
