import * as React from 'react';
import { useState } from 'react';

interface I_StatusBarProps {
    totalAliases: number;
    filteredCount: number;
    scope: string;
    isSearching: boolean;
}

export function StatusBar({ totalAliases, filteredCount, scope, isSearching }: I_StatusBarProps) {
    const scopeLabel = scope === 'all' ? 'All scopes' : scope === 'global' ? 'Global' : 'Local';
    const [bananaHover, setBananaHover] = useState(false);

    return (
        <div className="flex justify-between items-center px-0.5 text-[11px] text-pencil dark:text-pencil-dark uppercase tracking-[1px] font-bold">
            <div className="flex items-center gap-2 whitespace-nowrap">
                <div className="w-1.5 h-1.5 rounded-full bg-green-pen dark:bg-green-pen-dark animate-pulse-glow text-green-pen dark:text-green-pen-dark" />
                <span>{scopeLabel}</span>
                <span className="text-ink-faint dark:text-ink-faint-dark">·</span>
                <span>
                    {isSearching
                        ? `${filteredCount} of ${totalAliases}`
                        : `${totalAliases} alias${totalAliases !== 1 ? 'es' : ''}`}
                </span>
            </div>
            <button
                onClick={() => {
                    const url = 'https://buymeacoffee.com/zintaen';
                    if (typeof window !== 'undefined' && window.electronAPI) {
                        window.electronAPI.openExternal(url);
                    }
                    else {
                        window.open(url, '_blank');
                    }
                }}
                onMouseEnter={() => setBananaHover(true)}
                onMouseLeave={() => setBananaHover(false)}
                className="text-ink-faint dark:text-ink-faint-dark hover:text-ink dark:hover:text-ink-dark transition-colors text-[11px] font-bold flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
                title="Support GAM development"
            >
                <span
                    className="inline-block"
                    style={bananaHover ? { animation: 'bananaWiggle 0.5s ease-in-out' } : undefined}
                >
                    🍌
                </span>
                {' '}
                Buy Me A Banana
            </button>
        </div>
    );
}
