import type { BoardRegistration, DllInterop, TestResult } from '../shared/types';

/**
 * Options controlling mock hardware simulation
 */
export interface MockDllOptions {
  /**
   * Simulate real hardware timing (programming delay, per-stage test delay).
   * Disable in tests to keep them fast.
   */
  simulateTiming?: boolean;
  /**
   * Probability (0-1) that a test run simulates a USB disconnect,
   * throwing an error like a real hardware fault would.
   */
  disconnectRate?: number;
  /**
   * Probability (0-1) that a completed test returns a fail result.
   * Higher while demoing so the FAIL path is easy to show; the real
   * failure rate is whatever the production boards produce.
   */
  failRate?: number;
}

/**
 * In-memory storage for mock board registrations
 */
const registeredBoards: Map<string, BoardRegistration> = new Map();

/**
 * Counter for generating mock test result IDs
 */
let resultId = 1;

/**
 * Mock hardware connection state - simulates the device being
 * connected after InitialiseDevice-style registration
 */
let deviceConnected = false;

/**
 * Simulated delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
 * @param failRate Probability (0-1) of a fail result
 * @returns The test result
 * @throws Error if the board has not been registered
 */
export async function runTest(serialNumber: string, failRate = 0.5): Promise<TestResult> {
  const board = registeredBoards.get(serialNumber);

  if (!board) {
    throw new Error(`Board ${serialNumber} has not been registered`);
  }

  const isPass = Math.random() >= failRate;
  const result: TestResult = {
    id: resultId++,
    serialNumber,
    operator: board.operator,
    timestamp: new Date().toISOString(),
    status: isPass ? 'pass' : 'fail',
    diagnostics: isPass ? undefined : 'Mock failure: simulated DLL returned error flag 0x01',
  };

  return result;
}

/**
 * Create a mock DLL interop instance
 * @param options Mock simulation options
 * @returns The mock DLL interop instance
 */
export function createMockDllInterop(options?: MockDllOptions): DllInterop {
  const { simulateTiming = true, disconnectRate = 0.05, failRate = 0.5 } = options ?? {};

  return {
    /**
     * Register a board - simulates the ~3s programming delay of
     * InitialiseDevice in the real DLL and connects the device
     */
    registerBoard: async (registration: BoardRegistration): Promise<void> => {
      if (simulateTiming) {
        await delay(3000);
      }
      deviceConnected = true;
      await registerBoard(registration);
    },

    /**
     * Run a test - simulates four ~1s test stages like the real RunTest,
     * can simulate a USB disconnect, and requires a connected device
     */
    runTest: async (serialNumber: string): Promise<TestResult> => {
      if (!deviceConnected || !registeredBoards.has(serialNumber)) {
        throw new Error(`Board ${serialNumber} has not been registered`);
      }

      const willDisconnect = Math.random() < disconnectRate;
      for (let stage = 0; stage < 4; stage++) {
        if (simulateTiming) {
          await delay(1000);
        }
        if (willDisconnect && stage === 2) {
          deviceConnected = false;
          throw new Error('Simulated hardware fault: USB device disconnected mid-test');
        }
      }

      return runTest(serialNumber, failRate);
    },
  };
}
