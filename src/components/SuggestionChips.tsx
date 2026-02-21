import * as React from 'react';

import type { I_AliasSuggestion } from '../services/suggestion-service';

interface I_SuggestionChipsProps {
    suggestions: I_AliasSuggestion[];
    onSelect: (alias: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: I_SuggestionChipsProps) {
    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-1.5 p-2.5 bg-highlight-green/8 dark:bg-highlight-green/5 border border-dashed border-green-pen/20 dark:border-green-pen-dark/20 rounded animate-fade-in">
            <div className="text-green-pen dark:text-green-pen-dark text-xs font-bold flex items-center gap-1">
                <span className="inline-block animate-float text-sm">💡</span>
                Suggested names:
            </div>
            <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s, i) => (
                    <button
                        key={`${s.alias}-${i}`}
                        type="button"
                        className="bg-blue-pen/8 dark:bg-blue-pen-dark/10 border border-blue-pen/15 dark:border-blue-pen-dark/15 text-blue-pen dark:text-blue-pen-dark px-2 py-0.5 rounded cursor-pointer transition-all duration-200 hover:bg-blue-pen/15 dark:hover:bg-blue-pen-dark/15 hover:-translate-y-0.5 hover:scale-105 font-bold btn-press"
                        style={{ animation: `chipPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.06}s both` }}
                        onClick={() => onSelect(s.alias)}
                        title={`${s.reason} (${s.scheme})`}
                    >
                        <span className="font-mono text-sm">{s.alias}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
