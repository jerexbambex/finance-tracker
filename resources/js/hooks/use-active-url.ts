import type { InertiaLinkProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

import { toUrl } from '@/lib/utils';

export function useActiveUrl() {
    const page = usePage();
    const currentUrlPath = new URL(page.url, window?.location.origin).pathname;

    function urlIsActive(
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        currentUrl?: string,
    ) {
        const urlToCompare = currentUrl ?? currentUrlPath;
        return toUrl(urlToCheck) === urlToCompare;
    }

    /**
     * Like urlIsActive, but also true on pages under the URL, so
     * "Transactions" stays highlighted on /transactions/123/edit.
     */
    function urlIsActiveOrChild(urlToCheck: NonNullable<InertiaLinkProps['href']>) {
        const target = toUrl(urlToCheck).replace(/\/+$/, '');
        return currentUrlPath === target || (target !== '' && target !== '/' && currentUrlPath.startsWith(`${target}/`));
    }

    return {
        currentUrl: currentUrlPath,
        urlIsActive,
        urlIsActiveOrChild,
    };
}
