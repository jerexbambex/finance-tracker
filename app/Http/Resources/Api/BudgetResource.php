<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Mirrors the Flutter `CategoryBudget` JSON shape
 * (`margin_app/lib/features/finance/data/models/transaction.dart`).
 *
 * The mobile client only models monthly category budgets, so we coerce
 * yearly budgets into a representation that still shows year+month
 * (month from period_month when present, null otherwise — Flutter side
 * is unlikely to load yearly budgets at all).
 *
 * @mixin \App\Models\Budget
 */
class BudgetResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'clientId' => $this->client_id,
            'categoryId' => $this->category_id,
            'categoryClientId' => $this->category_id === null
                ? null
                : \App\Models\Category::query()->whereKey($this->category_id)->value('client_id'),
            'year' => $this->period_year,
            'month' => $this->period_month,
            'amount' => (float) $this->amount,
            'isRecurrent' => (bool) $this->is_recurrent,
            'isActive' => (bool) $this->is_active,
            'periodType' => $this->period_type,
            'spent' => (float) $this->getSpentAmount(),
            'percentageUsed' => (float) $this->getPercentageUsed(),
            'updatedAt' => optional($this->updated_at)->toIso8601String(),
            'deletedAt' => optional($this->deleted_at)->toIso8601String(),
        ];
    }
}
