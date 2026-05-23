<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Mirrors the Flutter `SavingsGoal` JSON shape
 * (`margin_app/lib/features/finance/data/models/savings_goal.dart`).
 *
 * Maps Laravel's Goal (target_amount + current_amount) to the mobile
 * (targetAmount + savedAmount) terminology.
 *
 * @mixin \App\Models\Goal
 */
class GoalResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'targetAmount' => (float) $this->target_amount,
            'savedAmount' => (float) $this->current_amount,
            'progressPercent' => (float) ($this->target_amount > 0
                ? min(1.0, $this->current_amount / $this->target_amount)
                : 0.0),
            'deadline' => optional($this->target_date)->toIso8601String(),
            'category' => $this->category,
            'isCompleted' => (bool) $this->is_completed,
            'isActive' => (bool) $this->is_active,
            'createdAt' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
