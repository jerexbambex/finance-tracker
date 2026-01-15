<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'type',
        'amount',
        'description',
        'transaction_date',
        'notes',
        'is_recurring',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'is_recurring' => 'boolean',
    ];

    // Convert cents to dollars for display
    public function getAmountAttribute($value)
    {
        return $value / 100;
    }

    // Convert dollars to cents for storage
    public function setAmountAttribute($value)
    {
        $this->attributes['amount'] = $value * 100;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
