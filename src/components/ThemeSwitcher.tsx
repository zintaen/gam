import { useEffect, useRef, useState } from 'react';

import type { I_ThemeConfig, T_ThemeId } from '#/types';

import { THEME_REGISTRY } from '#/lib/constants';

interface I_ThemeSwitcherProps {
    themeId: T_ThemeId;
    onSelect: (id: T_ThemeId) => void;
    onPreview: (id: T_ThemeId) => void;
    onCancelPreview: () => void;
    onOpenSettings: () => void;
}

const STYLE_GROUPS: { style: string; label: string }[] = [
    { style: 'glassmorphism', label: 'Glassmorphism' },
    { style: 'notebook', label: 'Notebook' },
    { style: 'ide', label: 'IDE' },
];

const STYLE_ICONS: Record<string, string> = {
    glassmorphism: '◈',
    notebook: '✎',
    ide: '⌨',
};

const MODE_ICONS: Record<string, string> = {
    dark: '🌙',
    light: '☀️',
};

export function ThemeSwitcher({
    themeId,
    onSelect,
    onPreview,
    onCancelPreview,
    onOpenSettings,
}: I_ThemeSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                onCancelPreview();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onCancelPreview]);

    const current = THEME_REGISTRY[themeId];
    const themes = Object.values(THEME_REGISTRY);

    return (
        <div className="theme-toggle relative" ref={dropdownRef}>
            <button
                className="flex items-center gap-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] cursor-pointer text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-200 hover:border-[var(--color-border-strong)] px-2.5 py-1 rounded-lg"
                onClick={() => setIsOpen(!isOpen)}
                title="Switch Theme"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span>{STYLE_ICONS[current.style]}</span>
                <span>{MODE_ICONS[current.mode]}</span>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 min-w-[200px] bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl z-50 p-1.5 flex flex-col gap-0.5 overflow-hidden animate-bounce-in"
                    style={{ backdropFilter: 'var(--theme-card-backdrop)', WebkitBackdropFilter: 'var(--theme-card-backdrop)' }}
                    role="menu"
                    onMouseLeave={onCancelPreview}
                >
                    {STYLE_GROUPS.map((group) => {
                        const groupThemes = themes.filter(t => t.style === group.style);
                        return (
                            <div key={group.style}>
                                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                                    {STYLE_ICONS[group.style]}
                                    {' '}
                                    {group.label}
                                </div>
                                {groupThemes.map((t: I_ThemeConfig) => (
                                    <button
                                        key={t.id}
                                        className={`w-full text-left px-3 py-1.5 bg-transparent border-none text-[13px] cursor-pointer rounded-lg transition-all duration-150 flex items-center justify-between gap-2 ${t.id === themeId
                                            ? 'text-[var(--color-primary)] font-bold bg-[var(--color-primary-muted)]'
                                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                                        }`}
                                        role="menuitem"
                                        onMouseEnter={() => onPreview(t.id)}
                                        onClick={() => {
                                            onSelect(t.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className="text-xs">{MODE_ICONS[t.mode]}</span>
                                            <span>{t.mode === 'dark' ? 'Dark' : 'Light'}</span>
                                        </span>
                                        {t.id === themeId && <span className="text-[var(--color-primary)] text-sm">✓</span>}
                                    </button>
                                ))}
                            </div>
                        );
                    })}

                    <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                        <button
                            className="w-full text-left px-3 py-1.5 bg-transparent border-none text-[12px] text-[var(--color-text-muted)] cursor-pointer rounded-lg hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-colors"
                            onClick={() => {
                                onOpenSettings();
                                setIsOpen(false);
                            }}
                        >
                            ⚙ Theme Settings…
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
