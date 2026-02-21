import { dialog, ipcMain, shell } from 'electron';
import { existsSync } from 'node:fs';

import type { I_IpcResult } from '../src/types/index';

import { FileService } from './services/file-service';
import { GitService } from './services/git-service';

export const gitService = new GitService();
const fileService = new FileService();

function wrapHandler<T>(handler: (...args: any[]) => Promise<T>) {
    return async (
        _event: Electron.IpcMainInvokeEvent,
        ...args: any[]
    ): Promise<I_IpcResult<T>> => {
        try {
            const data = await handler(...args);

            return { success: true, data };
        }
        catch (error: any) {
            return { success: false, error: error.message || 'Unknown error' };
        }
    };
}

export function registerIpcHandlers(): void {
    // ── Alias CRUD ──────────────────────────────────────────────
    ipcMain.handle(
        'get-aliases',
        wrapHandler(async (scope: string) => {
            return gitService.getAliases(scope as any);
        }),
    );

    ipcMain.handle(
        'add-alias',
        wrapHandler(async (name: string, command: string, scope: string, localPath?: string) => {
            await gitService.addAlias(name, command, scope as any, localPath);
            return true;
        }),
    );

    ipcMain.handle(
        'update-alias',
        wrapHandler(
            async (oldName: string, name: string, command: string, scope: string, localPath?: string) => {
                await gitService.updateAlias(oldName, name, command, scope as any, localPath);

                return true;
            },
        ),
    );

    ipcMain.handle(
        'delete-alias',
        wrapHandler(async (name: string, scope: string, localPath?: string) => {
            await gitService.deleteAlias(name, scope as any, localPath);

            return true;
        }),
    );

    // ── Validation ──────────────────────────────────────────────
    ipcMain.handle(
        'validate-command',
        wrapHandler(async (command: string) => {
            return gitService.validateCommand(command);
        }),
    );

    // ── Local Scope Folder Selection ─────────────────────────────
    ipcMain.handle('select-folder', wrapHandler(async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory'],
            title: 'Select Git Repository',
        });
        if (!result.canceled && result.filePaths.length > 0) {
            gitService.setLocalPath(result.filePaths[0]);

            return result.filePaths[0];
        }

        return gitService.getLocalPath() || '';
    }));

    ipcMain.handle('get-local-path', wrapHandler(async () => {
        return gitService.getLocalPath() || '';
    }));

    ipcMain.handle('set-local-path', wrapHandler(async (pathToSet: string) => {
        if (pathToSet && !existsSync(pathToSet)) {
            throw new Error(`Directory does not exist: ${pathToSet}`);
        }
        gitService.setLocalPath(pathToSet);

        return pathToSet;
    }));

    // ── Import / Export ─────────────────────────────────────────
    ipcMain.handle(
        'export-aliases',
        wrapHandler(async (aliases: any[]) => {
            return fileService.exportAliases(aliases);
        }),
    );

    ipcMain.handle(
        'import-aliases',
        wrapHandler(async () => {
            return fileService.importAliases();
        }),
    );

    ipcMain.handle(
        'open-local-folder',
        wrapHandler(async (folderPath: string) => {
            await shell.openPath(folderPath);
            return true;
        }),
    );

    ipcMain.handle(
        'open-external',
        wrapHandler(async (url: string) => {
            await shell.openExternal(url);
            return true;
        }),
    );
}
