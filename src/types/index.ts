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

export interface I_AppAPI {
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
    getTheme: () => Promise<I_IpcResult<string>>;
    setTheme: (themeId: string) => Promise<I_IpcResult>;
}

// ── Theme System ────────────────────────────────────────────

export type T_ThemeStyle = 'glassmorphism' | 'notebook' | 'ide';
export type T_ThemeMode = 'light' | 'dark';
export type T_ThemeId
    = | 'glassmorphism-dark'
        | 'glassmorphism-light'
        | 'notebook-dark'
        | 'notebook-light'
        | 'ide-dark'
        | 'ide-light';

export interface I_ThemeConfig {
    id: T_ThemeId;
    style: T_ThemeStyle;
    mode: T_ThemeMode;
    label: string;
    description: string;
}

declare global {
    interface Window {
        __TAURI_INTERNALS__?: Record<string, unknown>;
    }
}
