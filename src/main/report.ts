import type { TestResult } from '../shared/types';

/**
 * Aggregated statistics for a batch report
 */
export interface BatchSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  byOperator: Record<string, { total: number; passed: number; failed: number }>;
}

/**
 * Summarise test results into aggregate statistics
 * @param tests The test results to summarise
 * @returns Aggregate counts and pass rate
 */
export function summariseTests(tests: TestResult[]): BatchSummary {
  const summary: BatchSummary = {
    total: tests.length,
    passed: 0,
    failed: 0,
    passRate: 0,
    byOperator: {},
  };

  for (const test of tests) {
    if (test.status === 'pass') {
      summary.passed++;
    } else if (test.status === 'fail') {
      summary.failed++;
    }

    const op = summary.byOperator[test.operator] ?? { total: 0, passed: 0, failed: 0 };
    op.total++;
    if (test.status === 'pass') {
      op.passed++;
    } else if (test.status === 'fail') {
      op.failed++;
    }
    summary.byOperator[test.operator] = op;
  }

  summary.passRate = summary.total > 0 ? summary.passed / summary.total : 0;
  return summary;
}

/**
 * Escape a value for CSV output
 * @param value The raw value
 * @returns The CSV-safe value
 */
function csvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Build a CSV batch report from test results
 * @param tests The test results to include
 * @param generatedAt The report generation timestamp
 * @returns The CSV report content
 */
export function buildBatchReportCsv(tests: TestResult[], generatedAt: Date): string {
  const summary = summariseTests(tests);
  const lines: string[] = [];

  lines.push(`RG432 Test Rig - Batch Report`);
  lines.push(`Generated,${generatedAt.toISOString()}`);
  lines.push(`Total Tests,${summary.total}`);
  lines.push(`Passed,${summary.passed}`);
  lines.push(`Failed,${summary.failed}`);
  lines.push(`Pass Rate,${(summary.passRate * 100).toFixed(1)}%`);
  lines.push('');

  lines.push('Operator,Total,Passed,Failed');
  for (const [operator, stats] of Object.entries(summary.byOperator)) {
    lines.push(`${csvCell(operator)},${stats.total},${stats.passed},${stats.failed}`);
  }
  lines.push('');

  lines.push('ID,Serial Number,Operator,Tested At,Status,Diagnostics');
  for (const test of tests) {
    lines.push(
      [
        String(test.id),
        csvCell(test.serialNumber),
        csvCell(test.operator),
        csvCell(test.timestamp),
        test.status,
        csvCell(test.diagnostics ?? ''),
      ].join(','),
    );
  }

  return lines.join('\r\n');
}
