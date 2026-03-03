<?php

namespace App\Mcp\Tools;

use App\Models\AiToolRun;
use App\Services\Transactions\MonthlySummary;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class MonthlySummaryTool extends Tool
{
    protected string $description = 'Generate monthly financial summary with income, expenses, and category breakdown';

    public function handle(Request $request): Response
    {
        $user = $request->user();
        $input = $request->arguments();

        $toolRun = AiToolRun::create([
            'user_id' => $user->id,
            'tool_name' => 'reports.monthly_summary',
            'input_payload' => $input,
            'status' => 'pending',
        ]);

        try {
            $service = new MonthlySummary();
            $result = $service->execute($user, $input['month'] ?? null);

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
            'month' => $schema->string()->description('Month to summarize (YYYY-MM format, defaults to current month)'),
        ];
    }
}
