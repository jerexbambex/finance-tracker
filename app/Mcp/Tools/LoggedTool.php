<?php

namespace App\Mcp\Tools;

use App\Models\AiToolRun;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Tool;
use Throwable;

abstract class LoggedTool extends Tool
{
    protected function run(Request $request, callable $callback): ResponseFactory
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return Response::make(
                Response::error('Authentication required.')
            )->withStructuredContent([
                'error' => 'Authentication required.',
            ]);
        }

        $input = $request->all();

        $toolRun = AiToolRun::create([
            'user_id' => $user->id,
            'tool_name' => $this->name(),
            'input_payload' => $input,
            'status' => 'pending',
        ]);

        try {
            $result = $callback($user, $input);

            $toolRun->update([
                'output_payload' => $result,
                'status' => 'success',
            ]);

            return Response::structured($result)->withMeta([
                'tool_run_id' => $toolRun->id,
            ]);
        } catch (Throwable $exception) {
            $payload = [
                'error' => $exception->getMessage(),
            ];

            $toolRun->update([
                'output_payload' => $payload,
                'status' => 'error',
            ]);

            Log::warning('MCP tool execution failed.', [
                'tool' => $this->name(),
                'user_id' => $user->id,
                'input' => $input,
                'error' => $exception->getMessage(),
                'exception' => $exception::class,
            ]);

            return Response::make(
                Response::error($exception->getMessage())
            )->withStructuredContent($payload)->withMeta([
                'tool_run_id' => $toolRun->id,
                'exception' => class_basename($exception),
            ]);
        }
    }

    protected function commonSuccessOutputSchema(\Illuminate\Contracts\JsonSchema\JsonSchema $schema): array
    {
        return [
            'error' => $schema->string()->description('Present only when the tool execution fails'),
        ];
    }

    protected function coerceBoolean(mixed $value, bool $default = false): bool
    {
        if ($value === null) {
            return $default;
        }

        return filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? $default;
    }

    /**
     * @return array<string, mixed>
     */
    protected function onlyDefined(array $values): array
    {
        return Arr::where($values, fn (mixed $value): bool => $value !== null && $value !== '');
    }
}
