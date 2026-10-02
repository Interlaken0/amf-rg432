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

  it('defaults failure percent to 20', () => {
    const store = createSettingsStore(filePath);
    expect(store.get().failurePercent).toBe(20);
  });

  it('persists failure percent and clamps it to 0-100', () => {
    const store = createSettingsStore(filePath);
    expect(store.setFailurePercent(45).failurePercent).toBe(45);
    expect(store.setFailurePercent(150).failurePercent).toBe(100);
    expect(store.setFailurePercent(-5).failurePercent).toBe(0);

    const reloaded = createSettingsStore(filePath);
    expect(reloaded.get().failurePercent).toBe(0);
  });

  it('recovers from a corrupt settings file', () => {
    writeFileSync(filePath, 'not-json');
    const store = createSettingsStore(filePath);
    expect(store.get().mockMode).toBe(false);
  });
});
