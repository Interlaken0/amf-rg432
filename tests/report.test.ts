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
    expect(summary.byOperator['dave']).toEqual({ name: 'Dave', total: 2, passed: 1, failed: 1 });
    expect(summary.byOperator['sarah']).toEqual({ name: 'Sarah', total: 1, passed: 1, failed: 0 });
  });

  it('merges operator names that differ only by case', () => {
    const tests: TestResult[] = [
      { id: 1, serialNumber: 'A', operator: 'Greg', timestamp: 't', status: 'pass' },
      { id: 2, serialNumber: 'B', operator: 'greg', timestamp: 't', status: 'fail' },
    ];
    const summary = summariseTests(tests);
    expect(Object.keys(summary.byOperator)).toHaveLength(1);
    expect(summary.byOperator['greg']).toEqual({ name: 'Greg', total: 2, passed: 1, failed: 1 });
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
    expect(csv).toContain('SUMMARY');
    expect(csv).toContain('OPERATOR BREAKDOWN');
    expect(csv).toContain('FAILED TESTS');
    expect(csv).toContain('TEST RESULTS');
    expect(csv).toContain('Total Tests,3');
    expect(csv).toContain('Pass Rate,66.7%');
    expect(csv).toContain('Dave,2,1,1,50.0%');
    expect(csv).toContain('Sarah,1,1,0,100.0%');
    expect(csv).toContain('1,RG432-0001,Dave,20/09/2026 10:00:00,pass');
  });

  it('splits real-DLL diagnostics into dedicated columns', () => {
    const csv = buildBatchReportCsv(
      [
        {
          id: 7,
          serialNumber: 'RG432-0007',
          operator: 'Dave',
          timestamp: '2026-09-25T09:00:00Z',
          status: 'pass',
          diagnostics:
            'Details=0x1234, measurements=[6,0,6,4], file=C:\\Users\\Greg\\AppData\\Roaming\\rg432-test-rig\\results\\260925-090000-RG432-0007.dat',
        },
      ],
      new Date(),
    );
    expect(csv).toContain(
      '7,RG432-0007,Dave,25/09/2026 09:00:00,pass,0x1234,"6, 0, 6, 4",260925-090000-RG432-0007.dat,',
    );
  });

  it('keeps unrecognised diagnostics in the notes column', () => {
    const csv = buildBatchReportCsv(
      [
        {
          id: 8,
          serialNumber: 'RG432-0008',
          operator: 'Dave',
          timestamp: 't',
          status: 'fail',
          diagnostics: 'Mock failure: simulated DLL returned error flag 0x01',
        },
      ],
      new Date(),
    );
    expect(csv).toContain(',Mock failure: simulated DLL returned error flag 0x01');
  });

  it('escapes commas and quotes in cell values', () => {
    const csv = buildBatchReportCsv(
      [{ id: 9, serialNumber: 'X', operator: 'Last, First', timestamp: 't', status: 'fail', diagnostics: 'said "no"' }],
      new Date(),
    );
    expect(csv).toContain('"Last, First"');
    expect(csv).toContain('"said ""no"""');
  });

  it('prefixes all-digit serials so Excel cannot number-convert them', () => {
    const csv = buildBatchReportCsv(
      [{ id: 9, serialNumber: '1111111111111', operator: 'Sarah', timestamp: 't', status: 'pass' }],
      new Date(),
    );
    expect(csv).toContain(',SN-1111111111111,');
    expect(csv).not.toContain(',1111111111111,');
  });
});
