<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'amount',
        'due_date',
        'is_recurring',
        'frequency',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'is_recurring' => 'boolean',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function getAmountAttribute($value)
    {
        return $value ? $value / 100 : null;
    }

    public function setAmountAttribute($value)
    {
        $this->attributes['amount'] = $value ? $value * 100 : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function isOverdue()
    {
        return ! $this->is_completed && $this->due_date->isPast();
    }

    public function isDueToday()
    {
        return ! $this->is_completed && $this->due_date->isToday();
    }

    public function isDueSoon()
    {
        return ! $this->is_completed && $this->due_date->isFuture() && $this->due_date->diffInDays() <= 7;
    }
}
