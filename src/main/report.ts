import type { TestResult } from '../shared/types';

/**
 * Aggregated statistics for a batch report
 */
export interface BatchSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  byOperator: Record<string, { name: string; total: number; passed: number; failed: number }>;
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

    const opKey = test.operator.trim().toLowerCase();
    const op = summary.byOperator[opKey] ?? {
      name: test.operator.trim(),
      total: 0,
      passed: 0,
      failed: 0,
    };
    op.total++;
    if (test.status === 'pass') {
      op.passed++;
    } else if (test.status === 'fail') {
      op.failed++;
    }
    summary.byOperator[opKey] = op;
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
 * Format a serial number for CSV output
 * All-digit serials are wrapped as a literal string so Excel does not
 * convert them to scientific notation or lose precision (>15 digits)
 * @param value The serial number
 * @returns The CSV-safe value
 */
function csvSerial(value: string): string {
  if (/^\d+$/.test(value)) {
    return `="${value}"`;
  }
  return csvCell(value);
}

/**
 * Format a timestamp for the report as YYYY-MM-DD HH:mm:ss (UTC)
 * @param value The ISO timestamp
 * @returns The readable timestamp
 */
function csvTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Diagnostics split into report columns
 */
interface ParsedDiagnostics {
  resultCode: string;
  measurements: string;
  resultsFile: string;
  notes: string;
}

/**
 * Split a diagnostics string into report columns
 * Real-DLL diagnostics follow 'Details=0x...., measurements=[..], file=..dat'
 * and map onto dedicated columns; anything else (mock failures, errors)
 * lands in Notes unchanged.
 * @param diagnostics The stored diagnostics string
 * @returns The parsed column values
 */
function parseDiagnostics(diagnostics?: string): ParsedDiagnostics {
  const parsed: ParsedDiagnostics = { resultCode: '', measurements: '', resultsFile: '', notes: '' };
  const raw = diagnostics?.trim();
  if (!raw) {
    return parsed;
  }

  const match = /^Details=(0x[0-9a-fA-F]+), measurements=\[([^\]]*)\], file=(.+)$/.exec(raw);
  if (!match) {
    parsed.notes = raw;
    return parsed;
  }

  parsed.resultCode = match[1];
  parsed.measurements = match[2].split(',').join(', ');
  parsed.resultsFile = match[3].split(/[\\/]/).pop() ?? match[3];
  return parsed;
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

  lines.push('RG432 Test Rig - Batch Report');
  lines.push(`Generated,${csvTimestamp(generatedAt.toISOString())}`);
  lines.push('');

  lines.push('SUMMARY');
  lines.push(`Total Tests,${summary.total}`);
  lines.push(`Passed,${summary.passed}`);
  lines.push(`Failed,${summary.failed}`);
  lines.push(`Pass Rate,${(summary.passRate * 100).toFixed(1)}%`);
  lines.push('');

  lines.push('OPERATOR BREAKDOWN');
  lines.push('Operator,Tests,Passed,Failed,Pass Rate');
  for (const stats of Object.values(summary.byOperator)) {
    const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) + '%' : '0.0%';
    lines.push(`${csvCell(stats.name)},${stats.total},${stats.passed},${stats.failed},${rate}`);
  }
  lines.push('');

  lines.push('TEST RESULTS');
  lines.push('ID,Serial Number,Operator,Tested At,Status,Result Code,Measurements,Results File,Notes');
  for (const test of tests) {
    const diag = parseDiagnostics(test.diagnostics);
    lines.push(
      [
        String(test.id),
        csvSerial(test.serialNumber),
        csvCell(test.operator),
        csvTimestamp(test.timestamp),
        test.status,
        diag.resultCode,
        csvCell(diag.measurements),
        csvCell(diag.resultsFile),
        csvCell(diag.notes),
      ].join(','),
    );
  }

  return lines.join('\r\n');
}
