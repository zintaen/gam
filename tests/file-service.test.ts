import { dialog } from 'electron';
import { promises as fs } from 'node:fs';
// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FileService } from '../electron/services/file-service';

vi.mock('fs', () => ({
    promises: {
        readFile: vi.fn(),
        writeFile: vi.fn(),
    },
}));

vi.mock('electron', () => ({
    dialog: {
        showSaveDialog: vi.fn(),
        showOpenDialog: vi.fn(),
    },
}));

const mockFs = vi.mocked(fs);
const mockDialog = vi.mocked(dialog);

describe('fileService', () => {
    let service: FileService;

    beforeEach(() => {
        service = new FileService();
        vi.clearAllMocks();
    });

    describe('exportAliases', () => {
        it('should write export data to file and return filepath', async () => {
            const aliases = [
                { name: 'co', command: 'checkout', scope: 'global' as const },
            ];
            mockDialog.showSaveDialog.mockResolvedValue({
                canceled: false,
                filePath: '/tmp/aliases.json',
            });

            const result = await service.exportAliases(aliases);

            expect(result).toBe('/tmp/aliases.json');
            expect(mockFs.writeFile).toHaveBeenCalledWith(
                '/tmp/aliases.json',
                expect.stringContaining('"aliases"'),
                'utf-8',
            );
        });

        it('should throw if cancelled', async () => {
            mockDialog.showSaveDialog.mockResolvedValue({
                canceled: true,
                filePath: '',
            });

            await expect(service.exportAliases([])).rejects.toThrow(
                'Export cancelled',
            );
        });
    });

    describe('importAliases', () => {
        it('should read and parse aliases from file', async () => {
            mockDialog.showOpenDialog.mockResolvedValue({
                canceled: false,
                filePaths: ['/tmp/aliases.json'],
            });

            const exportData = {
                version: '1.0.0',
                aliases: [
                    { name: 'co', command: 'checkout', scope: 'global' as const },
                ],
            };
            mockFs.readFile.mockResolvedValue(JSON.stringify(exportData));

            const result = await service.importAliases();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('co');
        });

        it('should throw if cancelled', async () => {
            mockDialog.showOpenDialog.mockResolvedValue({
                canceled: true,
                filePaths: [],
            });

            await expect(service.importAliases()).rejects.toThrow('Import cancelled');
        });

        it('should throw if JSON is invalid', async () => {
            mockDialog.showOpenDialog.mockResolvedValue({
                canceled: false,
                filePaths: ['/tmp/aliases.json'],
            });
            mockFs.readFile.mockResolvedValue('invalid-json');

            await expect(service.importAliases()).rejects.toThrow(
                'Invalid JSON file',
            );
        });
    });
});
