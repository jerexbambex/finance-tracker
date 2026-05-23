<?php

namespace App\Mcp\Tools;

use App\Services\Accounts\ListAccounts;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;

class AccountsListTool extends LoggedTool
{
    protected string $name = 'accounts.list';

    protected string $description = 'List the user\'s financial accounts with their IDs, names, types, and current balances. Call this to find an account_id before creating a transaction.';

    public function handle(Request $request): ResponseFactory
    {
        return $this->run($request, fn ($user, $input) => app(ListAccounts::class)->execute($user));
    }

    public function schema(JsonSchema $schema): array
    {
        return [];
    }

    public function outputSchema(JsonSchema $schema): array
    {
        return [
            'accounts' => $schema->array(
                $schema->object(
                    account_id: $schema->string()->description('Account UUID — use as account_id when creating transactions'),
                    name: $schema->string()->description('Account name'),
                    type: $schema->string()->description('Account type (e.g. checking, savings, credit)'),
                    currency: $schema->string()->description('Currency code'),
                    balance: $schema->number()->description('Current balance in dollars'),
                )
            )->description("User's financial accounts"),
            'count' => $schema->integer()->description('Total number of active accounts'),
            ...$this->commonSuccessOutputSchema($schema),
        ];
    }
}
