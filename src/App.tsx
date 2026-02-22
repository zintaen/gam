import { useCallback, useMemo, useState } from 'react';

import type { I_GitAlias } from '#/types';

import { AliasForm } from './components/AliasForm';
import { AliasList } from './components/AliasList';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SearchBar } from './components/SearchBar';
import { SettingsDropdown } from './components/SettingsDropdown';
import { StatusBar } from './components/StatusBar';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
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
    const { themeId, themeConfig, setThemeId, previewTheme, cancelPreview } = useTheme();
    const { localPath, setLocalPath, handleSelectFolder, handleClearFolder } = useLocalPath(addToast, fetchAliases);
    const { searchQuery, setSearchQuery, debouncedQuery, filteredAliases } = useSearch(aliases);

    const [showForm, setShowForm] = useState(false);
    const [editingAlias, setEditingAlias] = useState<I_GitAlias | null>(null);
    const [deletingAlias, setDeletingAlias] = useState<I_GitAlias | null>(null);
    const [showThemeSettings, setShowThemeSettings] = useState(false);

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
                    className="titlebar h-11 flex items-center justify-center border-b glass relative"
                    style={{
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        backdropFilter: 'var(--theme-card-backdrop)',
                    }}
                >
                    {/* Red margin line (notebook only) */}
                    <div className="nb-margin-line absolute left-10 top-0 bottom-0 w-px" style={{ backgroundColor: 'var(--color-danger)', opacity: 0.15 }} />

                    <span className="text-sm font-bold tracking-[2px] uppercase flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
                        <span className="px-1" style={{ color: 'var(--color-text)' }}>
                            {{ glassmorphism: '◈', sketch: '✎', cybercore: '⌬', baroque: '♛', shabby: '❀', gothic: '⛧', victorian: '⚜', cottagecore: '🌿', pixel: '▦', filigree: '❋' }[themeConfig.style] || '◈'}
                            {' '}
                            GAM
                        </span>
                        <span
                            className="text-[10px] font-normal tracking-normal px-1.5 py-px rounded"
                            style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface-hover)' }}
                        >
                            v1.0.0
                        </span>
                    </span>

                    <SettingsDropdown
                        themeId={themeId}
                        onSelectTheme={setThemeId}
                        onPreviewTheme={previewTheme}
                        onCancelPreview={cancelPreview}
                        onOpenThemeSettings={() => setShowThemeSettings(true)}
                        onImport={handleImport}
                        onExport={handleExport}
                        aliasCount={aliases.length}
                        onOpenExternal={handleOpenExternal}
                    />
                </div>
                {/* Animated gradient accent strip */}
                <div className="gradient-accent theme-gradient-accent h-[2px] w-full" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col px-6 py-5 gap-5 overflow-hidden relative">
                {/* Red margin line (notebook only) */}
                <div className="nb-margin-line absolute left-10 top-0 bottom-0 w-px z-0 pointer-events-none" style={{ backgroundColor: 'var(--color-danger)', opacity: 0.08 }} />

                <Toolbar
                    scope={scope}
                    onScopeChange={setScope as any}
                    onAdd={handleAdd}
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
                    <div
                        className="rounded-lg border px-5 py-3 flex items-center gap-3"
                        style={{ backgroundColor: 'var(--color-danger-muted)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                    >
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

            {showThemeSettings && (
                <ThemeSettingsModal
                    currentThemeId={themeId}
                    onSelect={(id) => {
                        setThemeId(id);
                        setShowThemeSettings(false);
                    }}
                    onPreview={previewTheme}
                    onCancelPreview={cancelPreview}
                    onClose={() => {
                        cancelPreview();
                        setShowThemeSettings(false);
                    }}
                />
            )}

            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </>
    );
}
