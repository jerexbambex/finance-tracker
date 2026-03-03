<?php

namespace App\Mcp\Tools;

use App\Models\AiToolRun;
use App\Services\Transactions\CreateTransaction;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class TransactionsCreateTool extends Tool
{
    protected string $description = 'Create a new transaction for the authenticated user';

    public function handle(Request $request): Response
    {
        $user = $request->user();
        $input = $request->arguments();

        $toolRun = AiToolRun::create([
            'user_id' => $user->id,
            'tool_name' => 'transactions.create',
            'input_payload' => $input,
            'status' => 'pending',
        ]);

        try {
            $service = new CreateTransaction();
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
            'amount' => $schema->number()->description('Transaction amount in dollars')->required(),
            'type' => $schema->string()->enum(['income', 'expense'])->description('Transaction type')->required(),
            'currency' => $schema->string()->description('Currency code (3 letters)')->default('CAD'),
            'description' => $schema->string()->description('Transaction description'),
            'date' => $schema->string()->description('Transaction date (YYYY-MM-DD)'),
            'category_id' => $schema->string()->description('Category UUID'),
            'account_id' => $schema->string()->description('Account UUID')->required(),
            'notes' => $schema->string()->description('Additional notes'),
        ];
    }
}
