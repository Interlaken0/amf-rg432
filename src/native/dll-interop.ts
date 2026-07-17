import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { BoardRegistration, DllInterop, TestResult } from '../shared/types';
import { createMockDllInterop } from './mock-dll';
import { createRealDllInterop } from './real-dll';

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

export function createDllInterop(): DllInterop {
  if (isRealDllAvailable()) {
    return createRealDllInterop();
  }
  return createMockDllInterop();
}

export type { BoardRegistration, TestResult };
