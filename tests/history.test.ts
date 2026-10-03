/**
 * Shared history-filter tests - the same predicate drives the renderer
 * table and the batch-report export
 */
import { describe, it, expect } from 'vitest';
import { filterTestHistory } from '../src/shared/history';
import type { TestResult } from '../src/shared/types';

const tests: TestResult[] = [
  {
    id: 1,
    serialNumber: 'RG432-0001',
    operator: 'Dave',
    timestamp: '2026-09-20T10:00:00',
    status: 'pass',
  },
  {
    id: 2,
    serialNumber: 'RG432-0002',
    operator: 'Greg',
    timestamp: '2026-09-21T14:30:00',
    status: 'fail',
    statusDetails: '0x7fff',
  },
  {
    id: 3,
    serialNumber: 'RG432-0003',
    operator: 'Sarah',
    timestamp: '2026-09-22T09:15:00',
    status: 'fail',
    statusDetails: '0x3fff',
  },
];

describe('filterTestHistory', () => {
  it('returns everything for a blank query', () => {
    expect(filterTestHistory(tests, '')).toHaveLength(3);
    expect(filterTestHistory(tests, '   ')).toHaveLength(3);
  });

  it('matches serial and operator case-insensitively', () => {
    expect(filterTestHistory(tests, 'rg432-0001')).toHaveLength(1);
    expect(filterTestHistory(tests, 'GREG')).toHaveLength(1);
  });

  it('matches status and formatted date fragments', () => {
    expect(filterTestHistory(tests, 'fail')).toHaveLength(2);
    expect(filterTestHistory(tests, '2026')).toHaveLength(3);
  });

  it('matches the derived retest state for retryable status words', () => {
    const retests = filterTestHistory(tests, 'retest');
    expect(retests).toHaveLength(1);
    expect(retests[0].serialNumber).toBe('RG432-0003');
    // terminal fails are still fails, not retests
    expect(retests[0].statusDetails).toBe('0x3fff');
  });
});
