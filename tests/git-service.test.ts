import { execFile } from 'node:child_process';
// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GitService } from '../electron/services/git-service';

// Mock child_process
vi.mock('node:child_process', () => ({
    execFile: vi.fn(),
    exec: vi.fn(),
}));
vi.mock('child_process', () => ({
    execFile: vi.fn(),
    exec: vi.fn(),
}));

const mockExecFile = vi.mocked(execFile);

// Mock RankingService so it doesn't trigger shell timeouts in headless CI
vi.mock('../electron/services/ranking-service', () => {
    return {
        RankingService: class {
            getScores = vi.fn().mockResolvedValue({});
        },
    };
});

describe('gitService', () => {
    let service: GitService;

    beforeEach(() => {
        service = new GitService();
        vi.clearAllMocks();
    });

    describe('getAliases', () => {
        it('should parse global aliases correctly', async () => {
            mockExecFile.mockImplementation(
                (_cmd: any, _args: any, _opts: any, cb?: any) => {
                    if (typeof _opts === 'function') {
                        cb = _opts;
                    }
                    const callback = cb || _opts;
                    if (typeof callback === 'function') {
                        callback(null, {
                            stdout:
                                'alias.co checkout\nalias.st status -sb\nalias.lg log --oneline --graph\n',
                            stderr: '',
                        });
                    }
                    return {} as any;
                },
            );

            const aliases = await service.getAliases('global');

            expect(aliases).toHaveLength(3);
            expect(aliases[0]).toEqual({
                name: 'co',
                command: 'checkout',
                scope: 'global',
                localPath: undefined,
                score: 0,
            });
            expect(aliases[1]).toEqual({
                name: 'lg',
                command: 'log --oneline --graph',
                scope: 'global',
                localPath: undefined,
                score: 0,
            });
            expect(aliases[2]).toEqual({
                name: 'st',
                command: 'status -sb',
                scope: 'global',
                localPath: undefined,
                score: 0,
            });
        });

        it('should return empty array when no aliases exist', async () => {
            mockExecFile.mockImplementation(
                (_cmd: any, _args: any, _opts: any, cb?: any) => {
                    if (typeof _opts === 'function') {
                        cb = _opts;
                    }
                    const callback = cb || _opts;
                    if (typeof callback === 'function') {
                        const error: any = new Error('No aliases');
                        error.code = 1;
                        callback(error, { stdout: '', stderr: '' });
                    }
                    return {} as any;
                },
            );

            const aliases = await service.getAliases('global');
            expect(aliases).toEqual([]);
        });

        it('should sort aliases alphabetically by name', async () => {
            mockExecFile.mockImplementation(
                (_cmd: any, _args: any, _opts: any, cb?: any) => {
                    if (typeof _opts === 'function') {
                        cb = _opts;
                    }
                    const callback = cb || _opts;
                    if (typeof callback === 'function') {
                        callback(null, {
                            stdout: 'alias.zz last\nalias.aa first\nalias.mm middle\n',
                            stderr: '',
                        });
                    }
                    return {} as any;
                },
            );

            const aliases = await service.getAliases('global');
            expect(aliases.map(a => a.name)).toEqual(['aa', 'mm', 'zz']);
        });
    });

    describe('validateCommand', () => {
        it('should return valid for a normal command', () => {
            const result = service.validateCommand('checkout');
            expect(result.valid).toBe(true);
            expect(result.warnings).toHaveLength(0);
            expect(result.errors).toHaveLength(0);
        });

        it('should return error for empty command', () => {
            const result = service.validateCommand('');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Command cannot be empty');
        });

        it('should return error for whitespace-only command', () => {
            const result = service.validateCommand('   ');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Command cannot be empty');
        });

        it('should warn on force push', () => {
            const result = service.validateCommand('push --force origin main');
            expect(result.valid).toBe(true);
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(
                result.warnings.some((w: string) => w.includes('force push')),
            ).toBe(true);
        });

        it('should warn on push -f', () => {
            const result = service.validateCommand('push -f origin main');
            expect(result.valid).toBe(true);
            expect(
                result.warnings.some((w: string) => w.includes('force push')),
            ).toBe(true);
        });

        it('should warn on rm -rf', () => {
            const result = service.validateCommand('!rm -rf .git');
            expect(result.valid).toBe(true);
            expect(
                result.warnings.some((w: string) => w.includes('recursive delete')),
            ).toBe(true);
        });

        it('should warn on reset --hard', () => {
            const result = service.validateCommand('reset --hard HEAD~1');
            expect(result.valid).toBe(true);
            expect(
                result.warnings.some((w: string) => w.includes('hard reset')),
            ).toBe(true);
        });

        it('should warn on shell command alias', () => {
            const result = service.validateCommand('!echo hello');
            expect(result.valid).toBe(true);
            expect(
                result.warnings.some((w: string) => w.includes('shell command')),
            ).toBe(true);
        });

        it('should not flag safe commands', () => {
            const result = service.validateCommand(
                'log --oneline --graph --all --decorate',
            );
            expect(result.valid).toBe(true);
            expect(result.warnings).toHaveLength(0);
        });
    });

    describe('validateAliasName', () => {
        it('should accept valid names', () => {
            expect(service.validateAliasName('co').valid).toBe(true);
            expect(service.validateAliasName('my-alias').valid).toBe(true);
            expect(service.validateAliasName('alias_123').valid).toBe(true);
            expect(service.validateAliasName('A').valid).toBe(true);
        });

        it('should reject empty names', () => {
            const result = service.validateAliasName('');
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should reject names starting with a number', () => {
            const result = service.validateAliasName('1co');
            expect(result.valid).toBe(false);
        });

        it('should reject names with spaces', () => {
            const result = service.validateAliasName('my alias');
            expect(result.valid).toBe(false);
        });

        it('should reject names with special characters', () => {
            const result = service.validateAliasName('co@!');
            expect(result.valid).toBe(false);
        });

        it('should reject names starting with hyphen', () => {
            const result = service.validateAliasName('-co');
            expect(result.valid).toBe(false);
        });
    });
});
