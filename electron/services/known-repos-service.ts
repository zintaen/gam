import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

export class KnownReposService {
    private configPath: string;
    private knownPaths: Set<string>;

    constructor() {
        // Handle Vitest / Node environments where the Electron app object is undefined
        const userDataPath = app ? app.getPath('userData') : path.join(process.cwd(), '.gam-test');

        if (!fs.existsSync(userDataPath)) {
            try {
                fs.mkdirSync(userDataPath, { recursive: true });
            }
            catch {
                // Ignore mkdir errors
            }
        }

        this.configPath = path.join(userDataPath, 'known-repos.json');
        this.knownPaths = new Set();
        this.load();
    }

    private load() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                const paths = JSON.parse(data);
                if (Array.isArray(paths)) {
                    // Filter out paths that no longer exist
                    this.knownPaths = new Set(paths.filter(p => fs.existsSync(p)));
                }
            }
        }
        catch (e) {
            console.error('Failed to load known repos config', e);
        }
    }

    private save() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(Array.from(this.knownPaths), null, 2), 'utf8');
        }
        catch (e) {
            console.error('Failed to save known repos config', e);
        }
    }

    add(repoPath: string) {
        if (!this.knownPaths.has(repoPath)) {
            this.knownPaths.add(repoPath);
            this.save();
        }
    }

    getAll(): string[] {
        return Array.from(this.knownPaths);
    }

    remove(repoPath: string) {
        if (this.knownPaths.delete(repoPath)) {
            this.save();
        }
    }
}
