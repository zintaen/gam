import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';

import type { I_LibraryAlias } from '../services/gitalias-library';

import { getAllAliases, getByCategory, getCategories, searchLibrary } from '../services/gitalias-library';

interface I_AliasLibraryPickerProps {
    onSelect: (alias: I_LibraryAlias) => void;
    onClose: () => void;
}

export function AliasLibraryPicker({ onSelect, onClose }: I_AliasLibraryPickerProps) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const categories = useMemo(() => getCategories(), []);

    const filteredAliases = useMemo(() => {
        let results: I_LibraryAlias[];
        if (search.trim()) {
            results = searchLibrary(search);
        }
        else if (activeCategory) {
            results = getByCategory(activeCategory);
        }
        else {
            results = getAllAliases();
        }
        return results;
    }, [search, activeCategory]);

    const handleCategoryClick = useCallback((cat: string) => {
        setActiveCategory(prev => prev === cat ? null : cat);
        setSearch('');
    }, []);

    const handleSelect = useCallback((alias: I_LibraryAlias) => {
        onSelect(alias);
        onClose();
    }, [onSelect, onClose]);

    return (
        <div
            className="fixed inset-0 bg-ink/25 dark:bg-black/50 backdrop-blur-[3px] flex items-center justify-center z-[300] animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-paper dark:bg-paper-dark border border-pencil/20 dark:border-pencil-dark/20 sketchy w-[92%] max-w-[680px] max-h-[85vh] flex flex-col overflow-hidden pencil-box animate-bounce-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-dashed border-paper-line dark:border-paper-line-dark">
                    <h2 className="m-0 text-base font-bold text-ink dark:text-ink-dark flex items-center gap-2" id="library-picker-title">
                        <span className="inline-block animate-wiggle">📚</span>
                        Alias Library
                        <span className="text-xs font-normal text-pencil dark:text-pencil-dark ml-1">
                            from GitAlias
                        </span>
                    </h2>
                    <button
                        className="bg-transparent border-none text-lg w-7 h-7 flex items-center justify-center cursor-pointer text-ink-faint dark:text-ink-faint-dark transition-all duration-200 hover:text-red-pen hover:scale-125 hover:rotate-90"
                        onClick={onClose}
                        aria-label="Close library"
                    >
                        ✕
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 pt-4 pb-2">
                    <div className="relative ink-underline">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint dark:text-ink-faint-dark pointer-events-none">🔍</span>
                        <input
                            type="text"
                            className="w-full bg-paper dark:bg-paper-dark border-2 border-pencil/15 dark:border-pencil-dark/15 rounded py-2 pl-9 pr-3 text-sm text-ink dark:text-ink-dark placeholder:text-ink-faint/40 dark:placeholder:text-ink-faint-dark/40 transition-all duration-200 focus-glow focus:outline-none"
                            placeholder="Search aliases by name, command, or description…"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setActiveCategory(null);
                            }}
                            autoFocus
                            aria-label="Search aliases"
                        />
                    </div>
                </div>

                {/* Category chips */}
                <div className="px-6 py-2 flex flex-wrap gap-1.5 border-b border-dashed border-paper-line dark:border-paper-line-dark">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer transition-all duration-200 border btn-press ${activeCategory === cat
                                ? 'bg-blue-pen/15 dark:bg-blue-pen-dark/15 border-blue-pen/30 dark:border-blue-pen-dark/30 text-blue-pen dark:text-blue-pen-dark'
                                : 'bg-eraser/20 dark:bg-eraser-dark/20 border-pencil/10 dark:border-pencil-dark/10 text-pencil dark:text-pencil-dark hover:bg-eraser/40 dark:hover:bg-eraser-dark/40'
                            }`}
                            onClick={() => handleCategoryClick(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Alias list */}
                <div className="flex-1 overflow-y-auto px-6 py-3 flex flex-col gap-2 min-h-0">
                    {filteredAliases.length === 0
                        ? (
                                <div className="text-center py-8 text-pencil dark:text-pencil-dark text-sm">
                                    <span className="block text-2xl mb-2">🤷</span>
                                    No aliases found matching your search.
                                </div>
                            )
                        : (
                                <>
                                    <div className="text-xs text-pencil dark:text-pencil-dark mb-1">
                                        {filteredAliases.length}
                                        {' '}
                                        alias
                                        {filteredAliases.length !== 1 ? 'es' : ''}
                                        {' '}
                                        found
                                        {activeCategory && (
                                            <span className="ml-1">
                                                in
                                                <strong>{activeCategory}</strong>
                                            </span>
                                        )}
                                    </div>
                                    {filteredAliases.map((alias, i) => (
                                        <button
                                            key={`${alias.name}-${i}`}
                                            type="button"
                                            className="w-full text-left bg-eraser/10 dark:bg-eraser-dark/10 border border-pencil/8 dark:border-pencil-dark/8 rounded p-3 cursor-pointer transition-all duration-200 hover:bg-highlight-yellow/15 dark:hover:bg-highlight-yellow/8 hover:border-pencil/20 dark:hover:border-pencil-dark/20 hover:-translate-y-0.5 group btn-press"
                                            style={{ animation: `rowEnter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${Math.min(i * 0.03, 0.5)}s both` }}
                                            onClick={() => handleSelect(alias)}
                                            title="Click to use this alias"
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Name badge */}
                                                <span className="shrink-0 font-mono text-sm font-bold text-blue-pen dark:text-blue-pen-dark bg-blue-pen/8 dark:bg-blue-pen-dark/10 border border-blue-pen/15 dark:border-blue-pen-dark/15 px-2 py-0.5 rounded min-w-[60px] text-center">
                                                    {alias.name}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    {/* Description */}
                                                    <div className="text-sm text-ink dark:text-ink-dark font-bold leading-tight mb-1 capitalize">
                                                        {alias.description}
                                                    </div>
                                                    {/* Command preview */}
                                                    <div className="font-mono text-xs text-ink-light dark:text-ink-light-dark leading-snug break-all line-clamp-2">
                                                        {alias.command}
                                                    </div>
                                                </div>
                                                {/* Category badge */}
                                                <span className="shrink-0 text-[10px] font-bold text-pencil dark:text-pencil-dark bg-eraser/30 dark:bg-eraser-dark/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                    {alias.category}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center px-6 py-3 border-t border-dashed border-paper-line dark:border-paper-line-dark text-xs text-pencil dark:text-pencil-dark">
                    <span>
                        Source:
                        {' '}
                        <a href="https://github.com/GitAlias/gitalias" target="_blank" rel="noopener noreferrer" className="text-blue-pen dark:text-blue-pen-dark hover:underline">GitAlias/gitalias</a>
                    </span>
                    <button
                        type="button"
                        className="px-4 py-1.5 text-sm font-bold text-pencil dark:text-pencil-dark bg-transparent border border-pencil/15 dark:border-pencil-dark/15 rounded hover:bg-eraser/25 dark:hover:bg-eraser-dark/25 transition-all cursor-pointer btn-press"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
