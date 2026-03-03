<?php

namespace App\Mcp\Tools;

use App\Models\AiToolRun;
use App\Services\Budgets\CreateBudget;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class BudgetsCreateTool extends Tool
{
    protected string $description = 'Create a budget for the authenticated user with optional category';

    public function handle(Request $request): Response
    {
        $user = $request->user();
        $input = $request->arguments();

        $toolRun = AiToolRun::create([
            'user_id' => $user->id,
            'tool_name' => 'budgets.create',
            'input_payload' => $input,
            'status' => 'pending',
        ]);

        try {
            $service = new CreateBudget();
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
            'name' => $schema->string()->description('Budget name (auto-generated if not provided)'),
            'amount' => $schema->number()->description('Budget amount in dollars')->required(),
            'currency' => $schema->string()->description('Currency code (3 letters)')->default('CAD'),
            'period' => $schema->string()->enum(['monthly', 'weekly', 'yearly'])->description('Budget period')->default('monthly'),
            'start_date' => $schema->string()->description('Period start date (YYYY-MM-DD)')->required(),
            'end_date' => $schema->string()->description('Period end date (YYYY-MM-DD)')->required(),
            'category_id' => $schema->string()->description('Category UUID (optional)'),
            'notes' => $schema->string()->description('Budget notes'),
        ];
    }
}
