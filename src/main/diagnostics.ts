import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Diagnostic logger bound to an output directory
 */
export interface DiagnosticLogger {
  /**
   * Write a timestamped diagnostic log for an unexpected failure
   * @param context What was happening when the failure occurred
   * @param error The error that occurred
   * @returns The path of the written log file
   */
  write: (context: string, error: unknown) => string;
}

/**
 * Create a diagnostic logger writing timestamped log files to a directory
 * @param directory The directory to write diagnostic logs into
 * @returns The diagnostic logger
 */
export function createDiagnosticLogger(directory: string): DiagnosticLogger {
  return {
    write: (context: string, error: unknown): string => {
      const now = new Date();
      const stamp = now.toISOString().replace(/[:.]/g, '-');
      const filePath = join(directory, `diagnostic-${stamp}.log`);

      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;

      const content = [
        `RG432 Test Rig - Diagnostic Log`,
        `Timestamp: ${now.toISOString()}`,
        `Context: ${context}`,
        `Error: ${message}`,
        stack ? `\nStack:\n${stack}` : '',
        `\nPlatform: ${process.platform} ${process.arch}`,
        `Electron/Node versions: ${JSON.stringify(process.versions)}`,
      ].join('\n');

      mkdirSync(directory, { recursive: true });
      writeFileSync(filePath, content);
      return filePath;
    },
  };
}
