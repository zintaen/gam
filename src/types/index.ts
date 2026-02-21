export interface I_GitAlias {
    name: string;
    command: string;
    scope: 'global' | 'local';
    localPath?: string;
    score?: number;
}

export type T_SortMode = 'name' | 'rank';

export interface I_AliasFormData {
    name: string;
    command: string;
    scope: 'global' | 'local';
}

export interface I_IpcResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface I_ValidationResult {
    valid: boolean;
    warnings: string[];
    errors: string[];
}

export interface I_ExportData {
    version: string;
    exportedAt: string;
    aliases: I_GitAlias[];
}

export interface I_ElectronAPI {
    getAliases: (
        scope: 'global' | 'local' | 'all',
    ) => Promise<I_IpcResult<I_GitAlias[]>>;
    addAlias: (
        name: string,
        command: string,
        scope: 'global' | 'local',
        localPath?: string,
    ) => Promise<I_IpcResult>;
    updateAlias: (
        oldName: string,
        name: string,
        command: string,
        scope: 'global' | 'local',
        localPath?: string,
    ) => Promise<I_IpcResult>;
    deleteAlias: (name: string, scope: 'global' | 'local', localPath?: string) => Promise<I_IpcResult>;
    validateCommand: (command: string) => Promise<I_IpcResult<I_ValidationResult>>;
    exportAliases: (aliases: I_GitAlias[]) => Promise<I_IpcResult<string>>;
    importAliases: () => Promise<I_IpcResult<I_GitAlias[]>>;
    selectFolder: () => Promise<I_IpcResult<string>>;
    getLocalPath: () => Promise<I_IpcResult<string>>;
    setLocalPath: (path: string) => Promise<I_IpcResult<string>>;
    openLocalFolder: (path: string) => Promise<I_IpcResult>;
    openExternal: (url: string) => Promise<I_IpcResult>;
}

declare global {
    interface Window {
        electronAPI: I_ElectronAPI;
    }
}
