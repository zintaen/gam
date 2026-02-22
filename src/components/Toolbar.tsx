import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

interface I_ToolbarProps {
    scope: 'global' | 'local' | 'all';
    onScopeChange: (scope: 'global' | 'local' | 'all') => void;
    onAdd: () => void;
    onImport: () => void;
    onExport: () => void;
    aliasCount: number;
    localPath?: string;
    onSelectFolder?: () => void;
    onClearFolder?: () => void;
}

export function Toolbar({
    scope,
    onScopeChange,
    onAdd,
    onImport,
    onExport,
    aliasCount,
    localPath,
    onSelectFolder,
    onClearFolder,
}: I_ToolbarProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const scopes = ['all', 'global', 'local'] as const;

    return (
        <div className="flex justify-between items-center flex-wrap gap-4 relative z-10">
            <div className="flex items-center gap-4 flex-wrap">
                {/* Scope tabs */}
                <div
                    className="flex rounded-lg p-1 border"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                    {scopes.map((s) => {
                        const isActive = scope === s;
                        const label = s === 'all' ? 'All' : s === 'global' ? '🌐 Global' : '📁 Local';

                        return (
                            <button
                                key={s}
                                className={`px-4 py-1.5 text-sm font-bold whitespace-nowrap transition-all duration-200 rounded-md cursor-pointer border ${isActive
                                    ? 'border-[var(--color-border)]'
                                    : 'bg-transparent border-transparent hover:bg-[var(--color-surface-hover)]'
                                }`}
                                style={{
                                    backgroundColor: isActive ? 'var(--color-scope-active-bg)' : undefined,
                                    color: isActive
                                        ? s === 'global' ? 'var(--color-badge-global-text)' : s === 'local' ? 'var(--color-badge-local-text)' : 'var(--color-text)'
                                        : 'var(--color-text-muted)',
                                }}
                                onClick={() => onScopeChange(s)}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {scope === 'local' && (
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-dashed max-w-[320px] animate-fade-in"
                        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                        title={localPath || 'No active folder constraint'}
                    >
                        <span className="text-xs overflow-hidden text-ellipsis whitespace-nowrap font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                            {localPath ? localPath.split(/[/\\]/).pop() : 'All Repos'}
                        </span>
                        <div className="flex gap-1">
                            {localPath && (
                                <button onClick={onClearFolder} className="bg-transparent border-none cursor-pointer text-xs px-1 hover:text-[var(--color-danger)] focus:outline-none transition-colors" style={{ color: 'var(--color-text-muted)' }} title="Clear folder filter">✕</button>
                            )}
                            <button onClick={onSelectFolder} className="bg-transparent border-none cursor-pointer focus:outline-none hover:scale-110 transition-transform text-sm" style={{ color: 'var(--color-badge-global-text)' }} title="Select folder">📂</button>
                        </div>
                    </div>
                )}

                <button
                    className="group px-5 py-2 text-sm font-bold text-white border-none cursor-pointer flex items-center gap-2 btn-press theme-btn-primary"
                    onClick={onAdd}
                >
                    <span className="text-lg inline-block transition-transform duration-300 group-hover:rotate-[-15deg] group-hover:scale-110">＋</span>
                    New Alias
                </button>
            </div>

            <div className="relative inline-block" ref={dropdownRef}>
                <button
                    className="px-4 py-2 text-sm font-bold bg-transparent border rounded-md transition-all cursor-pointer btn-press"
                    style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    title="Manage Data"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    📋 Data ▾
                </button>
                {isDropdownOpen && (
                    <div
                        className="absolute right-0 top-full mt-2 min-w-[160px] glass border rounded-lg z-50 p-1 flex flex-col gap-0.5 overflow-hidden animate-bounce-in"
                        style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-border)', backdropFilter: 'var(--theme-card-backdrop)' }}
                        role="menu"
                    >
                        <button
                            className="w-full text-left px-4 py-2 bg-transparent border-none text-sm font-bold cursor-pointer rounded-md transition-colors focus:outline-none hover:bg-[var(--color-success-muted)]"
                            style={{ color: 'var(--color-text-secondary)' }}
                            role="menuitem"
                            onClick={() => {
                                onImport();
                                setIsDropdownOpen(false);
                            }}
                        >
                            ↓ Import
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 bg-transparent border-none text-sm font-bold cursor-pointer rounded-md transition-colors focus:outline-none hover:bg-[var(--color-info-muted)] disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ color: 'var(--color-text-secondary)' }}
                            role="menuitem"
                            onClick={() => {
                                onExport();
                                setIsDropdownOpen(false);
                            }}
                            disabled={aliasCount === 0}
                        >
                            ↑ Export
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
