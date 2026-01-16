<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class GoalContribution extends Model
{
    use HasUuids;

    protected $fillable = [
        'goal_id',
        'user_id',
        'amount',
        'note',
        'contribution_date',
    ];

    protected $casts = [
        'contribution_date' => 'date',
    ];

    public function getAmountAttribute($value)
    {
        return $value / 100;
    }

    public function setAmountAttribute($value)
    {
        $this->attributes['amount'] = $value * 100;
    }

    public function goal()
    {
        return $this->belongsTo(Goal::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
