<?php

namespace App\Mcp\Tools;

use App\Models\AiToolRun;
use App\Services\Budgets\BudgetStatus;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class BudgetsStatusTool extends Tool
{
    protected string $description = 'Get budget status showing spent amount vs budget with percentage used';

    public function handle(Request $request): Response
    {
        $user = $request->user();
        $input = $request->arguments();

        $toolRun = AiToolRun::create([
            'user_id' => $user->id,
            'tool_name' => 'budgets.status',
            'input_payload' => $input,
            'status' => 'pending',
        ]);

        try {
            $service = new BudgetStatus();
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
            'budget_id' => $schema->string()->description('Budget UUID (use this OR month+category_id)'),
            'month' => $schema->string()->description('Month in YYYY-MM format (use with category_id)'),
            'category_id' => $schema->string()->description('Category UUID (use with month)'),
        ];
    }
}
