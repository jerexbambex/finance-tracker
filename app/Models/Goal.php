<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'target_amount',
        'current_amount',
        'target_date',
        'category',
        'is_completed',
        'is_active',
    ];

    protected $casts = [
        'target_date' => 'date',
        'is_completed' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function getTargetAmountAttribute($value)
    {
        return $value / 100;
    }

    public function setTargetAmountAttribute($value)
    {
        $this->attributes['target_amount'] = $value * 100;
    }

    public function getCurrentAmountAttribute($value)
    {
        return $value / 100;
    }

    public function setCurrentAmountAttribute($value)
    {
        $this->attributes['current_amount'] = $value * 100;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getPercentageComplete()
    {
        return $this->target_amount > 0 ? ($this->current_amount / $this->target_amount) * 100 : 0;
    }
}
