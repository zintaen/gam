import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import type { I_GitAlias } from '../types';

interface I_AliasListProps {
    aliases: I_GitAlias[];
    loading: boolean;
    searchQuery: string;
    localPath?: string;
    onEdit: (alias: I_GitAlias) => void;
    onDelete: (alias: I_GitAlias) => void;
    onOpenLocalFolder: (path: string) => void;
}

type T_SortKey = 'name' | 'command' | 'scope' | 'rank';
type T_SortDir = 'asc' | 'desc';

interface I_AliasListItemProps {
    alias: I_GitAlias;
    localPath?: string;
    index: number;
    onEdit: (alias: I_GitAlias) => void;
    onDelete: (alias: I_GitAlias) => void;
    onOpenLocalFolder: (path: string) => void;
}

const AliasListItem = React.memo(({
    alias,
    localPath,
    index,
    onEdit,
    onDelete,
    onOpenLocalFolder,
}: I_AliasListItemProps) => {
    const isGlobal = alias.scope === 'global';
    const scopeColor = isGlobal
        ? 'border-l-blue-pen dark:border-l-blue-pen-dark'
        : 'border-l-purple-pen dark:border-l-purple-pen-dark';

    return (
        <tr
            className={`group border-b border-dashed border-paper-line dark:border-paper-line-dark border-l-2 ${scopeColor} hover:bg-highlight-yellow/10 dark:hover:bg-highlight-yellow/5 row-hover-lift`}
            style={{ animation: `rowEnter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.04}s both` }}
        >
            <td>
                <span className={`font-mono font-bold text-[15px] px-2 py-0.5 inline-block ${isGlobal ? 'text-blue-pen dark:text-blue-pen-dark' : 'text-purple-pen dark:text-purple-pen-dark'}`}>
                    {alias.name}
                </span>
            </td>
            <td className="text-center">
                <span className={`font-mono text-sm ${isGlobal ? 'text-blue-pen/50 dark:text-blue-pen-dark/50' : 'text-purple-pen/50 dark:text-purple-pen-dark/50'}`}>{alias.score ? Math.round(alias.score) : '—'}</span>
            </td>
            <td>
                <span className={`font-mono text-[13px] break-all inline-block max-w-[400px] overflow-hidden text-ellipsis ${isGlobal ? 'text-ink-light dark:text-ink-light-dark' : 'text-purple-pen/70 dark:text-purple-pen-dark/70'}`} title={alias.command}>
                    {alias.command}
                </span>
            </td>
            <td>
                <span
                    className={`inline-block px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-all ${isGlobal ? 'bg-blue-pen/6 dark:bg-blue-pen-dark/8 text-blue-pen/70 dark:text-blue-pen-dark/70 border border-blue-pen/12 dark:border-blue-pen-dark/12 rounded-sm' : 'bg-purple-pen/8 dark:bg-purple-pen-dark/10 text-purple-pen dark:text-purple-pen-dark border border-purple-pen/15 dark:border-purple-pen-dark/15 rounded-sm'} ${!isGlobal && (alias.localPath || localPath) ? 'hover:bg-purple-pen/15 dark:hover:bg-purple-pen-dark/15 cursor-pointer underline decoration-dotted' : ''}`}
                    onClick={() => {
                        const targetPath = alias.localPath || localPath;
                        if (alias.scope === 'local' && targetPath) {
                            onOpenLocalFolder(targetPath);
                        }
                    }}
                    title={!isGlobal && (alias.localPath || localPath) ? 'Click to open local repository folder' : ''}
                >
                    {!isGlobal && (alias.localPath || localPath) ? (alias.localPath || localPath)!.split(/[/\\]/).pop() : alias.scope}
                </span>
            </td>
            <td>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                    <button className="bg-transparent border-none text-base cursor-pointer hover:scale-125 transition-all duration-200 p-0.5" onClick={() => onEdit(alias)} title="Edit alias" aria-label={`Edit alias ${alias.name}`}>
                        ✏️
                    </button>
                    <button
                        className="bg-transparent border-none text-base cursor-pointer hover:scale-125 transition-all duration-200 p-0.5 hover:text-red-pen"
                        onClick={() => onDelete(alias)}
                        title="Delete alias"
                        aria-label={`Delete alias ${alias.name}`}
                    >
                        🗑
                    </button>
                </div>
            </td>
        </tr>
    );
});

