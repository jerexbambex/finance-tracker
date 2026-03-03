<?php

namespace App\Mcp\Tools;

use App\Models\AiToolRun;
use App\Services\Budgets\ListBudgets;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class BudgetsListTool extends Tool
{
    protected string $description = 'List budgets for the authenticated user with optional filters';

    public function handle(Request $request): Response
    {
        $user = $request->user();
        $input = $request->arguments();

        $toolRun = AiToolRun::create([
            'user_id' => $user->id,
            'tool_name' => 'budgets.list',
            'input_payload' => $input,
            'status' => 'pending',
        ]);

        try {
            $service = new ListBudgets();
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
            'period' => $schema->string()->enum(['monthly', 'weekly', 'yearly'])->description('Filter by period type'),
            'active_only' => $schema->boolean()->description('Show only active budgets')->default(false),
            'category_id' => $schema->string()->description('Filter by category UUID'),
        ];
    }
}
