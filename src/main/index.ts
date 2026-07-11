import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initialiseDatabase } from './database';
import { createDllInterop } from '../native/dll-interop';
import type { TestResult, BoardRegistration } from '../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
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

const dllInterop = createDllInterop();

ipcMain.handle('register-board', async (_event, registration: BoardRegistration): Promise<void> => {
  await dllInterop.registerBoard(registration);
});

ipcMain.handle('run-test', async (_event, serialNumber: string): Promise<TestResult> => {
  return dllInterop.runTest(serialNumber);
});

ipcMain.handle('get-test-history', async (): Promise<TestResult[]> => {
  return dllInterop.getTestHistory();
});
