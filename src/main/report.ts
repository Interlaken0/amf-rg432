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
 * Pure-digit serials are prefixed so Excel cannot convert them to a
 * number (scientific notation, thousands separators or >15-digit
 * precision loss). The ="serial" formula trick is not reliable on
 * current Excel builds - the result still gets number-converted.
 * @param value The serial number
 * @returns The CSV-safe value
 */
function csvSerial(value: string): string {
  if (/^\d+$/.test(value)) {
    return `SN-${value}`;
  }
  return csvCell(value);
}

/**
 * Format a timestamp for the report as DD/MM/YYYY HH:mm:ss (UTC)
 * @param value The ISO timestamp
 * @returns The readable timestamp
 */
function csvTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const [day, time] = date.toISOString().split('T');
  const [year, month, dateOfMonth] = day.split('-');
  return `${dateOfMonth}/${month}/${year} ${time.slice(0, 8)}`;
}

/**
 * Format a timestamp as DD/MM/YYYY (UTC)
 * @param ms Epoch milliseconds
 * @returns The readable date
 */
function csvDate(ms: number): string {
  return csvTimestamp(new Date(ms).toISOString()).slice(0, 10);
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
  const sorted = [...tests].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() || b.id - a.id,
  );
  const dates = sorted
    .map((t) => new Date(t.timestamp).getTime())
    .filter((t) => !Number.isNaN(t));
  const lines: string[] = [];

  lines.push('RG432 Test Rig - Batch Report');
  lines.push(`Generated,${csvTimestamp(generatedAt.toISOString())}`);
  if (dates.length > 0) {
    lines.push(`Period,${csvDate(Math.min(...dates))} to ${csvDate(Math.max(...dates))}`);
  }
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

  const detailHeader =
    'ID,Serial Number,Operator,Tested At,Status,Result Code,Measurements,Results File,Notes';
  const detailRow = (test: TestResult): string => {
    const diag = parseDiagnostics(test.diagnostics);
    return [
      String(test.id),
      csvSerial(test.serialNumber),
      csvCell(test.operator),
      csvTimestamp(test.timestamp),
      test.status,
      diag.resultCode,
      csvCell(diag.measurements),
      csvCell(diag.resultsFile),
      csvCell(diag.notes),
    ].join(',');
  };

  // Failures get their own section - that is what a supervisor reads
  // first - while the full log keeps every attempt in sequence so
  // retests stay visible next to the runs they followed.
  const failed = sorted.filter((t) => t.status === 'fail');
  lines.push('FAILED TESTS');
  if (failed.length === 0) {
    lines.push('None');
  } else {
    lines.push(detailHeader);
    for (const test of failed) {
      lines.push(detailRow(test));
    }
  }
  lines.push('');

  lines.push('TEST RESULTS');
  lines.push(detailHeader);
  for (const test of sorted) {
    lines.push(detailRow(test));
  }

  return lines.join('\r\n');
}
