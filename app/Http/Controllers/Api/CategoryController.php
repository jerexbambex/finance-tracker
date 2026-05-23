<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Categories\StoreCategoryRequest;
use App\Http\Requests\Api\Categories\UpdateCategoryRequest;
use App\Http\Resources\Api\CategoryResource;
use App\Models\Category;
use App\Services\Api\DefaultCategoryProvisioner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->where(function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)->orWhereNull('user_id');
            })
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return response()->apiSuccess(
            data: CategoryResource::collection($categories)->resolve(),
        );
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();

        $category = Category::create([
            'user_id' => $request->user()->id,
            'name' => $data['name'],
            'type' => $data['type'],
            'budget_category' => $data['budgetCategory'] ?? null,
            'icon' => $data['icon'] ?? null,
            'color' => $data['color'] ?? null,
            'monthly_budget' => $data['monthlyBudget'] ?? null,
            'display_order' => $data['order'] ?? 0,
            'is_active' => isset($data['isArchived']) ? ! $data['isArchived'] : true,
            'parent_id' => $data['parentId'] ?? null,
        ]);

        return response()->apiSuccess(
            data: (new CategoryResource($category))->toArray($request),
            status: 201,
        );
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $category = $this->findUserCategory($request, $id);

        return response()->apiSuccess(
            data: (new CategoryResource($category))->toArray($request),
        );
    }

    public function update(UpdateCategoryRequest $request, string $id): JsonResponse
    {
        $category = $this->findUserCategory($request, $id, mutating: true);
        $data = $request->validated();

        $attrs = [];
        foreach (['name', 'type', 'icon', 'color'] as $key) {
            if (array_key_exists($key, $data)) {
                $attrs[$key] = $data[$key];
            }
        }
        if (array_key_exists('budgetCategory', $data)) {
            $attrs['budget_category'] = $data['budgetCategory'];
        }
        if (array_key_exists('monthlyBudget', $data)) {
            $attrs['monthly_budget'] = $data['monthlyBudget'];
        }
        if (array_key_exists('order', $data)) {
            $attrs['display_order'] = $data['order'];
        }
        if (array_key_exists('isArchived', $data)) {
            $attrs['is_active'] = ! $data['isArchived'];
        }
        if (array_key_exists('parentId', $data)) {
            $attrs['parent_id'] = $data['parentId'];
        }

        $category->update($attrs);

        return response()->apiSuccess(
            data: (new CategoryResource($category->fresh()))->toArray($request),
        );
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $category = $this->findUserCategory($request, $id, mutating: true);

        // Soft-archive instead of hard delete so historical transactions
        // keep their category reference.
        $category->update(['is_active' => false]);

        return response()->apiSuccess(message: 'Category archived.');
    }

    public function seedDefaults(Request $request, DefaultCategoryProvisioner $provisioner): JsonResponse
    {
        $created = $provisioner->provision($request->user());

        return response()->apiSuccess(
            data: [
                'created' => $created->count(),
                'categories' => CategoryResource::collection($created)->resolve(),
            ],
            status: 201,
        );
    }

    private function findUserCategory(Request $request, string $id, bool $mutating = false): Category
    {
        $category = Category::query()->whereKey($id)->first();

        if ($category === null) {
            throw new NotFoundHttpException('Category not found.');
        }

        // Mobile can read shared defaults (user_id null) but only mutate
        // its own user-owned categories.
        if ($mutating && $category->user_id !== $request->user()->id) {
            throw new NotFoundHttpException('Category not found.');
        }

        if (! $mutating && $category->user_id !== null && $category->user_id !== $request->user()->id) {
            throw new NotFoundHttpException('Category not found.');
        }

        return $category;
    }
}
