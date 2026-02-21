import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import type { I_GitAlias, I_ValidationResult } from '../../src/types/index';

import { KnownReposService } from './known-repos-service';
import { RankingService } from './ranking-service';

const execFileAsync = promisify(execFile);

const DANGEROUS_PATTERNS = [
    {
        pattern: /rm\s+(-rf|-fr|--recursive)/,
        message: 'Contains recursive delete (rm -rf)',
    },
    { pattern: /push\s+(?:\S.*)?--force/, message: 'Contains force push (--force)' },
    { pattern: /push\s+(?:\S.*)?-f\b/, message: 'Contains force push (-f)' },
    { pattern: /reset\s+--hard/, message: 'Contains hard reset (reset --hard)' },
    { pattern: /clean\s+(?:\S.*)?-fd/, message: 'Contains force clean (clean -fd)' },
    { pattern: /branch\s+(?:\S.*)?-D/, message: 'Contains force branch delete (-D)' },
];

export class GitService {
    private localPath?: string;
    private knownReposService: KnownReposService;
    private rankingService: RankingService;

    constructor() {
        this.knownReposService = new KnownReposService();
        this.rankingService = new RankingService();
    }

    setLocalPath(path?: string) {
        this.localPath = path;
        if (path) {
            this.knownReposService.add(path);
        }
    }

    getLocalPath() {
        return this.localPath;
    }

    private async execGit(args: string[], cwd?: string): Promise<string> {
        try {
            const { stdout } = await execFileAsync('git', args, {
                cwd,
                timeout: 10000,
                maxBuffer: 1024 * 1024,
            });

            return stdout.trim();
        }
        catch (error: any) {
            if (error.code === 'ENOENT') {
                throw new Error('Git is not installed or not found in PATH');
            }
            // git config returns exit code 1 when no aliases exist
            if (error.code === 1 && args.includes('--get-regexp')) {
                return '';
            }

            throw new Error(error.stderr?.trim() || error.message);
        }
    }

    async getAliases(scope: 'global' | 'local' | 'all'): Promise<I_GitAlias[]> {
        const aliases: I_GitAlias[] = [];

        if (scope === 'global' || scope === 'all') {
            try {
                const output = await this.execGit([
                    'config',
                    '--global',
                    '--get-regexp',
                    '^alias\\.',
                ]);
                aliases.push(...this.parseAliasOutput(output, 'global'));
            }
            catch {
                // No global aliases or no global config
            }
        }

        if (scope === 'local' || scope === 'all') {
            const pathsToScan = (scope === 'all' || !this.localPath)
                ? this.knownReposService.getAll()
                : [this.localPath];

            for (const scanPath of pathsToScan) {
                try {
                    const output = await this.execGit([
                        'config',
                        '--local',
                        '--get-regexp',
                        '^alias\\.',
                    ], scanPath);
                    aliases.push(...this.parseAliasOutput(output, 'local', scanPath));
                }
                catch {
                    // Ignore errors for individual paths (e.g. repo deleted)
                }
            }
        }

        // Rank aliases based on telemetry history
        const sortedAliases = aliases.sort((a, b) => a.name.localeCompare(b.name));
        try {
            const scores = await this.rankingService.getScores(sortedAliases);
            for (const alias of sortedAliases) {
                alias.score = scores[alias.name] || 0;
            }
        }
        catch { /* Silent fail */ }

        return sortedAliases;
    }

    private parseAliasOutput(
        output: string,
        scope: 'global' | 'local',
        localPath?: string,
    ): I_GitAlias[] {
        if (!output)
            return [];

        return output
            .split('\n')
            .filter(Boolean)
            .map((line) => {
                // Format: "alias.name command args..."
                const firstSpace = line.indexOf(' ');
                const key = line.substring(0, firstSpace);
                const command = line.substring(firstSpace + 1);
                const name = key.replace('alias.', '');

                return { name, command, scope, localPath };
            });
    }

    async addAlias(
        name: string,
        command: string,
        scope: 'global' | 'local',
        localPath?: string,
    ): Promise<void> {
        // Check if alias already exists
        const existing = await this.getAliases(scope);
        if (existing.some(a => a.name === name)) {
            throw new Error(`Alias "${name}" already exists in ${scope} config`);
        }

        const targetPath = scope === 'local' ? (localPath || this.localPath) : undefined;
        await this.execGit(['config', `--${scope}`, `alias.${name}`, command], targetPath);
    }

    async updateAlias(
        oldName: string,
        name: string,
        command: string,
        scope: 'global' | 'local',
        localPath?: string,
    ): Promise<void> {
        const targetPath = scope === 'local' ? (localPath || this.localPath) : undefined;
        // If name changed, delete old one first
        if (oldName !== name) {
            try {
                await this.execGit([
                    'config',
                    `--${scope}`,
                    '--unset',
                    `alias.${oldName}`,
                ], targetPath);
            }
            catch {
                // Old alias might not exist
            }
        }

        await this.execGit(['config', `--${scope}`, `alias.${name}`, command], targetPath);
    }

    async deleteAlias(name: string, scope: 'global' | 'local', localPath?: string): Promise<void> {
        const targetPath = scope === 'local' ? (localPath || this.localPath) : undefined;
        await this.execGit(['config', `--${scope}`, '--unset', `alias.${name}`], targetPath);
    }

    validateCommand(command: string): I_ValidationResult {
        const warnings: string[] = [];
        const errors: string[] = [];

        if (!command.trim()) {
            errors.push('Command cannot be empty');

            return { valid: false, warnings, errors };
        }

        // Check for dangerous patterns
        for (const { pattern, message } of DANGEROUS_PATTERNS) {
            if (pattern.test(command)) {
                warnings.push(message);
            }
        }

        // Check for shell commands (starting with !)
        if (command.startsWith('!')) {
            warnings.push(
                'This is a shell command alias (starts with !). Use with caution.',
            );
        }

        return { valid: errors.length === 0, warnings, errors };
    }

    validateAliasName(name: string): I_ValidationResult {
        const warnings: string[] = [];
        const errors: string[] = [];

        if (!name.trim()) {
            errors.push('Alias name cannot be empty');
        }
        else if (!/^[a-z][\w-]*$/i.test(name)) {
            errors.push(
                'Alias name must start with a letter and contain only letters, numbers, hyphens, and underscores',
            );
        }

        return { valid: errors.length === 0, warnings, errors };
    }
}
