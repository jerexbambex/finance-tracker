<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FailedJob extends Model
{
    protected $table = 'failed_jobs';

    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'failed_at' => 'datetime',
    ];

    /**
     * Human-readable job name pulled from the serialized payload.
     */
    public function getDisplayNameAttribute(): string
    {
        $payload = json_decode($this->payload ?? '', true);

        return $payload['displayName'] ?? 'Unknown job';
    }
}
