import { contextBridge, ipcRenderer } from 'electron';

import type { I_ElectronAPI } from '../src/types/index';

const electronAPI: I_ElectronAPI = {
    getAliases: scope => ipcRenderer.invoke('get-aliases', scope),
    addAlias: (name, command, scope, localPath) =>
        ipcRenderer.invoke('add-alias', name, command, scope, localPath),
    updateAlias: (oldName, name, command, scope, localPath) =>
        ipcRenderer.invoke('update-alias', oldName, name, command, scope, localPath),
    deleteAlias: (name, scope, localPath) => ipcRenderer.invoke('delete-alias', name, scope, localPath),
    validateCommand: command => ipcRenderer.invoke('validate-command', command),
    exportAliases: aliases => ipcRenderer.invoke('export-aliases', aliases),
    importAliases: () => ipcRenderer.invoke('import-aliases'),
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    getLocalPath: () => ipcRenderer.invoke('get-local-path'),
    setLocalPath: path => ipcRenderer.invoke('set-local-path', path),
    openLocalFolder: path => ipcRenderer.invoke('open-local-folder', path),
    openExternal: url => ipcRenderer.invoke('open-external', url),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
