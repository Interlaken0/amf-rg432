import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Application settings persisted to disk
 */
export interface AppSettings {
  mockMode: boolean;
}

/**
 * Settings store backed by a JSON file
 */
export interface SettingsStore {
  get: () => AppSettings;
  setMockMode: (enabled: boolean) => AppSettings;
}

/**
 * Default application settings
 */
const DEFAULT_SETTINGS: AppSettings = {
  mockMode: false,
};

/**
 * Create a settings store backed by a JSON file
 * @param filePath The path to the settings file
 * @returns The settings store
 */
export function createSettingsStore(filePath: string): SettingsStore {
  let current: AppSettings = { ...DEFAULT_SETTINGS };

  if (existsSync(filePath)) {
    try {
      const parsed = JSON.parse(readFileSync(filePath, 'utf-8')) as Partial<AppSettings>;
      current = { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      current = { ...DEFAULT_SETTINGS };
    }
  }

  const persist = (): void => {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(current, null, 2));
  };

  return {
    get: () => ({ ...current }),
    setMockMode: (enabled: boolean) => {
      current = { ...current, mockMode: enabled };
      persist();
      return { ...current };
    },
  };
}
