<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringTransaction extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'type',
        'amount',
        'description',
        'frequency',
        'next_due_date',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'integer',
        'next_due_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getAmountInDollarsAttribute(): float
    {
        return $this->amount / 100;
    }

    public function setAmountInDollarsAttribute(float $value): void
    {
        $this->attributes['amount'] = (int) ($value * 100);
    }
}
