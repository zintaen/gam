import { readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    resolve: {
        alias: {
            '#': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'text-summary'],
            include: ['src/**/*.ts', 'src/**/*.tsx'],
            exclude: ['src/main.tsx', 'src/vite-env.d.ts'],
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 60,
                statements: 70,
            },
        },
    },
});
