<?php

namespace App\Services\Budgets;

use App\Models\Budget;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CreateBudget
{
    public function execute(User $user, array $data): array
    {
        $validated = $this->validate($data);

        $this->validateOwnership($user, $validated);

        $dates = $this->normalizeDates($validated);

        $existing = $this->findExisting($user, $validated, $dates);
        if ($existing) {
            return $this->formatBudget($existing);
        }

        $budget = Budget::create([
            'user_id' => $user->id,
            'name' => $validated['name'] ?? $this->generateName($validated, $dates),
            'amount' => $validated['amount'],
            'currency' => $validated['currency'] ?? 'CAD',
            'period_type' => $validated['period'] ?? 'monthly',
            'period_year' => $dates['start']->year,
            'period_month' => $dates['start']->month,
            'start_date' => $dates['start'],
            'end_date' => $dates['end'],
            'category_id' => $validated['category_id'] ?? null,
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
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    private function validateOwnership(User $user, array $validated): void
    {
        if (isset($validated['category_id'])) {
            $category = $user->categories()->find($validated['category_id']);
            if (!$category) {
                throw ValidationException::withMessages(['category_id' => 'Category not found or does not belong to user.']);
            }
        }
    }

    private function normalizeDates(array $validated): array
    {
        return [
            'start' => Carbon::parse($validated['start_date']),
            'end' => Carbon::parse($validated['end_date']),
        ];
    }

    private function findExisting(User $user, array $validated, array $dates): ?Budget
    {
        return $user->budgets()
            ->where('category_id', $validated['category_id'] ?? null)
            ->where('period_type', $validated['period'] ?? 'monthly')
            ->where('start_date', $dates['start'])
            ->where('end_date', $dates['end'])
            ->first();
    }

    private function generateName(array $validated, array $dates): string
    {
        $category = isset($validated['category_id']) 
            ? \App\Models\Category::find($validated['category_id'])?->name 
            : 'General';
        
        return $category . ' Budget - ' . $dates['start']->format('M Y');
    }

    private function formatBudget(Budget $budget): array
    {
        return [
            'budget_id' => $budget->id,
            'name' => $budget->name,
            'amount' => $budget->amount,
            'currency' => $budget->currency,
            'period' => $budget->period_type,
            'start_date' => $budget->start_date->format('Y-m-d'),
            'end_date' => $budget->end_date->format('Y-m-d'),
            'category' => $budget->category?->name,
        ];
    }
}
