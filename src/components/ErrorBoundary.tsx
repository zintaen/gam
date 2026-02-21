import type { ErrorInfo, ReactNode } from 'react';

import * as React from 'react';

interface I_Props { children: ReactNode }
interface I_State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<I_Props, I_State> {
    public state: I_State = { hasError: false, error: null };

    public static getDerivedStateFromError(error: Error): I_State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => { this.setState({ hasError: false, error: null }); };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center w-screen h-screen bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark">
                    <div className="text-center max-w-[460px] p-8 bg-paper dark:bg-paper-dark border border-pencil/20 dark:border-pencil-dark/20 sketchy pencil-box">
                        <h2 className="mb-3 text-xl font-bold text-red-pen">Oops, the ink spilled!</h2>
                        <div className="bg-eraser/25 dark:bg-eraser-dark/25 p-3 rounded mb-5 overflow-x-auto">
                            <p className="text-ink-light dark:text-ink-light-dark font-mono text-sm m-0">{this.state.error?.message}</p>
                        </div>
                        <button className="px-5 py-1.5 font-bold bg-transparent text-ink dark:text-ink-dark border border-pencil/15 dark:border-pencil-dark/15 rounded cursor-pointer transition-all hover:-translate-y-0.5 hover:bg-highlight-yellow/15" onClick={this.handleReset}>
                            ✎ Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
