<?php

namespace App\Mcp\Tools;

use App\Services\Budgets\CreateBudget;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;

class BudgetsCreateTool extends LoggedTool
{
    protected string $name = 'budgets.create';

    protected string $description = 'Create a budget for the authenticated user with optional category';

    public function handle(Request $request): ResponseFactory
    {
        return $this->run($request, fn ($user, $input) => app(CreateBudget::class)->execute($user, $input));
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('Budget name (auto-generated if not provided)'),
            'amount' => $schema->number()->description('Budget amount in dollars')->required(),
            'currency' => $schema->string()->description('Currency code (3 letters)')->default('CAD'),
            'period' => $schema->string()->enum(['monthly', 'weekly', 'yearly'])->description('Budget period')->default('monthly'),
            'start_date' => $schema->string()->description('Period start date (YYYY-MM-DD)')->required(),
            'end_date' => $schema->string()->description('Period end date (YYYY-MM-DD)')->required(),
            'category' => $schema->string()->description('Category name (optional)'),
            'category_id' => $schema->string()->description('Category UUID (optional)'),
            'notes' => $schema->string()->description('Budget notes'),
        ];
    }

    public function outputSchema(JsonSchema $schema): array
    {
        return [
            'budget_id' => $schema->string()->description('Budget UUID'),
            'name' => $schema->string()->description('Budget name'),
            'amount' => $schema->number()->description('Budget amount in dollars'),
            'currency' => $schema->string()->description('Currency code'),
            'period' => $schema->string()->description('Budget period'),
            'start_date' => $schema->string()->description('Normalized start date'),
            'end_date' => $schema->string()->description('Normalized end date'),
            'category_id' => $schema->string()->description('Category UUID'),
            'category' => $schema->string()->description('Category name'),
            'notes' => $schema->string()->description('Budget notes'),
            'is_active' => $schema->boolean()->description('Whether the budget is active'),
            ...$this->commonSuccessOutputSchema($schema),
        ];
    }
}
