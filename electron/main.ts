import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { gitService, registerIpcHandlers } from './ipc-handlers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 750,
        minWidth: 800,
        minHeight: 550,
        title: 'GAM — Git Alias Manager',
        trafficLightPosition: { x: 16, y: 16 },
        backgroundColor: '#0f172a',
        show: false,
        icon: path.join(__dirname, '../../build/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });

    // Graceful show to avoid blank flash
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    // Dev or production URL
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    // Evaluate CLI argument for folder
    const args = process.argv.slice(1);
    const cwdArg = args.find(a => !a.startsWith('-') && !a.endsWith('.js') && !a.endsWith('.ts'));
    if (cwdArg && cwdArg !== '.') {
        gitService.setLocalPath(path.resolve(process.cwd(), cwdArg));
    }
    else if (cwdArg === '.') {
        gitService.setLocalPath(process.cwd());
    }

    registerIpcHandlers();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
