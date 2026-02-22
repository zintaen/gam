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
            if (e.key === 'Escape')
                onCancel();
        };
        window.addEventListener('keydown', handler);
        const timer = setTimeout(() => setEntered(true), 400);

        return () => {
            window.removeEventListener('keydown', handler);
            clearTimeout(timer);
        };
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 backdrop-blur-[3px] flex items-center justify-center z-[200] animate-fade-in"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            onClick={onCancel}
        >
            <div
                className="w-[90%] max-w-[380px] flex flex-col overflow-hidden animate-bounce-in rounded-xl border theme-card"
                style={{
                    backgroundColor: 'var(--color-surface-raised)',
                    borderColor: 'var(--color-border)',
                    ...(confirmDanger && entered ? { animation: 'dangerShake 0.5s ease-in-out' } : {}),
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center px-5 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="m-0 text-base font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        {confirmDanger && <span className="text-lg" style={{ color: 'var(--color-danger)' }}>⚠</span>}
                        {title}
                    </h2>
                    <button
                        className="bg-transparent border-none text-lg w-7 h-7 flex items-center justify-center cursor-pointer hover:scale-125 hover:rotate-90 transition-all duration-200"
                        style={{ color: 'var(--color-text-muted)' }}
                        onClick={onCancel}
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-3 py-4 px-5">
                    <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{message}</div>
                    {detail && (
                        <div
                            className="font-mono text-xs px-3 py-2 rounded break-all border border-dashed"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                        >
                            {detail}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2.5 px-5 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                        className="px-4 py-1.5 text-sm font-bold bg-transparent border rounded transition-all cursor-pointer btn-press"
                        style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-1.5 text-sm font-bold text-white border rounded transition-all cursor-pointer btn-press"
                        style={{
                            backgroundColor: confirmDanger ? 'var(--color-danger)' : 'var(--color-primary)',
                            borderColor: confirmDanger ? 'var(--color-danger)' : 'var(--color-primary)',
                        }}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
