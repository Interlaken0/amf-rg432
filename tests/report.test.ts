/**
 * Batch report module tests
 */
import { describe, it, expect } from 'vitest';
import { buildBatchReportCsv, summariseTests } from '../src/main/report';
import type { TestResult } from '../src/shared/types';

const sampleTests: TestResult[] = [
  { id: 1, serialNumber: 'RG432-0001', operator: 'Dave', timestamp: '2026-09-20T10:00:00Z', status: 'pass' },
  { id: 2, serialNumber: 'RG432-0002', operator: 'Dave', timestamp: '2026-09-21T10:00:00Z', status: 'fail', diagnostics: 'Error flag 0x01' },
  { id: 3, serialNumber: 'RG432-0003', operator: 'Sarah', timestamp: '2026-09-22T10:00:00Z', status: 'pass' },
];

describe('summariseTests', () => {
  it('counts totals and computes pass rate', () => {
    const summary = summariseTests(sampleTests);
    expect(summary.total).toBe(3);
    expect(summary.passed).toBe(2);
    expect(summary.failed).toBe(1);
    expect(summary.passRate).toBeCloseTo(2 / 3);
  });

  it('groups statistics by operator', () => {
    const summary = summariseTests(sampleTests);
    expect(summary.byOperator['Dave']).toEqual({ total: 2, passed: 1, failed: 1 });
    expect(summary.byOperator['Sarah']).toEqual({ total: 1, passed: 1, failed: 0 });
  });

  it('handles an empty result set', () => {
    const summary = summariseTests([]);
    expect(summary.total).toBe(0);
    expect(summary.passRate).toBe(0);
  });
});

describe('buildBatchReportCsv', () => {
  it('includes summary, operator stats and result rows', () => {
    const csv = buildBatchReportCsv(sampleTests, new Date('2026-09-25T12:00:00Z'));
    expect(csv).toContain('Total Tests,3');
    expect(csv).toContain('Pass Rate,66.7%');
    expect(csv).toContain('Dave,2,1,1');
    expect(csv).toContain('Sarah,1,1,0');
    expect(csv).toContain('1,RG432-0001,Dave,2026-09-20T10:00:00Z,pass');
  });

  it('escapes commas and quotes in cell values', () => {
    const csv = buildBatchReportCsv(
      [{ id: 9, serialNumber: 'X', operator: 'Last, First', timestamp: 't', status: 'fail', diagnostics: 'said "no"' }],
      new Date(),
    );
    expect(csv).toContain('"Last, First"');
    expect(csv).toContain('"said ""no"""');
  });
});
