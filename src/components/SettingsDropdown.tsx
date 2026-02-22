import { useEffect, useRef, useState } from 'react';

import type { I_ThemeConfig, T_ThemeId } from '#/types';

import { THEME_REGISTRY } from '#/lib/constants';

interface I_SettingsDropdownProps {
    themeId: T_ThemeId;
    onSelectTheme: (id: T_ThemeId) => void;
    onPreviewTheme: (id: T_ThemeId) => void;
    onCancelPreview: () => void;
    onOpenThemeSettings: () => void;
    onImport: () => void;
    onExport: () => void;
    aliasCount: number;
    onOpenExternal: (url: string) => void;
}

type T_OpenPanel = 'theme' | 'data' | 'about' | null;

const STYLE_GROUPS: { style: string; label: string }[] = [
    { style: 'glassmorphism', label: 'Glassmorphism' },
    { style: 'sketch', label: 'Conceptual Sketch' },
    { style: 'cybercore', label: 'Cybercore' },
    { style: 'baroque', label: 'Baroque' },
    { style: 'shabby', label: 'Shabby Chic' },
    { style: 'gothic', label: 'Gothic' },
    { style: 'victorian', label: 'Victorian' },
    { style: 'cottagecore', label: 'Cottagecore' },
    { style: 'pixel', label: 'Pixel Art' },
    { style: 'filigree', label: 'Filigree' },
];

const STYLE_ICONS: Record<string, string> = {
    glassmorphism: '◈',
    sketch: '✎',
    cybercore: '⌬',
    baroque: '♛',
    shabby: '❀',
    gothic: '⛧',
    victorian: '⚜',
    cottagecore: '🌿',
    pixel: '▦',
    filigree: '❋',
};

const SWATCHES: Record<string, { bg: string; primary: string; surface: string }> = {
    'glassmorphism-dark': { bg: '#06091a', primary: '#22d3ee', surface: '#111830' },
    'glassmorphism-light': { bg: '#dde4f0', primary: '#0891b2', surface: '#eef2fc' },
    'sketch-dark': { bg: '#181610', primary: '#55cc88', surface: '#222018' },
    'sketch-light': { bg: '#f5f0e2', primary: '#1a6638', surface: '#efe8d6' },
    'cybercore-dark': { bg: '#050505', primary: '#00ff88', surface: '#0c0c0c' },
    'cybercore-light': { bg: '#eaf5ee', primary: '#007744', surface: '#ddeee2' },
    'baroque-dark': { bg: '#080400', primary: '#dab040', surface: '#150e04' },
    'baroque-light': { bg: '#f8f2e4', primary: '#906820', surface: '#f0e6cc' },
    'shabby-dark': { bg: '#161012', primary: '#e09090', surface: '#20181c' },
    'shabby-light': { bg: '#fdf8f4', primary: '#c87878', surface: '#fff9f5' },
    'gothic-dark': { bg: '#060608', primary: '#cc2828', surface: '#100e12' },
    'gothic-light': { bg: '#eee8e4', primary: '#7a0e0e', surface: '#e4dcd4' },
    'victorian-dark': { bg: '#0c0806', primary: '#8b1818', surface: '#181210' },
    'victorian-light': { bg: '#f6eee0', primary: '#6a1010', surface: '#eee2cc' },
    'cottagecore-dark': { bg: '#14100c', primary: '#6aa050', surface: '#1e1814' },
    'cottagecore-light': { bg: '#f6f0e4', primary: '#4a7a30', surface: '#efe6d4' },
    'pixel-dark': { bg: '#18182a', primary: '#00cc66', surface: '#202040' },
    'pixel-light': { bg: '#e0e0ee', primary: '#008844', surface: '#eaeaf6' },
    'filigree-dark': { bg: '#08080e', primary: '#b8a070', surface: '#121218' },
    'filigree-light': { bg: '#f8f6f0', primary: '#7a6838', surface: '#f0ece2' },
};

