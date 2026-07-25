<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatusCheck extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'latency_ms' => 'float',
        'checked_at' => 'datetime',
    ];
}
