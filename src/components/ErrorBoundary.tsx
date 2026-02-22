import * as React from 'react';

interface I_ErrorBoundaryProps {
    children: React.ReactNode;
}

interface I_ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<I_ErrorBoundaryProps, I_ErrorBoundaryState> {
    constructor(props: I_ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center w-screen h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
                    <div className="text-center max-w-[460px] p-8 border rounded-xl" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <h2 className="text-xl font-bold mb-3">Something went wrong</h2>
                        <div className="p-3 rounded mb-5 overflow-x-auto" style={{ backgroundColor: 'var(--color-surface-hover)' }}>
                            <p className="font-mono text-sm m-0" style={{ color: 'var(--color-text-secondary)' }}>{this.state.error?.message}</p>
                        </div>
                        <button
                            className="px-5 py-1.5 font-bold bg-transparent border rounded cursor-pointer transition-all hover:-translate-y-0.5"
                            style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                            onClick={this.handleReset}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
