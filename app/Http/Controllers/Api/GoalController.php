<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Goals\ContributeGoalRequest;
use App\Http\Requests\Api\Goals\StoreGoalRequest;
use App\Http\Requests\Api\Goals\UpdateGoalRequest;
use App\Http\Resources\Api\GoalResource;
use App\Models\Goal;
use App\Models\GoalContribution;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GoalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $goals = Goal::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('is_active')
            ->orderBy('created_at')
            ->get();

        return response()->apiSuccess(
            data: GoalResource::collection($goals)->resolve(),
        );
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $goal = $this->findUserGoal($request->user(), $id);

        return response()->apiSuccess(
            data: (new GoalResource($goal))->toArray($request),
        );
    }

    public function store(StoreGoalRequest $request): JsonResponse
    {
        $data = $request->validated();

        $goal = Goal::create([
            'user_id' => $request->user()->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'target_amount' => $data['targetAmount'],
            'current_amount' => $data['savedAmount'] ?? 0,
            'target_date' => isset($data['deadline']) ? Carbon::parse($data['deadline'])->toDateString() : null,
            'category' => $data['category'] ?? null,
            'is_active' => true,
            'is_completed' => false,
        ]);

        return response()->apiSuccess(
            data: (new GoalResource($goal))->toArray($request),
            status: 201,
        );
    }

    public function update(UpdateGoalRequest $request, string $id): JsonResponse
    {
        $goal = $this->findUserGoal($request->user(), $id);
        $data = $request->validated();

        $attrs = [];
        foreach (['name', 'description', 'category'] as $key) {
            if (array_key_exists($key, $data)) {
                $attrs[$key] = $data[$key];
            }
        }
        if (array_key_exists('targetAmount', $data)) {
            $attrs['target_amount'] = $data['targetAmount'];
        }
        if (array_key_exists('savedAmount', $data)) {
            $attrs['current_amount'] = $data['savedAmount'];
        }
        if (array_key_exists('deadline', $data)) {
            $attrs['target_date'] = $data['deadline'] === null
                ? null
                : Carbon::parse($data['deadline'])->toDateString();
        }
        if (array_key_exists('isCompleted', $data)) {
            $attrs['is_completed'] = $data['isCompleted'];
        }
        if (array_key_exists('isActive', $data)) {
            $attrs['is_active'] = $data['isActive'];
        }

        $goal->update($attrs);

        return response()->apiSuccess(
            data: (new GoalResource($goal->fresh()))->toArray($request),
        );
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $goal = $this->findUserGoal($request->user(), $id);
        $goal->delete();

        return response()->apiSuccess(message: 'Goal deleted.');
    }

    public function contribute(ContributeGoalRequest $request, string $id): JsonResponse
    {
        $goal = $this->findUserGoal($request->user(), $id);
        $data = $request->validated();

        $contribution = DB::transaction(function () use ($goal, $request, $data) {
            $row = GoalContribution::create([
                'goal_id' => $goal->id,
                'user_id' => $request->user()->id,
                'amount' => $data['amount'],
                'note' => $data['note'] ?? null,
                'contribution_date' => isset($data['date'])
                    ? Carbon::parse($data['date'])->toDateString()
                    : now()->toDateString(),
            ]);

            // Increment current_amount via raw cents so the mutator doesn't
            // double-multiply. The model accessor on read returns dollars.
            $newCents = (int) $goal->getRawOriginal('current_amount') + (int) round($data['amount'] * 100);
            $goal->forceFill([
                'current_amount' => $newCents / 100,
                'is_completed' => ($newCents / 100) >= $goal->target_amount,
            ])->save();

            return $row;
        });

        return response()->apiSuccess(
            data: [
                'contribution' => [
                    'id' => $contribution->id,
                    'amount' => (float) $contribution->amount,
                    'note' => $contribution->note,
                    'date' => optional($contribution->contribution_date)->toIso8601String(),
                ],
                'goal' => (new GoalResource($goal->fresh()))->toArray($request),
            ],
            status: 201,
        );
    }

    public function progress(Request $request, string $id): JsonResponse
    {
        $goal = $this->findUserGoal($request->user(), $id);

        $monthsRemaining = null;
        $requiredMonthly = null;
        if ($goal->target_date !== null && $goal->target_date->isFuture()) {
            $monthsRemaining = max(1, now()->diffInMonths($goal->target_date) ?: 1);
            $remaining = max(0, $goal->target_amount - $goal->current_amount);
            $requiredMonthly = $remaining / $monthsRemaining;
        }

        return response()->apiSuccess([
            'goalId' => $goal->id,
            'targetAmount' => (float) $goal->target_amount,
            'savedAmount' => (float) $goal->current_amount,
            'remaining' => (float) max(0, $goal->target_amount - $goal->current_amount),
            'progressPercent' => (float) ($goal->target_amount > 0
                ? min(1.0, $goal->current_amount / $goal->target_amount)
                : 0.0),
            'monthsRemaining' => $monthsRemaining,
            'requiredMonthly' => $requiredMonthly === null ? null : (float) $requiredMonthly,
            'isCompleted' => (bool) $goal->is_completed,
        ]);
    }

    private function findUserGoal(User $user, string $id): Goal
    {
        $goal = Goal::query()->where('user_id', $user->id)->whereKey($id)->first();

        if ($goal === null) {
            throw new NotFoundHttpException('Goal not found.');
        }

        return $goal;
    }
}
