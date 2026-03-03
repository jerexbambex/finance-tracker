<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiToolRun extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'tool_name',
        'input_payload',
        'output_payload',
        'status',
    ];

    protected $casts = [
        'input_payload' => 'array',
        'output_payload' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
