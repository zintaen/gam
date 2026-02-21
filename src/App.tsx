import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { I_GitAlias } from './types';

import { AliasForm } from './components/AliasForm';
import { AliasList } from './components/AliasList';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SearchBar } from './components/SearchBar';
import { StatusBar } from './components/StatusBar';
import { ToastContainer } from './components/Toast';
import { Toolbar } from './components/Toolbar';
import { useAliases } from './hooks/useAliases';
import { useToast } from './hooks/useToast';

const isElectron
    = typeof window !== 'undefined' && window.electronAPI !== undefined;

export default function App() {
    const {
        aliases,
        loading,
        error,
        scope,
        setScope,
        fetchAliases,
        addAlias,
        updateAlias,
        deleteAlias,
    } = useAliases();

    const { toasts, addToast, removeToast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingAlias, setEditingAlias] = useState<I_GitAlias | null>(null);
    const [deletingAlias, setDeletingAlias] = useState<I_GitAlias | null>(null);

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const stored = localStorage.getItem('gam-theme');

        if (stored === 'dark' || stored === 'light') {
            return stored;
        }

        return 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('gam-theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(t => (t === 'light' ? 'dark' : 'light'));
    }, []);

    const [localPath, setLocalPath] = useState('');

    useEffect(() => {
        if (isElectron) {
            window.electronAPI.getLocalPath().then((res) => {
                if (res.success && res.data) {
                    setLocalPath(res.data);
                }
            });
        }
    }, []);

    const handleSelectFolder = useCallback(async () => {
        if (!isElectron) {
            return;
        }

        try {
            const res = await window.electronAPI.selectFolder();

            if (res.success && res.data) {
                setLocalPath(res.data);
                fetchAliases();
            }
        }
        catch (e: any) {
            addToast('error', e.message || 'Failed to select folder');
        }
    }, [fetchAliases, addToast]);

    const handleClearFolder = useCallback(async () => {
        if (!isElectron) {
            return;
        }

        try {
            const res = await window.electronAPI.setLocalPath('');

            if (res.success) {
                setLocalPath('');
                fetchAliases();
                addToast('info', 'Viewing all known local repositories');
            }
        }
        catch (e: any) {
            addToast('error', e.message || 'Failed to clear folder filter');
        }
    }, [fetchAliases, addToast]);

    useEffect(() => {
        const handleDrop = async (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                const path = (e.dataTransfer.files[0] as any).path;

                if (path && isElectron) {
                    const res = await window.electronAPI.setLocalPath(path);

                    if (res.success) {
                        setLocalPath(path);
                        fetchAliases();
                        addToast('success', `Selected folder: ${path.split('/').pop()}`);
                    }
                }
            }
        };
        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        window.addEventListener('drop', handleDrop);
        window.addEventListener('dragover', handleDragOver);

        return () => {
            window.removeEventListener('drop', handleDrop);
            window.removeEventListener('dragover', handleDragOver);
        };
    }, [fetchAliases, addToast]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const existingNames = useMemo(() => aliases.map(a => a.name), [aliases]);

    const filteredAliases = useMemo(() => {
        if (!debouncedQuery) {
            return aliases;
        }

        const q = debouncedQuery.toLowerCase();

        return aliases.filter(
            a =>
                a.name.toLowerCase().includes(q) || a.command.toLowerCase().includes(q),
        );
    }, [aliases, debouncedQuery]);

    const handleAdd = useCallback(() => {
        setEditingAlias(null);
        setShowForm(true);
    }, []);

    const handleEdit = useCallback((alias: I_GitAlias) => {
        setEditingAlias(alias);
        setShowForm(true);
    }, []);

    const handleDelete = useCallback((alias: I_GitAlias) => {
        setDeletingAlias(alias);
    }, []);

    const handleOpenLocalFolder = useCallback(async (path: string) => {
        if (!isElectron) {
            addToast('info', 'Folder access is only available in the desktop app');

            return;
        }
        try {
            await window.electronAPI.openLocalFolder(path);
        }
        catch (err: any) {
            addToast('error', err.message || 'Failed to open folder');
        }
    }, [addToast]);

    const handleSave = useCallback(
        async (name: string, command: string, aliasScope: 'global' | 'local', targetLocalPath?: string) => {
            if (editingAlias) {
                if (editingAlias.scope === 'global' && aliasScope === 'local') {
                    await addAlias(name, command, aliasScope, targetLocalPath);
                    addToast('success', `Created new local alias "${name}"`);
                }
                else {
                    await updateAlias(editingAlias.name, name, command, aliasScope, targetLocalPath);
                    addToast('success', `Alias "${name}" updated`);
                }
            }
            else {
                await addAlias(name, command, aliasScope, targetLocalPath);
                addToast('success', `Alias "${name}" created`);
            }
        },
        [editingAlias, addAlias, updateAlias, addToast],
    );

    const handleConfirmDelete = useCallback(async () => {
        if (deletingAlias) {
            try {
                await deleteAlias(deletingAlias.name, deletingAlias.scope, deletingAlias.localPath);
                addToast('success', `Alias "${deletingAlias.name}" deleted`);
            }
            catch (err: any) {
                addToast('error', err.message || 'Failed to delete alias');
            }
            setDeletingAlias(null);
        }
    }, [deletingAlias, deleteAlias, addToast]);

    const handleImport = useCallback(async () => {
        if (!isElectron) {
            addToast('info', 'Import is available in the desktop app');

            return;
        }
        try {
            const result = await window.electronAPI.importAliases();

            if (result.success && result.data) {
                let added = 0;

                for (const alias of result.data) {
                    try {
                        await addAlias(alias.name, alias.command, alias.scope || 'global');
                        added++;
                    }
                    catch {
                        // Skip duplicates
                    }
                }
                addToast('success', `Imported ${added} alias${added !== 1 ? 'es' : ''}`);
            }
            else if (result.error) {
                if (!result.error.includes('cancelled')) {
                    addToast('error', result.error);
                }
            }
        }
        catch (err: any) {
            if (!err.message?.includes('cancelled')) {
                addToast('error', err.message || 'Import failed');
            }
        }
    }, [addAlias, addToast]);

    const handleExport = useCallback(async () => {
        if (!isElectron) {
            const data = {
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                aliases,
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gam-${new Date().toISOString()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            addToast('success', `Exported ${aliases.length} aliases`);

            return;
        }
        try {
            const result = await window.electronAPI.exportAliases(aliases);
            if (result.success) {
                addToast('success', `Exported ${aliases.length} aliases`);
            }
            else if (result.error && !result.error.includes('cancelled')) {
                addToast('error', result.error);
            }
        }
        catch (err: any) {
            if (!err.message?.includes('cancelled')) {
                addToast('error', err.message || 'Export failed');
            }
        }
    }, [aliases, addToast]);

    return (
        <>
            {/* Title Bar */}
            <div className="relative z-[100]">
                <div
                    className="titlebar h-11 flex items-center justify-center border-b border-pencil/10 dark:border-pencil-dark/10 bg-paper/80 dark:bg-paper-dark/80 glass relative"
                >
                    {/* Subtle red margin line */}
                    <div className="absolute left-10 top-0 bottom-0 w-px bg-red-pen/15" />
                    <span className="text-sm font-bold tracking-[2px] text-ink dark:text-ink-dark uppercase flex items-center gap-1.5">
                        <span className="marker-yellow px-1">✎ GAM</span>
                        <span className="text-[10px] font-normal text-ink-faint dark:text-ink-faint-dark tracking-normal bg-eraser/30 dark:bg-eraser-dark/30 px-1.5 py-px rounded">v1.0.0</span>
                    </span>
                    <button
                        className="theme-toggle absolute right-4 bg-transparent border-none cursor-pointer text-lg text-ink-faint dark:text-ink-faint-dark hover:text-ink dark:hover:text-ink-dark transition-all duration-300 hover:scale-125 hover:rotate-[20deg] active:scale-95"
                        onClick={toggleTheme}
                        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                    >
                        <span className="inline-block transition-transform duration-500">{theme === 'light' ? '🌙' : '☀️'}</span>
                    </button>
                </div>
                {/* Animated gradient accent strip */}
                <div className="gradient-accent h-[2px] w-full" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col px-6 py-5 gap-5 overflow-hidden relative">
                {/* Red margin line */}
                <div className="absolute left-10 top-0 bottom-0 w-px bg-red-pen/8 z-0 pointer-events-none" />

                <Toolbar
                    scope={scope}
                    onScopeChange={setScope as any}
                    onAdd={handleAdd}
                    onImport={handleImport}
                    onExport={handleExport}
                    aliasCount={aliases.length}
                    localPath={localPath}
                    onSelectFolder={handleSelectFolder}
                    onClearFolder={handleClearFolder}
                />

                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    resultCount={filteredAliases.length}
                    totalCount={aliases.length}
                />

                {error && (
                    <div className="sketchy-sm bg-red-pen/8 dark:bg-red-pen/12 border border-red-pen/25 text-red-pen px-5 py-3 flex items-center gap-3">
                        <span className="font-bold text-lg">✗</span>
                        <span className="text-sm font-bold">{error}</span>
                    </div>
                )}

                <AliasList
                    aliases={filteredAliases}
                    loading={loading}
                    searchQuery={debouncedQuery}
                    localPath={localPath}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onOpenLocalFolder={handleOpenLocalFolder}
                />

                <StatusBar
                    totalAliases={aliases.length}
                    filteredCount={filteredAliases.length}
                    scope={scope}
                    isSearching={!!searchQuery}
                />
            </div>

            {showForm && (
                <AliasForm
                    alias={editingAlias}
                    existingNames={existingNames}
                    currentScope={scope}
                    localPath={localPath}
                    onSelectFolder={handleSelectFolder}
                    onSave={handleSave}
                    onClose={() => setShowForm(false)}
                />
            )}

            {deletingAlias && (
                <ConfirmDialog
                    title="Delete Alias"
                    message={`Are you sure you want to delete "${deletingAlias.name}"?`}
                    detail={`git ${deletingAlias.name} → ${deletingAlias.command}`}
                    confirmLabel="Delete"
                    confirmDanger
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeletingAlias(null)}
                />
            )}

            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </>
    );
}
