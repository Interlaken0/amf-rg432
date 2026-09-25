/**
 * Main Electron process entry point
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initialiseDatabase } from './database';
import {
  getBoard,
  saveBoard,
  saveTest,
  getTests,
} from './test-repository';
import { createDllInterop } from '../native/dll-interop';
import { createSettingsStore } from './settings';
import type { TestResult, BoardRegistration } from '../shared/types';

if (process.env.VITE_DEV_SERVER_URL) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main window instance
 */
let mainWindow: BrowserWindow | null = null;

/**
 * Create the main application window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'AMF RG432 Test Rig',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  initialiseDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Application settings store persisted to userData
 */
const settings = createSettingsStore(
  join(app.getPath('userData'), 'settings.json'),
);

/**
 * DLL interop instance for hardware communication
 */
let dllInterop = createDllInterop({ forceMock: settings.get().mockMode });

/**
 * IPC handler for getting the current mock mode setting
 */
ipcMain.handle('get-mock-mode', async (): Promise<boolean> => {
  return settings.get().mockMode;
});

/**
 * IPC handler for toggling mock mode
 */
ipcMain.handle('set-mock-mode', async (_event, enabled: boolean): Promise<boolean> => {
  const updated = settings.setMockMode(enabled);
  dllInterop = createDllInterop({ forceMock: updated.mockMode });
  return updated.mockMode;
});

/**
 * IPC handler for board registration
 */
ipcMain.handle('register-board', async (_event, registration: BoardRegistration): Promise<void> => {
  await dllInterop.registerBoard(registration);
  saveBoard(registration);
});

/**
 * IPC handler for running a test
 */
ipcMain.handle('run-test', async (_event, serialNumber: string): Promise<TestResult> => {
  const board = getBoard(serialNumber);
  if (!board) {
    throw new Error(`Board ${serialNumber} has not been registered`);
  }

  const result = await dllInterop.runTest(serialNumber);
  const resultWithOperator = { ...result, operator: board.operator };
  saveTest(resultWithOperator);
  return resultWithOperator;
});

/**
 * IPC handler for getting test history
 */
ipcMain.handle('get-test-history', async (): Promise<TestResult[]> => {
  return getTests();
});
