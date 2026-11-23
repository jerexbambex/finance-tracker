import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Today's date as YYYY-MM-DD in the user's local timezone.
 *
 * `new Date().toISOString()` is UTC, so it returns yesterday or tomorrow for
 * anyone whose local day differs from UTC at the time — e.g. a 00:30 entry in
 * Lagos (UTC+1) or an 8pm entry in New York (UTC−5).
 */
export function todayLocal(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
