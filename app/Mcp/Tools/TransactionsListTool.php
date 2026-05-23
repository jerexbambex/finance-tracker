<?php

namespace App\Mcp\Tools;

use App\Services\Transactions\ListTransactions;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;

class TransactionsListTool extends LoggedTool
{
    protected string $name = 'transactions.list';

    protected string $description = 'List transactions for the authenticated user with optional filters';

    public function handle(Request $request): ResponseFactory
    {
        return $this->run($request, function ($user, $input) {
            $filters = $this->onlyDefined([
                'type' => $input['type'] ?? null,
                'category' => $input['category'] ?? null,
                'category_id' => $input['category_id'] ?? null,
                'account_id' => $input['account_id'] ?? null,
                'start_date' => $input['start_date'] ?? null,
                'end_date' => $input['end_date'] ?? null,
                'limit' => $input['limit'] ?? null,
            ]);

            return app(ListTransactions::class)->execute($user, $filters);
        });
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $schema->string()->enum(['income', 'expense'])->description('Filter by transaction type'),
            'category' => $schema->string()->description('Filter by category name'),
            'category_id' => $schema->string()->description('Filter by category UUID'),
            'account_id' => $schema->string()->description('Filter by account UUID'),
            'start_date' => $schema->string()->description('Filter from date (YYYY-MM-DD)'),
            'end_date' => $schema->string()->description('Filter to date (YYYY-MM-DD)'),
            'limit' => $schema->integer()->description('Maximum number of results')->default(50),
        ];
    }

    public function outputSchema(JsonSchema $schema): array
    {
        return [
            'transactions' => $schema->array(
                $schema->object(
                    id: $schema->string(),
                    type: $schema->string(),
                    amount: $schema->number(),
                    currency: $schema->string(),
                    description: $schema->string(),
                    date: $schema->string(),
                    category_id: $schema->string(),
                    category: $schema->string(),
                    account_id: $schema->string(),
                    account: $schema->string(),
                )
            )->description('Matching transactions'),
            'count' => $schema->integer()->description('Number of returned transactions'),
            ...$this->commonSuccessOutputSchema($schema),
        ];
    }
}
