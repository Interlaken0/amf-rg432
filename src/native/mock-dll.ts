import type { BoardRegistration, TestResult } from '../shared/types';

const registeredBoards: Map<string, BoardRegistration> = new Map();
const testResults: TestResult[] = [];
let resultId = 1;

export async function registerBoard(registration: BoardRegistration): Promise<void> {
  registeredBoards.set(registration.serialNumber, registration);
}

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

export async function getTestHistory(): Promise<TestResult[]> {
  return [...testResults];
}
