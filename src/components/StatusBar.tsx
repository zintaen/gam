import * as React from 'react';

interface I_StatusBarProps {
    totalAliases: number;
    filteredCount: number;
    scope: string;
    isSearching: boolean;
    onOpenExternal: (url: string) => void;
}

export const StatusBar = React.memo(({ totalAliases, filteredCount, scope, isSearching, onOpenExternal }: I_StatusBarProps) => {
    const scopeLabel = scope === 'all' ? 'All scopes' : scope === 'global' ? 'Global' : 'Local';
    const countLabel = isSearching
        ? `${filteredCount} of ${totalAliases}`
        : `${totalAliases} ${totalAliases === 1 ? 'alias' : 'aliases'}`;

    return (
        <div className="flex justify-between items-center px-0.5 text-[11px] uppercase tracking-[1px] font-bold" style={{ color: 'var(--color-text-muted)' }}>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-success)' }} />
                <span>{scopeLabel}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>·</span>
                <span>{countLabel}</span>
            </div>
            <button
                className="transition-colors text-[11px] font-bold flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
                style={{ color: 'var(--color-text-muted)' }}
                onClick={() => onOpenExternal('https://buymeacoffee.com/zintaen')}
                title="Support GAM development"
            >
                🍌 Buy Me A Banana
            </button>
        </div>
    );
});
