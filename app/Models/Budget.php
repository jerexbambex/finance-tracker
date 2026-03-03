<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'amount',
        'currency',
        'period_type',
        'period_year',
        'period_month',
        'start_date',
        'end_date',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'period_year' => 'integer',
        'period_month' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function getAmountAttribute($value)
    {
        return $value / 100;
    }

    public function setAmountAttribute($value)
    {
        $this->attributes['amount'] = $value * 100;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getSpentAmount()
    {
        $query = Transaction::where('user_id', $this->user_id)
            ->where('category_id', $this->category_id)
            ->where('type', 'expense')
            ->whereYear('transaction_date', $this->period_year);

        if ($this->period_type === 'monthly' && $this->period_month) {
            $query->whereMonth('transaction_date', $this->period_month);
        }

        return $query->sum('amount') / 100;
    }

    public function getPercentageUsed()
    {
        $spent = $this->getSpentAmount();

        return $this->amount > 0 ? ($spent / $this->amount) * 100 : 0;
    }
}
