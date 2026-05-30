<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Transaction extends Model implements HasMedia
{
    use HasUuids, InteractsWithMedia, LogsActivity;

    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'type',
        'transfer_group_id',
        'transfer_direction',
        'amount',
        'currency',
        'description',
        'transaction_date',
        'notes',
        'is_recurring',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('receipts')
            ->singleFile();
    }

    protected $casts = [
        'transaction_date' => 'date',
        'is_recurring' => 'boolean',
    ];

    // Convert cents to dollars for display
    public function getAmountAttribute($value)
    {
        return $value / 100;
    }

    // Convert dollars to cents for storage (round to avoid float drift)
    public function setAmountAttribute($value)
    {
        $this->attributes['amount'] = (int) round($value * 100);
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

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function splits()
    {
        return $this->hasMany(TransactionSplit::class);
    }

    public function isSplit()
    {
        return $this->splits()->exists();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['type', 'amount', 'currency', 'transaction_date', 'description'])
            ->logOnlyDirty();
    }

    /**
     * Split-aware expense spend per category, for a user over a date range.
     * Non-split transactions count under their own category; split parents are
     * excluded and counted via their split rows (so nothing double-counts).
     *
     * Returns a collection of objects:
     *   { category_id, name, color, currency, amount (dollars), count }
     * keyed by "{category_id}|{currency}".
     */
    public static function spendByCategory(string $userId, $start, $end): \Illuminate\Support\Collection
    {
        $direct = static::query()
            ->where('transactions.user_id', $userId)
            ->where('transactions.type', 'expense')
            ->whereBetween('transactions.transaction_date', [$start, $end])
            ->whereDoesntHave('splits')
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->leftJoin('categories', 'transactions.category_id', '=', 'categories.id')
            ->selectRaw('transactions.category_id, categories.name as cat_name, categories.color as cat_color, accounts.currency, SUM(transactions.amount) as total, COUNT(*) as cnt')
            ->groupBy('transactions.category_id', 'categories.name', 'categories.color', 'accounts.currency')
            ->get();

        $split = TransactionSplit::query()
            ->join('transactions', 'transaction_splits.transaction_id', '=', 'transactions.id')
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->leftJoin('categories', 'transaction_splits.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)
            ->where('transactions.type', 'expense')
            ->whereBetween('transactions.transaction_date', [$start, $end])
            ->selectRaw('transaction_splits.category_id, categories.name as cat_name, categories.color as cat_color, accounts.currency, SUM(transaction_splits.amount) as total, COUNT(*) as cnt')
            ->groupBy('transaction_splits.category_id', 'categories.name', 'categories.color', 'accounts.currency')
            ->get();

        $merged = [];
        foreach ($direct->concat($split) as $row) {
            $key = ($row->category_id ?? 'none').'|'.$row->currency;
            if (! isset($merged[$key])) {
                $merged[$key] = (object) [
                    'category_id' => $row->category_id,
                    'name' => $row->cat_name ?? 'Uncategorized',
                    'color' => $row->cat_color ?? '#6b7280',
                    'currency' => $row->currency,
                    'amount' => 0.0,
                    'count' => 0,
                ];
            }
            $merged[$key]->amount += (int) $row->total / 100;
            $merged[$key]->count += (int) $row->cnt;
        }

        return collect($merged)->values();
    }
}
