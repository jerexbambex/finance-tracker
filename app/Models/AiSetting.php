<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AiSetting extends Model
{
    use HasUuids;

    protected $fillable = [
        'provider',
        'model',
        'chat_rate_limit_per_minute',
    ];

    protected $casts = [
        'chat_rate_limit_per_minute' => 'integer',
    ];
}
