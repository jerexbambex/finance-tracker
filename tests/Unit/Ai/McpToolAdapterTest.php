<?php

use App\Ai\Tools\McpToolAdapter;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request as AiToolRequest;
use Laravel\Mcp\Request as McpRequest;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Tool as McpTool;

it('compacts large structured tool payloads before returning them to the model', function () {
    $tool = new class extends McpTool
    {
        protected string $name = 'reports.sample';

        protected string $description = 'Sample report tool';

        public function handle(McpRequest $request): ResponseFactory
        {
            return Response::structured([
                'transactions' => [
                    ['description' => str_repeat('Groceries ', 40), 'amount' => 10],
                    ['description' => 'Fuel', 'amount' => 20],
                    ['description' => 'Rent', 'amount' => 30],
                    ['description' => 'Utilities', 'amount' => 40],
                    ['description' => 'Insurance', 'amount' => 50],
                    ['description' => 'Travel', 'amount' => 60],
                ],
                'count' => 6,
            ]);
        }

        public function schema(JsonSchema $schema): array
        {
            return [];
        }
    };

    $result = (new McpToolAdapter($tool, 'reports_sample'))->handle(new AiToolRequest([]));

    expect($result)->not->toContain("\n")
        ->and($result)->toContain('"_truncated":true')
        ->and($result)->toContain('"_remaining_items":1')
        ->and($result)->not->toContain(str_repeat('Groceries ', 30));
});