export function SettingsDropdown({
    themeId,
    onSelectTheme,
    onPreviewTheme,
    onCancelPreview,
    onOpenThemeSettings,
    onImport,
    onExport,
    aliasCount,
    onOpenExternal,
}: I_SettingsDropdownProps) {
    const [openPanel, setOpenPanel] = useState<T_OpenPanel>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpenPanel(null);
                onCancelPreview();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onCancelPreview]);

    const toggle = (panel: T_OpenPanel) => {
        setOpenPanel((prev) => {
            if (prev !== null && prev !== panel)
                onCancelPreview();
            return prev === panel ? null : panel;
        });
    };

    const close = () => {
        setOpenPanel(null);
        onCancelPreview();
    };

    const themes = Object.values(THEME_REGISTRY);

    const btnClass = (active: boolean) =>
        `group/tip flex items-center justify-center h-6 px-1.5 bg-transparent border border-transparent cursor-pointer text-[11px] transition-all duration-200 rounded-md ${active
            ? 'text-[var(--color-text)] bg-[var(--color-surface-hover)] border-[var(--color-border)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
        }`;

    const tooltip = (label: string) => (
        <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity duration-150 z-[9999]" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>
            {label}
        </span>
    );

    return (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1" ref={containerRef}>
            {/* ── Theme button ─── */}
            <div className="relative">
                <button
                    className={btnClass(openPanel === 'theme')}
                    onClick={() => toggle('theme')}
                >
                    🎨
                    {tooltip('Theme')}
                </button>

                {openPanel === 'theme' && (
                    <div
                        className="absolute right-0 top-full mt-2 w-[280px] border rounded-xl z-50 overflow-hidden animate-bounce-in shadow-xl no-theme-transition"
                        style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-border)', maxHeight: 'calc(100vh - 70px)' }}
                        role="menu"
                    >
                        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px)' }}>
                            <div
                                className="px-1.5 py-2 flex flex-col gap-0.5"
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
                                            <div className="flex gap-1 px-1.5 pb-1">
                                                {groupThemes.map((t: I_ThemeConfig) => {
                                                    const swatch = SWATCHES[t.id];
                                                    const isActive = t.id === themeId;
                                                    return (
                                                        <button
                                                            key={t.id}
                                                            className={`flex-1 rounded-lg border-2 cursor-pointer transition-all duration-150 overflow-hidden p-0 ${isActive
                                                                ? 'border-[var(--color-primary)] scale-[1.02]'
                                                                : 'border-transparent hover:border-[var(--color-border-strong)]'
                                                            }`}
                                                            style={{ background: 'none' }}
                                                            role="menuitem"
                                                            onMouseEnter={() => onPreviewTheme(t.id)}
                                                            onClick={() => {
                                                                onSelectTheme(t.id);
                                                                close();
                                                            }}
                                                        >
                                                            <div className="h-[28px] relative" style={{ backgroundColor: swatch.bg }}>
                                                                <div
                                                                    className="absolute inset-[4px] rounded-[2px]"
                                                                    style={{ backgroundColor: swatch.surface, border: `1px solid ${swatch.primary}33` }}
                                                                >
                                                                    <div className="absolute top-[3px] left-[4px] right-[4px] h-[2px] rounded-full" style={{ backgroundColor: swatch.primary, opacity: 0.7 }} />
                                                                    <div className="absolute bottom-[3px] left-[4px] w-[40%] h-[1px] rounded-full" style={{ backgroundColor: swatch.primary, opacity: 0.3 }} />
                                                                </div>
                                                                {isActive && (
                                                                    <div className="absolute top-[2px] right-[2px] w-[10px] h-[10px] rounded-full flex items-center justify-center text-[6px] font-bold text-white" style={{ backgroundColor: swatch.primary }}>✓</div>
                                                                )}
                                                            </div>
                                                            <div className="text-[10px] py-1 text-center font-bold" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)' }}>
                                                                {t.mode === 'dark' ? '🌙' : '☀️'}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                                    <button
                                        className="w-full text-left px-3 py-1.5 bg-transparent border-none text-[12px] text-[var(--color-text-muted)] cursor-pointer rounded-lg hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-colors"
                                        onClick={() => {
                                            onOpenThemeSettings();
                                            close();
                                        }}
                                    >
                                        ⚙ All Themes…
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Data button ─── */}
            <div className="relative">
                <button
                    className={btnClass(openPanel === 'data')}
                    onClick={() => toggle('data')}
                >
                    📋
                    {tooltip('Data')}
                </button>

                {openPanel === 'data' && (
                    <div
                        className="absolute right-0 top-full mt-2 w-[180px] border rounded-xl z-50 overflow-hidden animate-bounce-in shadow-xl no-theme-transition"
                        style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-border)' }}
                        role="menu"
                    >
                        <div className="p-1.5 flex flex-col gap-0.5">
                            <button
                                className="w-full text-left px-3 py-2 bg-transparent border-none text-[13px] cursor-pointer rounded-lg transition-colors hover:bg-[var(--color-success-muted)] flex items-center gap-2"
                                style={{ color: 'var(--color-text-secondary)' }}
                                role="menuitem"
                                onClick={() => {
                                    onImport();
                                    close();
                                }}
                            >
                                <span>↓</span>
                                {' '}
                                Import JSON
                            </button>
                            <button
                                className="w-full text-left px-3 py-2 bg-transparent border-none text-[13px] cursor-pointer rounded-lg transition-colors hover:bg-[var(--color-info-muted)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                                style={{ color: 'var(--color-text-secondary)' }}
                                role="menuitem"
                                onClick={() => {
                                    onExport();
                                    close();
                                }}
                                disabled={aliasCount === 0}
                            >
                                <span>↑</span>
                                {' '}
                                Export JSON
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── About button ─── */}
            <div className="relative">
                <button
                    className={btnClass(openPanel === 'about')}
                    onClick={() => toggle('about')}
                >
                    ℹ️
                    {tooltip('About')}
                </button>

                {openPanel === 'about' && (
                    <div
                        className="absolute right-0 top-full mt-2 w-[220px] border rounded-xl z-50 overflow-hidden animate-bounce-in shadow-xl no-theme-transition"
                        style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-border)' }}
                        role="menu"
                    >
                        <div className="px-4 py-3 flex flex-col gap-2 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-[14px]" style={{ color: 'var(--color-text)' }}>GAM</span>
                                <span className="px-1.5 py-px rounded text-[10px] font-mono" style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}>v1.0.0</span>
                            </div>
                            <div style={{ color: 'var(--color-text-muted)' }}>Git Alias Manager</div>
                            <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                    <span>👤</span>
                                    <span>Stephen Cheng</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>✉️</span>
                                    <button
                                        className="bg-transparent border-none p-0 cursor-pointer hover:underline text-[12px]"
                                        style={{ color: 'var(--color-primary)' }}
                                        onClick={() => onOpenExternal('mailto:zintaen@gmail.com')}
                                    >
                                        zintaen@gmail.com
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>🔗</span>
                                    <button
                                        className="bg-transparent border-none p-0 cursor-pointer hover:underline text-[12px]"
                                        style={{ color: 'var(--color-primary)' }}
                                        onClick={() => onOpenExternal('https://github.com/zintaen/gam')}
                                    >
                                        github.com/zintaen/gam
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>📄</span>
                                    <span>MIT License</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
