import { useEffect } from 'react';

import type { I_ThemeConfig, T_ThemeId } from '#/types';

import { THEME_REGISTRY } from '#/lib/constants';

interface I_ThemeSettingsModalProps {
    currentThemeId: T_ThemeId;
    onSelect: (id: T_ThemeId) => void;
    onPreview: (id: T_ThemeId) => void;
    onCancelPreview: () => void;
    onClose: () => void;
}

const STYLE_ICONS: Record<string, string> = {
    glassmorphism: '◈',
    notebook: '✎',
    ide: '⌨',
};

const SWATCHES: Record<string, { bg: string; surface: string; primary: string; text: string }> = {
    'glassmorphism-dark': { bg: '#0a0e27', surface: 'rgba(255,255,255,0.08)', primary: '#06b6d4', text: '#e2e8f0' },
    'glassmorphism-light': { bg: '#e8ecf4', surface: 'rgba(255,255,255,0.7)', primary: '#0891b2', text: '#0f172a' },
    'notebook-dark': { bg: '#1e1c18', surface: '#2a2621', primary: '#44cc77', text: '#f0e8d8' },
    'notebook-light': { bg: '#faf6ee', surface: '#ece1cc', primary: '#228844', text: '#2c1810' },
    'ide-dark': { bg: '#0f172a', surface: '#1e293b', primary: '#3b82f6', text: '#f1f5f9' },
    'ide-light': { bg: '#fafafa', surface: '#ffffff', primary: '#3b82f6', text: '#1e293b' },
};

export function ThemeSettingsModal({
    currentThemeId,
    onSelect,
    onPreview,
    onCancelPreview,
    onClose,
}: I_ThemeSettingsModalProps) {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape')
                onClose();
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const themes = Object.values(THEME_REGISTRY);

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center animate-fade-in"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
            onClick={(e) => {
                if (e.target === e.currentTarget)
                    onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-settings-title"
        >
            <div
                className="w-[92%] max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden animate-bounce-in rounded-2xl border"
                style={{
                    backgroundColor: 'var(--color-surface-raised)',
                    borderColor: 'var(--color-border)',
                    backdropFilter: 'var(--theme-card-backdrop)',
                }}
                onMouseLeave={onCancelPreview}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="m-0 text-base font-bold flex items-center gap-2" id="theme-settings-title" style={{ color: 'var(--color-text)' }}>
                        ⚙ Theme Settings
                    </h2>
                    <button
                        className="bg-transparent border-none text-lg w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-125 hover:rotate-90"
                        style={{ color: 'var(--color-text-muted)' }}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Grid */}
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {themes.map((t: I_ThemeConfig) => {
                            const swatch = SWATCHES[t.id];
                            const isActive = t.id === currentThemeId;

                            return (
                                <button
                                    key={t.id}
                                    className="text-left border-2 rounded-xl p-0 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 btn-press group"
                                    style={{
                                        backgroundColor: 'var(--color-surface)',
                                        borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                                    }}
                                    onMouseEnter={() => onPreview(t.id)}
                                    onClick={() => onSelect(t.id)}
                                >
                                    {/* Swatch preview */}
                                    <div
                                        className="h-[72px] relative overflow-hidden"
                                        style={{ backgroundColor: swatch.bg }}
                                    >
                                        {/* Mini card mockup */}
                                        <div
                                            className="absolute top-3 left-3 right-3 bottom-3 rounded-md flex items-center gap-2 px-2"
                                            style={{ backgroundColor: swatch.surface, border: `1px solid rgba(128,128,128,0.15)` }}
                                        >
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: swatch.primary }} />
                                            <div className="flex-1 flex flex-col gap-1">
                                                <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: swatch.text, opacity: 0.6 }} />
                                                <div className="h-1 rounded-full w-1/2" style={{ backgroundColor: swatch.text, opacity: 0.3 }} />
                                            </div>
                                        </div>

                                        {/* Active checkmark */}
                                        {isActive && (
                                            <div
                                                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                                style={{ backgroundColor: swatch.primary }}
                                            >
                                                ✓
                                            </div>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <div className="px-3 py-2.5">
                                        <div className="text-[13px] font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
                                            <span className="text-xs">{STYLE_ICONS[t.style]}</span>
                                            {t.label}
                                        </div>
                                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                            {t.description}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
