import { useCallback, useRef, useState, type ReactNode } from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmOptions {
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
}

/**
 * Promise-based replacement for `window.confirm()` that renders the app's own
 * AlertDialog. Render `dialog` once in the component, then:
 *
 *     if (!(await confirm({ title: 'Delete this?' }))) return;
 */
export function useConfirm() {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const resolver = useRef<((value: boolean) => void) | null>(null);

    const settle = useCallback((value: boolean) => {
        resolver.current?.(value);
        resolver.current = null;
        setOptions(null);
    }, []);

    const confirm = useCallback((opts: ConfirmOptions) => {
        // A second call while one is open cancels the first, so no promise is left hanging.
        resolver.current?.(false);
        setOptions(opts);
        return new Promise<boolean>((resolve) => {
            resolver.current = resolve;
        });
    }, []);

    const destructive = options?.destructive ?? true;

    const dialog = (
        <AlertDialog open={options !== null} onOpenChange={(open) => !open && settle(false)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{options?.title}</AlertDialogTitle>
                    {options?.description && <AlertDialogDescription>{options.description}</AlertDialogDescription>}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{options?.cancelLabel ?? 'Cancel'}</AlertDialogCancel>
                    <AlertDialogAction
                        className={destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
                        onClick={() => settle(true)}
                    >
                        {options?.confirmLabel ?? (destructive ? 'Delete' : 'Confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    return { confirm, dialog };
}
