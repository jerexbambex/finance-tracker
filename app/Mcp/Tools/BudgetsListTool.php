<?php

namespace App\Mcp\Tools;

use App\Services\Budgets\ListBudgets;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;

class BudgetsListTool extends LoggedTool
{
    protected string $name = 'budgets.list';

    protected string $description = 'List budgets for the authenticated user with optional filters';

    public function handle(Request $request): ResponseFactory
    {
        return $this->run($request, function ($user, $input) {
            $filters = $this->onlyDefined([
                'period' => $input['period'] ?? null,
                'active_only' => array_key_exists('active_only', $input)
                    ? $this->coerceBoolean($input['active_only'])
                    : null,
                'category' => $input['category'] ?? null,
                'category_id' => $input['category_id'] ?? null,
            ]);

            return app(ListBudgets::class)->execute($user, $filters);
        });
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'period' => $schema->string()->enum(['monthly', 'weekly', 'yearly'])->description('Filter by period type'),
            'active_only' => $schema->boolean()->description('Show only active budgets')->default(false),
            'category' => $schema->string()->description('Filter by category name'),
            'category_id' => $schema->string()->description('Filter by category UUID'),
        ];
    }

    public function outputSchema(JsonSchema $schema): array
    {
        return [
            'budgets' => $schema->array(
                $schema->object(
                    budget_id: $schema->string(),
                    name: $schema->string(),
                    amount: $schema->number(),
                    currency: $schema->string(),
                    period: $schema->string(),
                    start_date: $schema->string(),
                    end_date: $schema->string(),
                    category_id: $schema->string(),
                    category: $schema->string(),
                    notes: $schema->string(),
                    is_active: $schema->boolean(),
                )
            )->description('Matching budgets'),
            'count' => $schema->integer()->description('Number of returned budgets'),
            ...$this->commonSuccessOutputSchema($schema),
        ];
    }
}
