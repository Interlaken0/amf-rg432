/**
 * Diagnostic logger tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDiagnosticLogger } from '../src/main/diagnostics';

describe('diagnostic logger', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'rg432-diag-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('writes a timestamped log file containing context and error', () => {
    const logger = createDiagnosticLogger(dir);
    const path = logger.write('run-test serial=RG432-0001', new Error('DLL exploded'));

    expect(path).toContain('diagnostic-');
    const content = readFileSync(path, 'utf-8');
    expect(content).toContain('run-test serial=RG432-0001');
    expect(content).toContain('DLL exploded');
    expect(readdirSync(dir)).toHaveLength(1);
  });

  it('handles non-Error values', () => {
    const logger = createDiagnosticLogger(dir);
    const path = logger.write('test', 'string failure');
    expect(readFileSync(path, 'utf-8')).toContain('string failure');
  });
});
