<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NetWorthSnapshot extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'date',
        'currency',
        'balance',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    // Convert cents to dollars for display
    public function getBalanceAttribute($value)
    {
        return $value / 100;
    }

    // Convert dollars to cents for storage (round to avoid float drift)
    public function setBalanceAttribute($value)
    {
        $this->attributes['balance'] = (int) round($value * 100);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
