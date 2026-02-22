import { useCallback, useMemo, useState } from 'react';

import type { I_GitAlias } from '#/types';

import { AliasForm } from './components/AliasForm';
import { AliasList } from './components/AliasList';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SearchBar } from './components/SearchBar';
import { StatusBar } from './components/StatusBar';
import { ToastContainer } from './components/Toast';
import { Toolbar } from './components/Toolbar';
import { useAliasActions } from './hooks/useAliasActions';
import { useAliases } from './hooks/useAliases';
import { useDragDrop } from './hooks/useDragDrop';
import { useLocalPath } from './hooks/useLocalPath';
import { useSearch } from './hooks/useSearch';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { isTauri, tauriAPI } from './lib/tauri';

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
    const { theme, toggleTheme } = useTheme();
    const { localPath, setLocalPath, handleSelectFolder, handleClearFolder } = useLocalPath(addToast, fetchAliases);
    const { searchQuery, setSearchQuery, debouncedQuery, filteredAliases } = useSearch(aliases);

    const [showForm, setShowForm] = useState(false);
    const [editingAlias, setEditingAlias] = useState<I_GitAlias | null>(null);
    const [deletingAlias, setDeletingAlias] = useState<I_GitAlias | null>(null);

    useDragDrop(setLocalPath, fetchAliases, addToast);

    const existingNames = useMemo(() => aliases.map(a => a.name), [aliases]);

    const {
        handleSave,
        handleConfirmDelete,
        handleImport,
        handleExport,
        handleOpenLocalFolder,
    } = useAliasActions({
        editingAlias,
        deletingAlias,
        aliases,
        addAlias,
        updateAlias,
        deleteAlias,
        addToast,
        setDeletingAlias,
    });

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

    const handleOpenExternal = useCallback(async (url: string) => {
        if (isTauri) {
            await tauriAPI.openExternal(url);
        }
        else {
            window.open(url, '_blank');
        }
    }, []);

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
                    onOpenExternal={handleOpenExternal}
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
