<?php

namespace App\Mcp\Tools;

use App\Models\AiToolRun;
use App\Services\Transactions\ListTransactions;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class TransactionsListTool extends Tool
{
    protected string $description = 'List transactions for the authenticated user with optional filters';

    public function handle(Request $request): Response
    {
        $user = $request->user();
        $input = $request->arguments();

        $toolRun = AiToolRun::create([
            'user_id' => $user->id,
            'tool_name' => 'transactions.list',
            'input_payload' => $input,
            'status' => 'pending',
        ]);

        try {
            $service = new ListTransactions();
            $result = $service->execute($user, $input);

            $toolRun->update([
                'output_payload' => $result,
                'status' => 'success',
            ]);

            return Response::content([
                ['type' => 'text', 'text' => json_encode($result)],
            ]);
        } catch (\Exception $e) {
            $toolRun->update([
                'output_payload' => ['error' => $e->getMessage()],
                'status' => 'error',
            ]);

            return Response::content([
                ['type' => 'text', 'text' => json_encode(['error' => $e->getMessage()])],
            ]);
        }
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $schema->string()->enum(['income', 'expense'])->description('Filter by transaction type'),
            'category_id' => $schema->string()->description('Filter by category UUID'),
            'account_id' => $schema->string()->description('Filter by account UUID'),
            'start_date' => $schema->string()->description('Filter from date (YYYY-MM-DD)'),
            'end_date' => $schema->string()->description('Filter to date (YYYY-MM-DD)'),
            'limit' => $schema->integer()->description('Maximum number of results')->default(50),
        ];
    }
}
