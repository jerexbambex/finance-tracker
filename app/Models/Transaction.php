<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
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
}
