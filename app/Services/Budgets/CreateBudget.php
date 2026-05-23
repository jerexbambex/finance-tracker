<?php

namespace App\Services\Budgets;

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CreateBudget
{
    public function execute(User $user, array $data): array
    {
        $validated = $this->validate($data);

        $dates = $this->normalizeDates($validated);
        $category = $this->resolveCategory($user, $validated);

        $existing = $this->findExisting($user, $category, $dates['period'], $dates);
        if ($existing) {
            return $this->formatBudget($existing);
        }

        $budget = $user->budgets()->create([
            'amount' => $validated['amount'],
            'name' => $validated['name'] ?? $this->generateName($category, $dates['start'], $dates['period']),
            'currency' => strtoupper($validated['currency'] ?? 'CAD'),
            'period' => $dates['period'],
            'period_type' => $dates['period'],
            'period_year' => $dates['start']->year,
            'period_month' => $dates['period'] === 'monthly' ? $dates['start']->month : null,
            'start_date' => $dates['start'],
            'end_date' => $dates['end'],
            'category_id' => $category?->id,
            'notes' => $validated['notes'] ?? null,
            'is_active' => true,
        ]);

        return $this->formatBudget($budget);
    }

    private function validate(array $data): array
    {
        $validator = Validator::make($data, [
            'name' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'nullable|string|size:3',
            'period' => 'nullable|in:monthly,weekly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'category_id' => 'nullable|uuid|exists:categories,id',
            'category' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    private function resolveCategory(User $user, array $validated): ?Category
    {
        $categoryId = $validated['category_id'] ?? null;
        $categoryName = $validated['category'] ?? null;

        if (! $categoryId && ! $categoryName) {
            return null;
        }

        $query = Category::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereNull('user_id');
            });

        if ($categoryId) {
            $category = $query->whereKey($categoryId)->first();

            if ($category) {
                return $category;
            }

            throw ValidationException::withMessages([
                'category_id' => 'Category not found or does not belong to user.',
            ]);
        }

        $category = $query
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($categoryName)])
            ->first();

        if ($category) {
            return $category;
        }

        throw ValidationException::withMessages([
            'category' => 'Category not found or does not belong to user.',
        ]);
    }

    private function normalizeDates(array $validated): array
    {
        $period = $validated['period'] ?? 'monthly';
        $start = Carbon::parse($validated['start_date'])->startOfDay();

        [$normalizedStart, $normalizedEnd] = match ($period) {
            'weekly' => [$start->copy()->startOfWeek(), $start->copy()->endOfWeek()],
            'yearly' => [$start->copy()->startOfYear(), $start->copy()->endOfYear()],
            default => [$start->copy()->startOfMonth(), $start->copy()->endOfMonth()],
        };

        return [
            'period' => $period,
            'start' => $normalizedStart,
            'end' => $normalizedEnd,
        ];
    }

    private function findExisting(User $user, ?Category $category, string $period, array $dates): ?Budget
    {
        return $user->budgets()
            ->where('category_id', $category?->id)
            ->where('period', $period)
            ->where('start_date', $dates['start'])
            ->where('end_date', $dates['end'])
            ->first();
    }

    private function generateName(?Category $category, Carbon $startDate, string $period): string
    {
        $prefix = $category?->name ?? 'General';

        return match ($period) {
            'weekly' => sprintf('%s Budget - Week of %s', $prefix, $startDate->format('M j, Y')),
            'yearly' => sprintf('%s Budget - %s', $prefix, $startDate->format('Y')),
            default => sprintf('%s Budget - %s', $prefix, $startDate->format('M Y')),
        };
    }

    private function formatBudget(Budget $budget): array
    {
        return [
            'budget_id' => $budget->id,
            'name' => $budget->name,
            'amount' => $budget->amount,
            'currency' => $budget->currency,
            'period' => $budget->period,
            'start_date' => $budget->start_date->format('Y-m-d'),
            'end_date' => $budget->end_date->format('Y-m-d'),
            'category_id' => $budget->category_id,
            'category' => $budget->category?->name,
            'notes' => $budget->notes,
            'is_active' => $budget->is_active,
        ];
    }
}
