<?php

namespace App\Models;

use Carbon\CarbonInterface;
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
        'currency',
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
        $this->attributes['target_amount'] = (int) round($value * 100);
    }

    public function getCurrentAmountAttribute($value)
    {
        return $value / 100;
    }

    public function setCurrentAmountAttribute($value)
    {
        $this->attributes['current_amount'] = (int) round($value * 100);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function contributions()
    {
        return $this->hasMany(GoalContribution::class);
    }

    public function getPercentageComplete()
    {
        return $this->target_amount > 0 ? ($this->current_amount / $this->target_amount) * 100 : 0;
    }

    /**
     * What to save each month to hit the target by its date: what's left
     * divided by the whole months remaining (at least one). Null when there's
     * no future target date or nothing left to save.
     */
    public function suggestedMonthlyContribution(?CarbonInterface $now = null): ?float
    {
        $now ??= now();
        $remaining = $this->target_amount - $this->current_amount;

        if (! $this->target_date || $remaining <= 0 || $this->target_date->lte($now)) {
            return null;
        }

        $months = max(1, (int) floor($now->diffInMonths($this->target_date)));

        return round($remaining / $months, 2);
    }
}
