/**
 * Tauri bridge — implements the app's backend API using Tauri invoke calls.
 * so existing hooks and components need minimal changes.
 */
import { invoke } from '@tauri-apps/api/core';

import type { I_AppAPI, I_GitAlias, I_IpcResult, I_ValidationResult } from './types';

export const tauriAPI: I_AppAPI = {
    getAliases: scope => invoke<I_IpcResult<I_GitAlias[]>>('get_aliases', { scope }),

    addAlias: (name, command, scope, localPath) =>
        invoke<I_IpcResult>('add_alias', { name, command, scope, localPath }),

    updateAlias: (oldName, name, command, scope, localPath) =>
        invoke<I_IpcResult>('update_alias', { oldName, name, command, scope, localPath }),

    deleteAlias: (name, scope, localPath) =>
        invoke<I_IpcResult>('delete_alias', { name, scope, localPath }),

    validateCommand: command =>
        invoke<I_IpcResult<I_ValidationResult>>('validate_command', { command }),

    exportAliases: aliases =>
        invoke<I_IpcResult<string>>('export_aliases', { aliases }),

    importAliases: () => invoke<I_IpcResult<I_GitAlias[]>>('import_aliases'),

    selectFolder: () => invoke<I_IpcResult<string>>('select_folder'),

    getLocalPath: () => invoke<I_IpcResult<string>>('get_local_path'),

    setLocalPath: path =>
        invoke<I_IpcResult<string>>('set_local_path', { path }),

    openLocalFolder: path =>
        invoke<I_IpcResult>('open_local_folder', { path }),

    openExternal: url =>
        invoke<I_IpcResult>('open_external', { url }),

    getTheme: () => invoke<I_IpcResult<string>>('get_theme'),

    setTheme: themeId =>
        invoke<I_IpcResult>('set_theme', { themeId }),
};
