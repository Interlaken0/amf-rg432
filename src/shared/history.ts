import type { TestResult } from './types';
import { isRetryable, statusDigits } from './status';

/**
 * The displayed status for a history row - a retryable connexion fault
 * shows as 'retest', matching the result badge and the CSV report
 * @param entry The test result
 * @returns 'pass', 'retest' or 'fail'
 */
export function displayStatus(entry: TestResult): string {
  const digits = entry.statusDetails ? statusDigits(entry.statusDetails) : [];
  return entry.status === 'fail' && isRetryable(digits) ? 'retest' : entry.status;
}

/**
 * Filter test history rows by a free-text query - matches serial,
 * operator, status (including the derived 'retest' state) and the
 * formatted Tested At timestamp. Shared by the renderer history table
 * and the batch-report export so a CSV always contains exactly the
 * rows visible on screen.
 * @param tests The full test history
 * @param query The search text; blank returns everything
 * @returns The matching rows
 */
export function filterTestHistory(tests: TestResult[], query: string): TestResult[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return tests;
  }
  return tests.filter(
    (entry) =>
      entry.serialNumber.toLowerCase().includes(needle) ||
      entry.operator.toLowerCase().includes(needle) ||
      entry.status.includes(needle) ||
      displayStatus(entry).includes(needle) ||
      new Date(entry.timestamp).toLocaleString().toLowerCase().includes(needle),
  );
}
