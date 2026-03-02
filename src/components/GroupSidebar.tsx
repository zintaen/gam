import { useCallback, useEffect, useRef, useState } from 'react';

import type { I_AliasGroup } from '#/types';

const PALETTE = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
];

function ColorDot({ color, onChange }: { color: string; onChange: (c: string) => void }) {
    const [open, setOpen] = useState(false);
    const [hex, setHex] = useState(color);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        setHex(color);
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open, color]);

    const applyHex = () => {
        const cleaned = hex.trim();

        if (/^#[0-9a-f]{6}$/i.test(cleaned)) {
            onChange(cleaned);
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative inline-flex items-center justify-center w-8 h-8 flex-shrink-0">
            <button
                type="button"
                className="w-3.5 h-3.5 rounded-full border border-white/20 cursor-pointer hover:scale-125 transition-transform p-0 bg-transparent"
                style={{ backgroundColor: color }}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(v => !v);
                }}
                title="Click to change color"
            />
            {open && (
                <div
                    className="absolute left-0 top-full mt-1 z-50 rounded-lg shadow-lg border"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        width: 132,
                    }}
                >
                    <div className="grid grid-cols-4 gap-2 p-2.5">
                        {PALETTE.map(c => (
                            <button
                                key={c}
                                type="button"
                                className="rounded-full border-2 cursor-pointer p-0 hover:scale-125 transition-transform"
                                style={{
                                    backgroundColor: c,
                                    borderColor: c === color ? 'white' : 'transparent',
                                    width: 20,
                                    height: 20,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(c);
                                    setOpen(false);
                                }}
                            />
                        ))}
                    </div>
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-2 border-t"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <span
                            className="inline-block w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                            style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(hex) ? hex : color }}
                        />
                        <input
                            type="text"
                            value={hex}
                            onChange={e => setHex(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyHex()}
                            onBlur={applyHex}
                            placeholder="#ff9900"
                            maxLength={7}
                            className="flex-1 text-xs font-mono px-1.5 py-0.5 rounded border bg-transparent outline-none"
                            style={{
                                color: 'var(--color-text)',
                                borderColor: 'var(--color-border)',
                                width: 70,
                            }}
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

const DEFAULT_COLORS = PALETTE.slice(0, 8);

interface I_GroupSidebarProps {
    groups: I_AliasGroup[];
    activeGroupId: string | null;
    onSelectGroup: (id: string | null) => void;
    onCreateGroup: (name: string, color: string) => Promise<I_AliasGroup | null>;
    onRenameGroup: (id: string, name: string) => Promise<void>;
    onSetGroupColor: (id: string, color: string) => Promise<void>;
    onDeleteGroup: (id: string) => Promise<void>;
    aliasCount?: Record<string, number>;
}

export function GroupSidebar({
    groups,
    activeGroupId,
    onSelectGroup,
    onCreateGroup,
    onRenameGroup,
    onSetGroupColor,
    onDeleteGroup,
    aliasCount = {},
}: I_GroupSidebarProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(DEFAULT_COLORS[0]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleCreate = useCallback(async () => {
        const trimmed = newName.trim();
        if (!trimmed) {
            return;
        }
        await onCreateGroup(trimmed, newColor);
        setNewName('');
        setNewColor(DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]);
        setIsCreating(false);
    }, [newName, newColor, onCreateGroup]);

    const handleRename = useCallback(async (id: string) => {
        const trimmed = editName.trim();
        if (!trimmed) {
            return;
        }
        await onRenameGroup(id, trimmed);
        setEditingId(null);
    }, [editName, onRenameGroup]);

    return (
        <div
            className="flex flex-col gap-1 py-2"
            style={{ minWidth: 180 }}
        >
            {/* All (no filter) */}
            <button
                type="button"
                className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-md text-sm text-left transition-colors cursor-pointer border-none ${activeGroupId === null ? 'font-bold' : 'font-normal'}`}
                style={{
                    backgroundColor: activeGroupId === null ? 'var(--color-surface-hover)' : 'transparent',
                    color: 'var(--color-text)',
                }}
                onClick={() => onSelectGroup(null)}
            >
                <span>All</span>
            </button>

            {/* Group list */}
            {groups.map(group => (
                <div key={group.id} className="flex items-center gap-1.5 group relative">
                    {editingId === group.id
                        ? (
                                <input
                                    className="flex-1 text-sm px-3 py-1 bg-transparent border rounded-md outline-none"
                                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter')
                                            handleRename(group.id);
                                        if (e.key === 'Escape')
                                            setEditingId(null);
                                    }}
                                    onBlur={() => handleRename(group.id)}
                                    autoFocus
                                />
                            )
                        : (
                                <div className="flex-1 flex items-center gap-0">
                                    <ColorDot
                                        color={group.color}
                                        onChange={c => onSetGroupColor(group.id, c)}
                                    />
                                    {/* Group name button */}
                                    <button
                                        type="button"
                                        className={`flex-1 flex items-center justify-between gap-2 py-1.5 pr-2 rounded-md text-sm text-left transition-colors cursor-pointer border-none ${activeGroupId === group.id ? 'font-bold' : 'font-normal'}`}
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: 'var(--color-text)',
                                        }}
                                        onClick={() => onSelectGroup(group.id)}
                                        onDoubleClick={() => {
                                            setEditingId(group.id);
                                            setEditName(group.name);
                                        }}
                                    >
                                        <span className="truncate max-w-[110px]">{group.name}</span>
                                        {(aliasCount[group.id] ?? 0) > 0 && (
                                            <span
                                                className="text-xs tabular-nums"
                                                style={{ color: 'var(--color-text-muted)' }}
                                            >
                                                {aliasCount[group.id]}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            )}

                    {/* Context actions */}
                    {editingId !== group.id && (
                        <button
                            type="button"
                            className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity px-1 text-xs cursor-pointer bg-transparent border-none"
                            style={{ color: 'var(--color-danger)' }}
                            onClick={() => onDeleteGroup(group.id)}
                            title="Delete group"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}

            {/* Create new group */}
            {isCreating
                ? (
                        <div className="flex items-center gap-1.5 px-2 py-1">
                            <input
                                type="color"
                                value={newColor}
                                onChange={e => setNewColor(e.target.value)}
                                className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
                            />
                            <input
                                className="flex-1 text-sm px-2 py-1 bg-transparent border rounded-md outline-none"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                placeholder="Group name"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreate();
                                    }
                                    if (e.key === 'Escape') {
                                        setIsCreating(false);
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                    )
                : (
                        <button
                            type="button"
                            className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer bg-transparent border-none rounded-md transition-colors"
                            style={{ color: 'var(--color-text-muted)' }}
                            onClick={() => setIsCreating(true)}
                        >
                            <span>+</span>
                            <span>New group</span>
                        </button>
                    )}
        </div>
    );
}
