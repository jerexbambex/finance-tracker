// Symbols mirror App\Currency::symbol() on the backend so amounts render the same
// everywhere (e.g. NGN as ₦, not the "NGN" code that Intl emits in en-US).
const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    NGN: '₦',
};

export function currencySymbol(currency: string): string {
    return CURRENCY_SYMBOLS[currency] ?? currency;
}

export function formatCurrency(amount: number, currency = 'USD'): string {
    // Empty/missing codes (e.g. an empty chart period) would make Intl throw
    // "RangeError: Invalid currency code", so normalise to the default first.
    const code = currency || 'USD';
    const symbol = CURRENCY_SYMBOLS[code];

    if (symbol) {
        const number = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);

        // Space after the symbol: keeps glyphs that aren't in the mono font (e.g. ₦)
        // from overlapping the first digit.
        return `${symbol} ${number}`;
    }

    // Unknown currency — try Intl's currency formatting, but never throw: an
    // invalid code falls back to a plain number prefixed with the raw code.
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: code,
        }).format(amount);
    } catch {
        const number = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
        return `${code} ${number}`.trim();
    }
}
