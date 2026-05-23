<?php

namespace App\Mcp\Tools;

use App\Services\Transactions\CreateTransaction;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;

class TransactionsCreateTool extends LoggedTool
{
    protected string $name = 'transactions.create';

    protected string $description = 'Create a new transaction for the authenticated user';

    public function handle(Request $request): ResponseFactory
    {
        return $this->run($request, fn ($user, $input) => app(CreateTransaction::class)->execute($user, $input));
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'amount' => $schema->number()->description('Transaction amount in dollars')->required(),
            'type' => $schema->string()->enum(['income', 'expense'])->description('Transaction type')->required(),
            'currency' => $schema->string()->description('Currency code (3 letters)')->default('CAD'),
            'description' => $schema->string()->description('Transaction description'),
            'date' => $schema->string()->description('Transaction date (YYYY-MM-DD)'),
            'category' => $schema->string()->description('Category name'),
            'category_id' => $schema->string()->description('Category UUID'),
            'account_id' => $schema->string()->description('Account UUID')->required(),
            'notes' => $schema->string()->description('Additional notes'),
        ];
    }

    public function outputSchema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->string()->description('Created transaction UUID'),
            'type' => $schema->string()->description('Transaction type'),
            'amount' => $schema->number()->description('Transaction amount in dollars'),
            'currency' => $schema->string()->description('Currency code'),
            'description' => $schema->string()->description('Transaction description'),
            'date' => $schema->string()->description('Normalized transaction date'),
            'category_id' => $schema->string()->description('Category UUID'),
            'category' => $schema->string()->description('Category name'),
            'account_id' => $schema->string()->description('Account UUID'),
            'account' => $schema->string()->description('Account name'),
            ...$this->commonSuccessOutputSchema($schema),
        ];
    }
}
