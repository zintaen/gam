import * as React from 'react';
import { useEffect, useRef } from 'react';

interface I_SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    resultCount: number;
    totalCount: number;
}

export function SearchBar({ value, onChange, totalCount }: I_SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                inputRef.current?.focus();
            }

            if (e.key === 'Escape' && document.activeElement === inputRef.current) {
                onChange('');
                inputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handler);

        return () => window.removeEventListener('keydown', handler);
    }, [onChange]);

    return (
        <div className="relative ink-underline" role="search">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-pencil dark:text-pencil-dark text-base pointer-events-none select-none transition-transform duration-200 ${value ? 'scale-110' : 'scale-100'}`} aria-hidden="true">🔍</span>
            <input
                ref={inputRef}
                type="search"
                className="w-full bg-paper/80 dark:bg-paper-dark/80 border border-pencil/12 dark:border-pencil-dark/12 sketchy py-3.5 pl-11 pr-14 text-[15px] text-ink dark:text-ink-dark placeholder:text-ink-faint/40 dark:placeholder:text-ink-faint-dark/40 transition-all duration-300 focus-glow focus:outline-none"
                placeholder="Search aliases… (⌘F)"
                value={value}
                onChange={e => onChange(e.target.value)}
                aria-label="Search aliases"
            />
            {value
                ? (
                        <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-ink-faint dark:text-ink-faint-dark text-base cursor-pointer p-0.5 hover:text-red-pen hover:scale-125 hover:rotate-90 transition-all duration-200 focus:outline-none"
                            onClick={() => onChange('')}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )
                : totalCount > 0
                    ? (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-eraser/30 dark:bg-eraser-dark/30 px-1.5 py-px rounded text-[11px] font-mono font-bold text-pencil dark:text-pencil-dark pointer-events-none select-none animate-fade-in">
                                {totalCount}
                            </span>
                        )
                    : null}
        </div>
    );
}
