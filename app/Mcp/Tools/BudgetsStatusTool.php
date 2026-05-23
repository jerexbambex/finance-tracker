<?php

namespace App\Mcp\Tools;

use App\Services\Budgets\BudgetStatus;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;

class BudgetsStatusTool extends LoggedTool
{
    protected string $name = 'budgets.status';

    protected string $description = 'Get budget status showing spent amount vs budget with percentage used';

    public function handle(Request $request): ResponseFactory
    {
        return $this->run($request, fn ($user, $input) => app(BudgetStatus::class)->execute($user, $input));
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'budget_id' => $schema->string()->description('Budget UUID (use this OR month+category_id)'),
            'month' => $schema->string()->description('Month in YYYY-MM format (use with category or category_id)'),
            'category' => $schema->string()->description('Category name (use with month)'),
            'category_id' => $schema->string()->description('Category UUID (use with month)'),
        ];
    }

    public function outputSchema(JsonSchema $schema): array
    {
        return [
            'budget_id' => $schema->string()->description('Budget UUID'),
            'name' => $schema->string()->description('Budget name'),
            'period' => $schema->string()->description('Budget period'),
            'month' => $schema->string()->description('Month lookup key'),
            'budget_amount' => $schema->number()->description('Budget amount'),
            'spent' => $schema->number()->description('Spent to date'),
            'remaining' => $schema->number()->description('Remaining budget'),
            'percent_used' => $schema->number()->description('Percentage used'),
            'start_date' => $schema->string()->description('Budget start date'),
            'end_date' => $schema->string()->description('Budget end date'),
            'category_id' => $schema->string()->description('Category UUID'),
            'category' => $schema->string()->description('Category name'),
            ...$this->commonSuccessOutputSchema($schema),
        ];
    }
}
