/**
 * Settings store tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSettingsStore } from '../src/main/settings';

describe('settings store', () => {
  let dir: string;
  let filePath: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'rg432-settings-'));
    filePath = join(dir, 'settings.json');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('defaults mock mode to off', () => {
    const store = createSettingsStore(filePath);
    expect(store.get().mockMode).toBe(false);
  });

  it('persists the mock mode toggle across store instances', () => {
    const store = createSettingsStore(filePath);
    store.setMockMode(true);

    const reloaded = createSettingsStore(filePath);
    expect(reloaded.get().mockMode).toBe(true);
  });

  it('recovers from a corrupt settings file', () => {
    writeFileSync(filePath, 'not-json');
    const store = createSettingsStore(filePath);
    expect(store.get().mockMode).toBe(false);
  });
});
