import { type RefObject, useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Eases a displayed number towards `target` whenever it changes. */
export function useAnimatedNumber(target: number, duration = 450): number {
    const [value, setValue] = useState(target);
    const current = useRef(target);

    useEffect(() => {
        const from = current.current;

        if (from === target) return;

        if (prefersReducedMotion()) {
            current.current = target;
            const frame = requestAnimationFrame(() => setValue(target));
            return () => cancelAnimationFrame(frame);
        }

        const start = performance.now();
        let frame = requestAnimationFrame(function tick(now) {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            current.current = from + (target - from) * eased;
            setValue(current.current);
            if (progress < 1) frame = requestAnimationFrame(tick);
        });

        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return value;
}

/** True once the element has scrolled into view; stays true afterwards. */
export function useInViewOnce<T extends Element>(): [RefObject<T | null>, boolean] {
    const ref = useRef<T | null>(null);
    const [seen, setSeen] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node || seen) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSeen(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.4 },
        );
        observer.observe(node);

        return () => observer.disconnect();
    }, [seen]);

    return [ref, seen];
}

/** Id of the section currently under the header, for highlighting nav links. */
export function useActiveSection(ids: string[]): string | null {
    const [active, setActive] = useState<string | null>(null);
    const key = ids.join(',');

    useEffect(() => {
        const sections = key
            .split(',')
            .map((id) => document.getElementById(id))
            .filter((node): node is HTMLElement => node !== null);
        if (sections.length === 0) return;

        const onScroll = () => {
            // A section becomes current once its top passes just under the fixed header.
            const line = window.scrollY + 120;
            let found: string | null = null;
            for (const section of sections) {
                if (section.offsetTop <= line) found = section.id;
            }
            // The last section may be too short to ever reach that line.
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
                found = sections[sections.length - 1].id;
            }
            setActive(found);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [key]);

    return active;
}
