import { contextBridge, ipcRenderer } from 'electron';
import type { BoardRegistration } from '../shared/types';

contextBridge.exposeInMainWorld('electronAPI', {
  registerBoard: (registration: BoardRegistration) =>
    ipcRenderer.invoke('register-board', registration),
  runTest: (serialNumber: string) => ipcRenderer.invoke('run-test', serialNumber),
  getTestHistory: () => ipcRenderer.invoke('get-test-history'),
});
