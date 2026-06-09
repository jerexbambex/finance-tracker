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
    const symbol = CURRENCY_SYMBOLS[currency];

    if (symbol) {
        const number = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);

        // Space after the symbol: keeps glyphs that aren't in the mono font (e.g. ₦)
        // from overlapping the first digit.
        return `${symbol} ${number}`;
    }

    // Unknown currency — fall back to Intl's currency formatting.
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}
