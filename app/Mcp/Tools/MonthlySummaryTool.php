<?php

namespace App\Mcp\Tools;

use App\Services\Transactions\MonthlySummary;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;

class MonthlySummaryTool extends LoggedTool
{
    protected string $name = 'reports.monthly_summary';

    protected string $description = 'Generate monthly financial summary with income, expenses, and category breakdown';

    public function handle(Request $request): ResponseFactory
    {
        return $this->run($request, fn ($user, $input) => app(MonthlySummary::class)->execute($user, $input['month'] ?? null));
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'month' => $schema->string()->description('Month to summarize (YYYY-MM format, defaults to current month)'),
        ];
    }

    public function outputSchema(JsonSchema $schema): array
    {
        return [
            'period' => $schema->string()->description('Summarized month'),
            'start_date' => $schema->string()->description('Period start date'),
            'end_date' => $schema->string()->description('Period end date'),
            'income' => $schema->number()->description('Total income'),
            'expenses' => $schema->number()->description('Total expenses'),
            'net' => $schema->number()->description('Net result'),
            'transaction_count' => $schema->integer()->description('Number of transactions in the month'),
            'category_breakdown' => $schema->array(
                $schema->object(
                    category_id: $schema->string(),
                    category: $schema->string(),
                    amount: $schema->number(),
                    count: $schema->integer(),
                )
            )->description('Expense breakdown by category'),
            ...$this->commonSuccessOutputSchema($schema),
        ];
    }
}
