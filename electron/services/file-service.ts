import { dialog } from 'electron';
import { promises as fs } from 'node:fs';

import type { I_ExportData, I_GitAlias } from '../../src/types/index';

export class FileService {
    async exportAliases(aliases: I_GitAlias[]): Promise<string> {
        const result = await dialog.showSaveDialog({
            title: 'Export Git Aliases',
            defaultPath: `gam-${new Date().toISOString()}.json`,
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });

        if (result.canceled || !result.filePath) {
            throw new Error('Export cancelled');
        }

        const exportData: I_ExportData = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            aliases,
        };

        await fs.writeFile(
            result.filePath,
            JSON.stringify(exportData, null, 2),
            'utf-8',
        );

        return result.filePath;
    }

    async importAliases(): Promise<I_GitAlias[]> {
        const result = await dialog.showOpenDialog({
            title: 'Import Git Aliases',
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] },
            ],
            properties: ['openFile'],
        });

        if (result.canceled || result.filePaths.length === 0) {
            throw new Error('Import cancelled');
        }

        const content = await fs.readFile(result.filePaths[0], 'utf-8');
        let data: I_ExportData;

        try {
            data = JSON.parse(content);
        }
        catch {
            throw new Error('Invalid JSON file');
        }

        // Validate structure
        if (!data.aliases || !Array.isArray(data.aliases)) {
            throw new Error('Invalid alias file format: missing "aliases" array');
        }

        for (const alias of data.aliases) {
            if (!alias.name || typeof alias.name !== 'string') {
                throw new Error(`Invalid alias: missing or invalid "name" field`);
            }
            if (!alias.command || typeof alias.command !== 'string') {
                throw new Error(
                    `Invalid alias "${alias.name}": missing or invalid "command" field`,
                );
            }
            // Default scope to global if not specified
            if (!alias.scope) {
                alias.scope = 'global';
            }
        }

        return data.aliases;
    }
}
