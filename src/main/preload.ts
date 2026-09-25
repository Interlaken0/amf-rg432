/**
 * Preload script for exposing IPC API to renderer process
 */
import { contextBridge, ipcRenderer } from 'electron';
import type { BoardRegistration } from '../shared/types';

/**
 * Expose the Electron API to the renderer process via contextBridge
 */
contextBridge.exposeInMainWorld('electronAPI', {
  registerBoard: (registration: BoardRegistration) =>
    ipcRenderer.invoke('register-board', registration),
  runTest: (serialNumber: string) => ipcRenderer.invoke('run-test', serialNumber),
  getTestHistory: () => ipcRenderer.invoke('get-test-history'),
  getMockMode: () => ipcRenderer.invoke('get-mock-mode'),
  setMockMode: (enabled: boolean) => ipcRenderer.invoke('set-mock-mode', enabled),
  exportBatchReport: () => ipcRenderer.invoke('export-batch-report'),
});
