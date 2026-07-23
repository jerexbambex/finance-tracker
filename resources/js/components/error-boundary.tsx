import { AlertCircleIcon } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    error: Error | null;
}

// Catches render/lifecycle errors anywhere below it so a single throw shows a
// fallback instead of blanking the whole page (React unmounts the tree on an
// uncaught error). Error boundaries must be class components.
export default class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        // Surfaced in the browser console; wire up to a reporter here if needed.
        console.error('Uncaught render error:', error, info.componentStack);
    }

    render(): ReactNode {
        const { error } = this.state;

        if (!error) {
            return this.props.children;
        }

        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
                <AlertCircleIcon className="size-10 text-destructive" />
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold">Something went wrong</h1>
                    <p className="text-sm text-muted-foreground">
                        This page hit an unexpected error. Try reloading.
                    </p>
                </div>
                {import.meta.env.DEV && (
                    <pre className="max-w-full overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
                        {error.message}
                    </pre>
                )}
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => this.setState({ error: null })}>
                        Try again
                    </Button>
                    <Button onClick={() => window.location.reload()}>Reload page</Button>
                </div>
            </div>
        );
    }
}
