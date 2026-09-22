<?php

namespace App\Models;

use App\Services\CurrencyConverter;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * One row per currency: rate_to_usd is how many USD equal 1 unit of it.
 * USD itself always has rate_to_usd = 1. See CurrencyConverter for the
 * cross-currency math this table backs.
 */
class ExchangeRate extends Model
{
    use HasUuids;

    protected $fillable = [
        'currency',
        'rate_to_usd',
        'source',
        'fetched_at',
    ];

    protected $casts = [
        'rate_to_usd' => 'float',
        'fetched_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        // Any write — the daily API sync, a manual Filament edit, a test
        // seeding rates — must invalidate CurrencyConverter's cache, or a
        // stale rate lingers for up to an hour.
        static::saved(fn () => CurrencyConverter::forgetCache());
        static::deleted(fn () => CurrencyConverter::forgetCache());
    }
}
