<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Budgets\BulkBudgetRequest;
use App\Http\Requests\Api\Budgets\MonthlyPeriodRequest;
use App\Http\Requests\Api\Budgets\StoreBudgetRequest;
use App\Http\Resources\Api\BudgetResource;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BudgetController extends Controller
{
    public function index(MonthlyPeriodRequest $request): JsonResponse
    {
        $budgets = $this->scopedMonthlyQuery($request->user(), $request->year(), $request->month())
            ->orderBy('created_at')
            ->get();

        return response()->apiSuccess(
            data: BudgetResource::collection($budgets)->resolve(),
        );
    }

    public function store(StoreBudgetRequest $request): JsonResponse
    {
        $data = $request->validated();
        $this->assertUserOwnsCategory($request->user(), $data['categoryId']);

        $budget = Budget::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'category_id' => $data['categoryId'],
                'period_type' => 'monthly',
                'period_year' => $data['year'],
                'period_month' => $data['month'],
            ],
            [
                'amount' => $data['amount'],
                'is_recurrent' => $data['isRecurrent'] ?? false,
                'is_active' => true,
            ],
        );

        return response()->apiSuccess(
            data: (new BudgetResource($budget->refresh()))->toArray($request),
            status: $budget->wasRecentlyCreated ? 201 : 200,
        );
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $budget = $this->findUserBudget($request->user(), $id);
        $budget->delete();

        return response()->apiSuccess(message: 'Budget deleted.');
    }

    public function bulk(BulkBudgetRequest $request): JsonResponse
    {
        $user = $request->user();
        $budgets = collect();

        DB::transaction(function () use ($request, $user, &$budgets) {
            foreach ($request->validated('budgets') as $row) {
                $this->assertUserOwnsCategory($user, $row['categoryId']);

                $budgets->push(Budget::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'category_id' => $row['categoryId'],
                        'period_type' => 'monthly',
                        'period_year' => $row['year'],
                        'period_month' => $row['month'],
                    ],
                    [
                        'amount' => $row['amount'],
                        'is_recurrent' => $row['isRecurrent'] ?? false,
                        'is_active' => true,
                    ],
                ));
            }
        });

        return response()->apiSuccess(
            data: BudgetResource::collection($budgets)->resolve(),
            status: 201,
        );
    }

    public function analysis(MonthlyPeriodRequest $request): JsonResponse
    {
        $user = $request->user();
        $year = $request->year();
        $month = $request->month();

        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = date('Y-m-t', strtotime($startDate));

        // Category spend grouped by budget bucket (needs/wants/savings/investment).
        $spendingRows = Transaction::query()
            ->where('transactions.user_id', $user->id)
            ->where('transactions.type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->groupBy('categories.budget_category')
            ->selectRaw('categories.budget_category as bucket, SUM(transactions.amount) as cents')
            ->get();

        $buckets = ['needs' => 0, 'wants' => 0, 'savings' => 0, 'investment' => 0, 'uncategorized' => 0];

        foreach ($spendingRows as $row) {
            $bucket = $row->bucket ?? 'uncategorized';
            $buckets[$bucket] = ($buckets[$bucket] ?? 0) + (int) $row->cents;
        }

        // Income for the month — basis for the 50/30/20 targets.
        $incomeCents = (int) Transaction::query()
            ->where('user_id', $user->id)
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum('amount');

        $income = $incomeCents / 100;
        $needs = $buckets['needs'] / 100;
        $wants = $buckets['wants'] / 100;
        $savings = ($buckets['savings'] + $buckets['investment']) / 100;
        $totalExpense = $needs + $wants + $savings + ($buckets['uncategorized'] / 100);

        return response()->apiSuccess([
            'year' => $year,
            'month' => $month,
            'income' => (float) $income,
            'totalExpense' => (float) $totalExpense,
            'net' => (float) ($income - $totalExpense),
            'buckets' => [
                'needs' => (float) $needs,
                'wants' => (float) $wants,
                'savings' => (float) $savings,
                'uncategorized' => (float) ($buckets['uncategorized'] / 100),
            ],
            'targets' => [
                'needs' => (float) ($income * 0.5),
                'wants' => (float) ($income * 0.3),
                'savings' => (float) ($income * 0.2),
            ],
            'ratios' => $income > 0 ? [
                'needs' => round($needs / $income, 4),
                'wants' => round($wants / $income, 4),
                'savings' => round($savings / $income, 4),
            ] : ['needs' => 0.0, 'wants' => 0.0, 'savings' => 0.0],
        ]);
    }

    public function alerts(MonthlyPeriodRequest $request): JsonResponse
    {
        $budgets = $this->scopedMonthlyQuery($request->user(), $request->year(), $request->month())->get();

        $alerts = $budgets->map(function (Budget $budget) {
            $percentage = $budget->getPercentageUsed();
            $status = $percentage >= 100 ? 'exceeded' : ($percentage >= 80 ? 'warning' : 'ok');

            return [
                'budgetId' => $budget->id,
                'categoryId' => $budget->category_id,
                'amount' => (float) $budget->amount,
                'spent' => (float) $budget->getSpentAmount(),
                'percentageUsed' => (float) $percentage,
                'status' => $status,
            ];
        })->filter(fn (array $row) => $row['status'] !== 'ok')->values();

        return response()->apiSuccess(data: $alerts->all());
    }

    private function scopedMonthlyQuery(User $user, int $year, int $month): \Illuminate\Database\Eloquent\Builder
    {
        return Budget::query()
            ->where('user_id', $user->id)
            ->where('period_year', $year)
            ->where(function ($q) use ($month) {
                $q->where(function ($q2) use ($month) {
                    $q2->where('period_type', 'monthly')->where('period_month', $month);
                })->orWhere('period_type', 'yearly');
            });
    }

    private function findUserBudget(User $user, string $id): Budget
    {
        $budget = Budget::query()->where('user_id', $user->id)->whereKey($id)->first();

        if ($budget === null) {
            throw new NotFoundHttpException('Budget not found.');
        }

        return $budget;
    }

    private function assertUserOwnsCategory(User $user, string $categoryId): void
    {
        $exists = Category::query()
            ->whereKey($categoryId)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhereNull('user_id');
            })
            ->exists();

        if (! $exists) {
            throw new NotFoundHttpException('Category not found.');
        }
    }
}
