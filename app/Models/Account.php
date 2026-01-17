<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Account extends Model
{
    use HasUuids, LogsActivity;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'balance',
        'currency',
        'is_active',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Convert cents to dollars for display
    public function getBalanceAttribute($value)
    {
        return $value / 100;
    }

    // Convert dollars to cents for storage
    public function setBalanceAttribute($value)
    {
        $this->attributes['balance'] = $value * 100;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'type', 'balance', 'currency', 'is_active'])
            ->logOnlyDirty();
    }
}
