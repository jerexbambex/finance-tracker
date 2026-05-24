<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Mirrors the `Category` JSON shape consumed by the Flutter client
 * (`margin_app/lib/features/finance/data/models/transaction.dart`).
 *
 * Notes:
 * - `color` is stored as a `#rrggbb` string on the server but the mobile
 *   client expects an `int` (Flutter `Color` value). Convert at the edge.
 * - `is_active` is the canonical server flag; mobile inverts it to
 *   `isArchived`.
 *
 * @mixin \App\Models\Category
 */
class CategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'clientId' => $this->client_id,
            'name' => $this->name,
            'type' => $this->type,
            'budgetCategory' => $this->budget_category,
            'icon' => $this->icon,
            'color' => self::colorToInt($this->color),
            'monthlyBudget' => $this->monthly_budget,
            'order' => (int) $this->display_order,
            'isArchived' => ! $this->is_active,
            'parentId' => $this->parent_id,
            'updatedAt' => optional($this->updated_at)->toIso8601String(),
            'deletedAt' => optional($this->deleted_at)->toIso8601String(),
        ];
    }

    /**
     * Convert a `#rrggbb` (or `#aarrggbb`) hex string into the integer
     * representation Flutter uses for `Color` values. Returns 0 if input
     * is null or unparseable, so the mobile client always gets an int.
     */
    public static function colorToInt(?string $hex): int
    {
        if ($hex === null || $hex === '') {
            return 0;
        }

        $clean = ltrim($hex, '#');

        if (strlen($clean) === 6) {
            $clean = 'ff'.$clean; // opaque ARGB
        }

        if (strlen($clean) !== 8 || ! ctype_xdigit($clean)) {
            return 0;
        }

        return (int) hexdec($clean);
    }
}
