import type { TestResult } from '../shared/types';
import { isRetryable, statusDigits } from '../shared/status';

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
 * Format a timestamp for the report as DD/MM/YYYY HH:mm:ss (local time)
 * @param value The ISO timestamp
 * @returns The readable timestamp
 */
function csvTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/**
 * Format a timestamp as DD/MM/YYYY (local time)
 * @param ms Epoch milliseconds
 * @returns The readable date
 */
function csvDate(ms: number): string {
  return csvTimestamp(new Date(ms).toISOString()).slice(0, 10);
}

/**
 * A test row split into its report columns
 */
interface DetailColumns {
  statusDetails: string;
  testSummary: string;
  qa: string[];
  resultsFile: string;
  notes: string;
}

/**
 * Map a test result onto the detail columns
 *
 * Stage-2 rows carry status_details/test_summary/qa columns directly;
 * the diagnostics string only supplies the results-file name and any
 * free-text notes (mock failures, aborted tests). A raw 'Details=' line
 * is preserved in Notes only when the row has no structured status
 * word - legacy stage-1 results, where it was the only record.
 * @param test The test result
 * @returns The detail column values
 */
function detailColumns(test: TestResult): DetailColumns {
  const raw = test.diagnostics?.trim() ?? '';
  const fileMatch = /file=(.+)$/.exec(raw);
  const resultsFile = fileMatch ? (fileMatch[1].split(/[\\/]/).pop() ?? fileMatch[1]) : '';

  const qa = ['', '', '', ''];
  test.qa?.forEach((value, index) => {
    if (index < 4) {
      qa[index] = String(Math.round(value * 10000) / 10000);
    }
  });

  const rawNotes = raw && (!raw.startsWith('Details=') || !test.statusDetails) ? raw : '';
  // Stage-2 rows get an operator-facing note derived from the status
  // word - the same guidance the app shows for each outcome
  let notes = rawNotes;
  if (!notes && test.statusDetails) {
    const digits = statusDigits(test.statusDetails);
    if (test.status === 'pass') {
      notes = 'Passed all four tests';
    } else if (isRetryable(digits)) {
      notes = 'Bad connexion - check the board and retest';
    } else if (digits.length === 4) {
      notes = 'Failed outright - start a new board';
    }
  }

  return {
    statusDetails: test.statusDetails ?? '',
    testSummary: test.testSummary ?? '',
    qa,
    resultsFile,
    notes,
  };
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
    'ID,Serial Number,Operator,Tested At,Status,Status Details,Test Summary,QA1,QA2,QA3,QA4,Results File,Notes';
  // Retryable connexion faults display as 'retest' so the CSV matches
  // the on-screen badge; the flag is derived from the status word, so
  // it works for stored rows that predate a retryable column.
  const statusCell = (test: TestResult): string => {
    const digits = test.statusDetails ? statusDigits(test.statusDetails) : [];
    return test.status === 'fail' && isRetryable(digits) ? 'retest' : test.status;
  };

  const detailRow = (test: TestResult): string => {
    const cols = detailColumns(test);
    return [
      String(test.id),
      csvSerial(test.serialNumber),
      csvCell(test.operator),
      csvTimestamp(test.timestamp),
      statusCell(test),
      cols.statusDetails,
      csvCell(cols.testSummary),
      ...cols.qa,
      csvCell(cols.resultsFile),
      csvCell(cols.notes),
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
