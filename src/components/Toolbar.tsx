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
                {/* Scope tabs with animated sliding indicator */}
                <div className="flex bg-eraser/25 dark:bg-eraser-dark/25 rounded-lg p-1 border border-pencil/8 dark:border-pencil-dark/8">
                    {scopes.map((s) => {
                        const isActive = scope === s;
                        const label = s === 'all' ? 'All' : s === 'global' ? '🌐 Global' : '📁 Local';
                        const activeColor = s === 'global' ? 'text-blue-pen dark:text-blue-pen-dark' : s === 'local' ? 'text-purple-pen dark:text-purple-pen-dark' : 'text-ink dark:text-ink-dark';

                        return (
                            <button
                                key={s}
                                className={`px-4 py-1.5 text-sm font-bold whitespace-nowrap transition-all duration-200 rounded-md ${isActive ? `bg-paper dark:bg-paper-dark ${activeColor} border border-pencil/12 dark:border-pencil-dark/12 pencil-box` : 'bg-transparent text-pencil dark:text-pencil-dark border border-transparent hover:text-ink dark:hover:text-ink-dark hover:bg-highlight-yellow/10'}`}
                                onClick={() => onScopeChange(s)}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {scope === 'local' && (
                    <div
                        className="flex items-center gap-2 bg-eraser/15 dark:bg-eraser-dark/15 px-3 py-1.5 rounded-md border border-dashed border-pencil/12 dark:border-pencil-dark/12 max-w-[320px] animate-fade-in"
                        title={localPath || 'No active folder constraint'}
                    >
                        <span className="text-xs text-ink-light dark:text-ink-light-dark overflow-hidden text-ellipsis whitespace-nowrap font-bold">
                            {localPath ? localPath.split(/[/\\]/).pop() : 'All Repos'}
                        </span>
                        <div className="flex gap-1">
                            {localPath && (
                                <button onClick={onClearFolder} className="bg-transparent border-none cursor-pointer text-ink-faint dark:text-ink-faint-dark text-xs px-1 hover:text-red-pen focus:outline-none transition-colors" title="Clear folder filter">✕</button>
                            )}
                            <button onClick={onSelectFolder} className="bg-transparent border-none cursor-pointer text-blue-pen dark:text-blue-pen-dark focus:outline-none hover:scale-110 transition-transform text-sm" title="Select folder">📂</button>
                        </div>
                    </div>
                )}

                <button
                    className="group px-5 py-2 text-sm font-bold text-paper bg-green-pen dark:bg-green-pen-dark border border-green-pen dark:border-green-pen-dark rounded-md hover:opacity-90 transition-all cursor-pointer flex items-center gap-2 pencil-box btn-press"
                    onClick={onAdd}
                >
                    <span className="text-lg inline-block transition-transform duration-300 group-hover:rotate-[-15deg] group-hover:scale-110">＋</span>
                    New Alias
                </button>
            </div>

            <div className="relative inline-block" ref={dropdownRef}>
                <button
                    className="px-4 py-2 text-sm font-bold text-pencil dark:text-pencil-dark bg-transparent border border-pencil/12 dark:border-pencil-dark/12 rounded-md hover:bg-highlight-yellow/10 transition-all cursor-pointer btn-press"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    title="Manage Data"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    📋 Data ▾
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 min-w-[160px] bg-paper/95 dark:bg-paper-dark/95 glass border border-pencil/15 dark:border-pencil-dark/15 rounded-lg pencil-box z-50 p-1 flex flex-col gap-0.5 overflow-hidden animate-bounce-in" role="menu">
                        <button
                            className="w-full text-left px-4 py-2 bg-transparent border-none text-sm font-bold text-pencil dark:text-pencil-dark cursor-pointer rounded-md hover:bg-highlight-green/15 hover:text-green-pen dark:hover:text-green-pen-dark transition-colors focus:outline-none"
                            role="menuitem"
                            onClick={() => {
                                onImport();
                                setIsDropdownOpen(false);
                            }}
                        >
                            ↓ Import
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 bg-transparent border-none text-sm font-bold text-pencil dark:text-pencil-dark cursor-pointer rounded-md hover:bg-highlight-blue/15 hover:text-blue-pen dark:hover:text-blue-pen-dark transition-colors focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
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
