<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Mirrors the Flutter `Transaction` JSON shape
 * (`margin_app/lib/features/finance/data/models/transaction.dart`).
 *
 * Mobile clients don't model accounts, so `accountId` is included but
 * may be ignored. Amounts are emitted as floats (the model accessor
 * already divides by 100).
 *
 * @mixin \App\Models\Transaction
 */
class TransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'clientId' => $this->client_id,
            'type' => $this->type,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'categoryId' => $this->category_id,
            // Client-side UUID of the category. The mobile sync pull
            // uses this to resolve the FK against local state (server
            // UUIDs are opaque on the device). Looked up lazily — eager
            // loading on list endpoints is an N+1 cleanup for later.
            'categoryClientId' => $this->category_id === null
                ? null
                : \App\Models\Category::query()->whereKey($this->category_id)->value('client_id'),
            'accountId' => $this->account_id,
            'description' => $this->description,
            'notes' => $this->notes,
            'date' => optional($this->transaction_date)->toIso8601String(),
            'isRecurring' => (bool) $this->is_recurring,
            'createdAt' => optional($this->created_at)->toIso8601String(),
            'updatedAt' => optional($this->updated_at)->toIso8601String(),
            'deletedAt' => optional($this->deleted_at)->toIso8601String(),
        ];
    }
}
