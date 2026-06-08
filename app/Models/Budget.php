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
        'amount',
        'currency',
        'period_type',
        'period_year',
        'period_month',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'period_year' => 'integer',
        'period_month' => 'integer',
    ];

    public function getAmountAttribute($value)
    {
        return $value / 100;
    }

    public function setAmountAttribute($value)
    {
        $this->attributes['amount'] = (int) round($value * 100);
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
        // Use a date range (sargable) instead of whereYear/whereMonth so the
        // transaction_date index is used rather than a full scan.
        $isMonthly = $this->period_type === 'monthly' && $this->period_month;
        $start = \Illuminate\Support\Carbon::create($this->period_year, $isMonthly ? $this->period_month : 1, 1);
        $end = $isMonthly ? $start->copy()->endOfMonth() : $start->copy()->endOfYear();

        $applyPeriod = function ($query, string $dateColumn = 'transaction_date') use ($start, $end) {
            return $query->whereBetween($dateColumn, [$start->toDateString(), $end->toDateString()]);
        };

        // Direct spend: non-split expense transactions in this category.
        // Split transactions are excluded here and counted via their split rows
        // below, so a split is never double-counted under its parent category.
        $direct = $applyPeriod(
            Transaction::where('user_id', $this->user_id)
                ->where('category_id', $this->category_id)
                ->where('type', 'expense')
                ->where('currency', $this->currency)
                ->whereDoesntHave('splits')
        )->sum('amount');

        // Split spend: split rows assigned to this category, scoped through their
        // parent transaction for user/type/currency/period.
        $split = TransactionSplit::where('transaction_splits.category_id', $this->category_id)
            ->whereHas('transaction', function ($q) use ($applyPeriod) {
                $q->where('user_id', $this->user_id)
                    ->where('type', 'expense')
                    ->where('currency', $this->currency);
                $applyPeriod($q);
            })
            ->sum('amount');

        return ($direct + $split) / 100;
    }

    public function getPercentageUsed()
    {
        $spent = $this->getSpentAmount();

        return $this->amount > 0 ? ($spent / $this->amount) * 100 : 0;
    }
}
