<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageVisit extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'is_authenticated' => 'boolean',
        'visited_at' => 'datetime',
    ];
}
