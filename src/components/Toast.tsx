import * as React from 'react';

import type { I_Toast } from '../hooks/useToast';

const ICONS: Record<string, string> = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };

interface I_ToastContainerProps {
    toasts: I_Toast[];
    onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: I_ToastContainerProps) {
    if (toasts.length === 0) {
        return null;
    }

    const accentClass: Record<string, string> = {
        success: 'toast-accent--success',
        error: 'toast-accent--error',
        warning: 'toast-accent--warning',
        info: 'toast-accent--info',
    };

    const progressColor: Record<string, string> = {
        success: 'bg-green-pen dark:bg-green-pen-dark',
        error: 'bg-red-pen',
        warning: 'bg-highlight-yellow',
        info: 'bg-blue-pen dark:bg-blue-pen-dark',
    };

    return (
        <div className="fixed bottom-5 right-5 flex flex-col items-end gap-2.5 z-[1000] pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast-accent ${accentClass[toast.type]} flex flex-col pointer-events-auto transition-all duration-300 min-w-[200px] max-w-[360px] pencil-box animate-bounce-in rounded-lg ${toast.exiting ? 'opacity-0 scale-95 translate-y-3 pointer-events-none' : ''} ${toast.type === 'success' ? 'bg-highlight-green/20 dark:bg-highlight-green/10 border border-green-pen/25 dark:border-green-pen-dark/25 text-green-pen dark:text-green-pen-dark' : toast.type === 'error' ? 'bg-highlight-pink/20 dark:bg-highlight-pink/10 border border-red-pen/25 text-red-pen' : toast.type === 'warning' ? 'bg-highlight-yellow/20 dark:bg-highlight-yellow/10 border border-highlight-yellow/50 text-ink dark:text-ink-dark' : 'bg-highlight-blue/20 dark:bg-highlight-blue/10 border border-blue-pen/25 dark:border-blue-pen-dark/25 text-blue-pen dark:text-blue-pen-dark'}`}
                >
                    <div className="flex items-center gap-2.5 px-4 py-2.5 pl-5">
                        <span className="text-lg shrink-0 font-bold">{ICONS[toast.type]}</span>
                        <span className="flex-1 text-sm font-bold">{toast.message}</span>
                        <button className="bg-transparent border-none opacity-50 text-sm cursor-pointer px-0.5 hover:opacity-100 hover:scale-110 transition-all" onClick={() => onDismiss(toast.id)}>✕</button>
                    </div>
                    {/* Progress bar */}
                    <div className="h-[2px] w-full px-1 pb-1">
                        <div
                            className={`h-full rounded-full opacity-40 animate-progress-shrink ${progressColor[toast.type]}`}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
