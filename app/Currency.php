<?php

namespace App;

enum Currency: string
{
    case USD = 'USD';
    case EUR = 'EUR';
    case GBP = 'GBP';
    case CAD = 'CAD';
    case AUD = 'AUD';
    case JPY = 'JPY';
    case CNY = 'CNY';
    case INR = 'INR';
    case NGN = 'NGN';

    public function label(): string
    {
        return match ($this) {
            self::USD => 'US Dollar ($)',
            self::EUR => 'Euro (€)',
            self::GBP => 'British Pound (£)',
            self::CAD => 'Canadian Dollar (C$)',
            self::AUD => 'Australian Dollar (A$)',
            self::JPY => 'Japanese Yen (¥)',
            self::CNY => 'Chinese Yuan (¥)',
            self::INR => 'Indian Rupee (₹)',
            self::NGN => 'Nigerian Naira (₦)',
        };
    }

    public function symbol(): string
    {
        return match ($this) {
            self::USD => '$',
            self::EUR => '€',
            self::GBP => '£',
            self::CAD => 'C$',
            self::AUD => 'A$',
            self::JPY => '¥',
            self::CNY => '¥',
            self::INR => '₹',
            self::NGN => '₦',
        };
    }

    /**
     * Just the currency's name, no symbol — label() bundles the symbol in
     * for dropdowns; this is for contexts (like a table's secondary line)
     * that want the name and symbol styled separately.
     */
    public function currencyName(): string
    {
        return match ($this) {
            self::USD => 'US Dollar',
            self::EUR => 'Euro',
            self::GBP => 'British Pound',
            self::CAD => 'Canadian Dollar',
            self::AUD => 'Australian Dollar',
            self::JPY => 'Japanese Yen',
            self::CNY => 'Chinese Yuan',
            self::INR => 'Indian Rupee',
            self::NGN => 'Nigerian Naira',
        };
    }

    public function flag(): string
    {
        return match ($this) {
            self::USD => '🇺🇸',
            self::EUR => '🇪🇺',
            self::GBP => '🇬🇧',
            self::CAD => '🇨🇦',
            self::AUD => '🇦🇺',
            self::JPY => '🇯🇵',
            self::CNY => '🇨🇳',
            self::INR => '🇮🇳',
            self::NGN => '🇳🇬',
        };
    }
}
