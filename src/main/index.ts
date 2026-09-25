/**
 * Main Electron process entry point
 */
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { initialiseDatabase } from './database';
import {
  getBoard,
  saveBoard,
  saveTest,
  getTests,
} from './test-repository';
import { createDllInterop } from '../native/dll-interop';
import { createSettingsStore } from './settings';
import { createDiagnosticLogger } from './diagnostics';
import { buildBatchReportCsv } from './report';
import { isValidSerial } from '../shared/validation';
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
 * Diagnostic logger writing to the userData logs directory
 */
const diagnostics = createDiagnosticLogger(join(app.getPath('userData'), 'logs'));

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
  if (!isValidSerial(registration.serialNumber)) {
    throw new Error('Invalid serial number format. Use letters, numbers and dashes, e.g. RG432-001.');
  }

  try {
    await dllInterop.registerBoard(registration);
    saveBoard(registration);
  } catch (error) {
    const logPath = diagnostics.write(`register-board serial=${registration.serialNumber}`, error);
    throw new Error(`Registration failed: ${error instanceof Error ? error.message : String(error)}. Diagnostic log: ${logPath}`);
  }
});

/**
 * IPC handler for checking whether a board serial is already registered
 */
ipcMain.handle('board-exists', async (_event, serialNumber: string): Promise<boolean> => {
  return Boolean(getBoard(String(serialNumber).trim()));
});

/**
 * IPC handler for running a test
 */
ipcMain.handle('run-test', async (_event, serialNumber: string): Promise<TestResult> => {
  const board = getBoard(serialNumber);
  if (!board) {
    throw new Error(`Board ${serialNumber} has not been registered`);
  }

  try {
    const result = await dllInterop.runTest(serialNumber);
    const resultWithOperator = { ...result, operator: board.operator };
    saveTest(resultWithOperator);
    return resultWithOperator;
  } catch (error) {
    const logPath = diagnostics.write(`run-test serial=${serialNumber}`, error);
    throw new Error(`Test failed: ${error instanceof Error ? error.message : String(error)}. Diagnostic log: ${logPath}`);
  }
});

/**
 * IPC handler for getting test history
 */
ipcMain.handle('get-test-history', async (): Promise<TestResult[]> => {
  return getTests();
});

/**
 * IPC handler for exporting a batch report CSV via a save dialog
 */
ipcMain.handle('export-batch-report', async (): Promise<string | null> => {
  if (!mainWindow) {
    return null;
  }

  const date = new Date().toISOString().slice(0, 10);
  const saveResult = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Batch Report',
    defaultPath: `rg432-batch-report-${date}.csv`,
    filters: [{ name: 'CSV Report', extensions: ['csv'] }],
  });

  if (saveResult.canceled || !saveResult.filePath) {
    return null;
  }

  const csv = buildBatchReportCsv(getTests(), new Date());
  writeFileSync(saveResult.filePath, csv);
  return saveResult.filePath;
});