export function AliasList({
    aliases,
    loading,
    searchQuery,
    localPath,
    onEdit,
    onDelete,
    onOpenLocalFolder,
}: I_AliasListProps) {
    const [sortKey, setSortKey] = useState<T_SortKey>('name');
    const [sortDir, setSortDir] = useState<T_SortDir>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredAliases = useMemo(() => {
        let result = [...aliases];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                a =>
                    a.name.toLowerCase().includes(q)
                    || a.command.toLowerCase().includes(q),
            );
        }

        result.sort((a, b) => {
            if (sortKey === 'rank') {
                const aScore = a.score || 0;
                const bScore = b.score || 0;
                const cmp = bScore - aScore;

                if (cmp === 0) {
                    return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                }

                return sortDir === 'asc' ? cmp : -cmp;
            }

            const aVal = a[sortKey];
            const bVal = b[sortKey];
            const cmp = String(aVal).localeCompare(String(bVal));

            return sortDir === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [aliases, searchQuery, sortKey, sortDir]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, aliases, sortKey, sortDir]);

    const handleSort = (key: T_SortKey) => {
        if (sortKey === key) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        }
        else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const totalPages = Math.max(1, Math.ceil(filteredAliases.length / itemsPerPage));
    const paginatedAliases = filteredAliases.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const sortIcon = (key: T_SortKey) => {
        if (sortKey !== key) {
            return null;
        }

        return <span className="ml-1 text-focus dark:text-focus-dark">{sortDir === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="flex-1 bg-paper/50 dark:bg-paper-dark/50 border border-pencil/12 dark:border-pencil-dark/12 sketchy overflow-hidden flex flex-col page-fold">
            <table className="w-full text-left table-fixed">
                <thead>
                    <tr className="border-b-2 border-pencil/15 dark:border-pencil-dark/15">
                        <th
                            className={`px-5 py-3 font-bold text-[11px] uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-all duration-200 hover:bg-highlight-yellow/8 dark:hover:bg-highlight-yellow/5 w-1/4 ${sortKey === 'name' ? 'text-ink dark:text-ink-dark border-b-2 border-focus dark:border-focus-dark' : 'text-pencil dark:text-pencil-dark'}`}
                            onClick={() => handleSort('name')}
                            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSort('name')}
                            role="button"
                            tabIndex={0}
                            aria-sort={sortKey === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                            Alias
                            {sortIcon('name')}
                        </th>
                        <th
                            className={`px-5 py-3 font-bold text-[11px] uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-all duration-200 hover:bg-highlight-yellow/8 dark:hover:bg-highlight-yellow/5 text-center w-[90px] ${sortKey === 'rank' ? 'text-ink dark:text-ink-dark border-b-2 border-focus dark:border-focus-dark' : 'text-pencil dark:text-pencil-dark'}`}
                            onClick={() => handleSort('rank')}
                            title="Sort by telemetry usage rate"
                            role="button"
                            tabIndex={0}
                            aria-sort={sortKey === 'rank' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                            Usage
                            {sortIcon('rank')}
                        </th>
                        <th
                            className={`px-5 py-3 font-bold text-[11px] uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-all duration-200 hover:bg-highlight-yellow/8 dark:hover:bg-highlight-yellow/5 ${sortKey === 'command' ? 'text-ink dark:text-ink-dark border-b-2 border-focus dark:border-focus-dark' : 'text-pencil dark:text-pencil-dark'}`}
                            onClick={() => handleSort('command')}
                            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSort('command')}
                            role="button"
                            tabIndex={0}
                            aria-sort={sortKey === 'command' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                            Command
                            {sortIcon('command')}
                        </th>
                        <th
                            className={`px-5 py-3 font-bold text-[11px] uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-all duration-200 hover:bg-highlight-yellow/8 dark:hover:bg-highlight-yellow/5 w-[15%] ${sortKey === 'scope' ? 'text-ink dark:text-ink-dark border-b-2 border-focus dark:border-focus-dark' : 'text-pencil dark:text-pencil-dark'}`}
                            onClick={() => handleSort('scope')}
                            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSort('scope')}
                            role="button"
                            tabIndex={0}
                            aria-sort={sortKey === 'scope' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                            Scope
                            {sortIcon('scope')}
                        </th>
                        <th className="px-5 py-3 font-bold text-[11px] text-pencil dark:text-pencil-dark uppercase tracking-wider w-20">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading
                        ? (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="flex flex-col items-center justify-center p-16 text-pencil dark:text-pencil-dark">
                                            <div className="text-4xl animate-float mb-4">✏️</div>
                                            <span className="text-sm font-bold mb-2">Loading aliases...</span>
                                            <div className="w-32 h-1 rounded-full overflow-hidden bg-eraser/30 dark:bg-eraser-dark/30">
                                                <div className="h-full shimmer-bg rounded-full" />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )
                        : aliases.length === 0
                            ? (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="flex flex-col items-center justify-center p-14 text-center animate-fade-in">
                                                <div className="text-5xl mb-4 animate-float">📝</div>
                                                <div className="text-lg font-bold text-ink dark:text-ink-dark mb-1">This notebook is empty!</div>
                                                <div className="text-sm text-ink-faint dark:text-ink-faint-dark max-w-[280px] mb-4">
                                                    Start writing your first alias or import an existing collection.
                                                </div>
                                                <div className="w-16 h-px bg-pencil/20 dark:bg-pencil-dark/20" />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            : filteredAliases.length === 0
                                ? (
                                        <tr>
                                            <td colSpan={5}>
                                                <div className="flex flex-col items-center justify-center p-20 text-center animate-fade-in">
                                                    <div className="text-4xl mb-3 animate-float">🔍</div>
                                                    <div className="text-lg font-bold text-ink dark:text-ink-dark mb-1">Nothing found</div>
                                                    <div className="text-sm text-ink-faint dark:text-ink-faint-dark max-w-[280px]">
                                                        Try a different search term.
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                : (
                                        paginatedAliases.map((alias, idx) => {
                                            return (
                                                <AliasListItem
                                                    key={`${alias.scope}-${alias.name}`}
                                                    alias={alias}
                                                    localPath={localPath}
                                                    index={idx}
                                                    onEdit={onEdit}
                                                    onDelete={onDelete}
                                                    onOpenLocalFolder={onOpenLocalFolder}
                                                />
                                            );
                                        })
                                    )}
                </tbody>
            </table>
            {totalPages > 1 && (
                <div className="px-6 py-3.5 border-t border-dashed border-paper-line dark:border-paper-line-dark flex justify-between items-center">
                    <button
                        className="px-3 py-1 text-sm font-bold text-pencil dark:text-pencil-dark bg-transparent border border-pencil/15 dark:border-pencil-dark/15 rounded cursor-pointer hover:bg-highlight-yellow/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all btn-press"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                        ← Prev
                    </button>
                    <span className="text-[11px] text-pencil dark:text-pencil-dark font-bold uppercase tracking-wider">
                        {currentPage}
                        {' '}
                        /
                        {totalPages}
                    </span>
                    <button
                        className="px-3 py-1 text-sm font-bold text-pencil dark:text-pencil-dark bg-transparent border border-pencil/15 dark:border-pencil-dark/15 rounded cursor-pointer hover:bg-highlight-yellow/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all btn-press"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
