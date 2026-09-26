import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { DllInterop } from '../shared/types';
import { createMockDllInterop } from './mock-dll';
import { createRealDllInterop } from './real-dll';

/**
 * Check if the real DLL is available on the system
 * @returns True if the DLL is available, false otherwise
 */
function isRealDllAvailable(): boolean {
  if (process.platform !== 'win32') {
    return false;
  }

  const candidates = [
    join(process.cwd(), 'dll', 'RG432Test1.0.dll'),
    join(
      (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath ?? '',
      'dll',
      'RG432Test1.0.dll',
    ),
  ];

  return candidates.some(existsSync);
}

/**
 * Options for creating a DLL interop instance
 */
export interface DllInteropOptions {
  forceMock?: boolean;
}

/**
 * Create a DLL interop instance, using the real DLL if available or falling back to mock
 * @param options Options controlling which interop to create
 * @returns The DLL interop instance
 */
export function createDllInterop(options?: DllInteropOptions): DllInterop {
  if (!options?.forceMock && isRealDllAvailable()) {
    return createRealDllInterop();
  }
  return createMockDllInterop();
}
