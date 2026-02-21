import * as React from 'react';
import { useEffect, useState } from 'react';

interface I_ConfirmDialogProps {
    title: string;
    message: string;
    detail?: string;
    confirmLabel?: string;
    confirmDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    title,
    message,
    detail,
    confirmLabel = 'Confirm',
    confirmDanger = false,
    onConfirm,
    onCancel,
}: I_ConfirmDialogProps) {
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };
        window.addEventListener('keydown', handler);
        // Trigger entrance after mount for danger shake
        const timer = setTimeout(() => setEntered(true), 400);

        return () => {
            window.removeEventListener('keydown', handler);
            clearTimeout(timer);
        };
    }, [onCancel]);

    return (
        <div className="fixed inset-0 bg-ink/25 dark:bg-black/50 backdrop-blur-[3px] flex items-center justify-center z-[200] animate-fade-in" onClick={onCancel}>
            <div
                className="bg-paper dark:bg-paper-dark border border-pencil/20 dark:border-pencil-dark/20 sketchy w-[90%] max-w-[380px] flex flex-col overflow-hidden pencil-box animate-bounce-in"
                style={confirmDanger && entered ? { animation: 'dangerShake 0.5s ease-in-out' } : undefined}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center px-5 py-3 border-b border-dashed border-paper-line dark:border-paper-line-dark">
                    <h2 className="m-0 text-base font-bold text-ink dark:text-ink-dark flex items-center gap-2">
                        {confirmDanger && <span className="text-red-pen text-lg">⚠</span>}
                        {title}
                    </h2>
                    <button className="bg-transparent border-none text-lg w-7 h-7 flex items-center justify-center cursor-pointer text-ink-faint dark:text-ink-faint-dark hover:text-red-pen hover:scale-125 hover:rotate-90 transition-all duration-200" onClick={onCancel}>✕</button>
                </div>

                <div className="flex flex-col gap-3 py-4 px-5">
                    <div className="text-ink dark:text-ink-dark text-sm leading-relaxed">{message}</div>
                    {detail && <div className="font-mono text-xs bg-eraser/25 dark:bg-eraser-dark/25 px-3 py-2 rounded text-ink-light dark:text-ink-light-dark break-all border border-dashed border-pencil/10 dark:border-pencil-dark/10">{detail}</div>}
                </div>

                <div className="flex justify-end gap-2.5 px-5 py-3 border-t border-dashed border-paper-line dark:border-paper-line-dark">
                    <button className="px-4 py-1.5 text-sm font-bold text-pencil dark:text-pencil-dark bg-transparent border border-pencil/15 dark:border-pencil-dark/15 rounded hover:bg-eraser/25 dark:hover:bg-eraser-dark/25 transition-all cursor-pointer btn-press" onClick={onCancel}>Cancel</button>
                    <button
                        className={`px-4 py-1.5 text-sm font-bold border rounded transition-all cursor-pointer pencil-box btn-press ${confirmDanger ? 'bg-red-pen text-paper border-red-pen hover:opacity-90 danger-glow' : 'bg-blue-pen dark:bg-blue-pen-dark text-paper border-blue-pen dark:border-blue-pen-dark hover:opacity-90'}`}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
