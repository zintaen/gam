import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export class RankingService {
    private historyCache: Map<string, number> = new Map();
    private lastFetchTime = 0;
    private readonly CACHE_TTL = 1000 * 5; // 5 seconds
    private refreshPromise: Promise<void> | null = null;

    async getScores(aliases: { name: string; command: string }[]): Promise<Record<string, number>> {
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_TTL || this.historyCache.size === 0) {
            if (!this.refreshPromise) {
                this.refreshPromise = this.refreshHistoryCache().finally(() => {
                    this.refreshPromise = null;
                });
            }
            await this.refreshPromise;
            this.lastFetchTime = Date.now();
        }

        const scores: Record<string, number> = {};
        for (const alias of aliases) {
            const countName = this.historyCache.get(`git ${alias.name}`) || 0;
            // Extract the base command (e.g. 'checkout -b' -> 'checkout') to ensure we get a match
            const baseCmd = alias.command.split(' ')[0];
            const countCmd = this.historyCache.get(`git ${baseCmd}`) || 0;

            // Display the true exact uses of the alias + a scaled boost from the raw command usage
            scores[alias.name] = Math.round(countName + (countCmd * 0.2));
        }

        return scores;
    }

    private async refreshHistoryCache() {
        try {
            const newCache = new Map<string, number>();
            let historyContent = '';

            if (os.platform() !== 'win32') {
                try {
                    historyContent += `${await fs.readFile(path.join(os.homedir(), '.zsh_history'), 'utf-8')}\n`;
                }
                catch { /* ignore */ }

                try {
                    historyContent += `${await fs.readFile(path.join(os.homedir(), '.bash_history'), 'utf-8')}\n`;
                }
                catch { /* ignore */ }
            }
            else {
                try {
                    const psHistoryPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'PowerShell', 'PSReadLine', 'ConsoleHost_history.txt');
                    historyContent += `${await fs.readFile(psHistoryPath, 'utf-8')}\n`;
                }
                catch { /* ignore */ }
            }

            if (!historyContent) {
                return;
            }

            // Using regex to find all occurrences of "git [command]" across any OS history file directly
            const regex = /git\s+([\w-]+)/g;
            const matches = historyContent.matchAll(regex);
            for (const match of matches) {
                const cmd = `git ${match[1]}`;
                newCache.set(cmd, (newCache.get(cmd) || 0) + 1);
            }

            this.historyCache = newCache;
        }
        catch (error) {
            console.error('Failed to parse shell history for rankings:', error);
        }
    }
}
