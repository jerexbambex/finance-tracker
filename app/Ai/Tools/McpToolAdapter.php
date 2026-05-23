<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request as AiToolRequest;
use Laravel\Mcp\Request as McpRequest;
use Laravel\Mcp\Server\Tool as McpTool;

class McpToolAdapter implements Tool
{
    private const MAX_LIST_ITEMS = 5;

    private const MAX_STRING_LENGTH = 240;

    public function __construct(
        protected McpTool $tool,
        protected ?string $alias = null,
    ) {}

    public static function make(string $toolClass, ?string $alias = null): static
    {
        return new static(app($toolClass), $alias);
    }

    public function name(): string
    {
        return $this->alias ?? str_replace('.', '_', $this->tool->name());
    }

    public function description(): string
    {
        return $this->tool->description();
    }

    public function handle(AiToolRequest $request): string
    {
        $response = $this->tool->handle(new McpRequest($request->all()));
        $structuredContent = $response->getStructuredContent();

        if ($structuredContent !== null) {
            return json_encode(
                $this->compactStructuredContent($structuredContent),
                JSON_UNESCAPED_SLASHES
            ) ?: 'Tool execution completed.';
        }

        return 'Tool execution completed.';
    }

    public function schema(JsonSchema $schema): array
    {
        return $this->tool->schema($schema);
    }

    private function compactStructuredContent(mixed $value): mixed
    {
        if (! is_array($value)) {
            return is_string($value)
                ? mb_strimwidth($value, 0, self::MAX_STRING_LENGTH, '...')
                : $value;
        }

        if ($this->isList($value)) {
            $items = array_map(
                fn (mixed $item) => $this->compactStructuredContent($item),
                array_slice($value, 0, self::MAX_LIST_ITEMS)
            );

            if (count($value) > self::MAX_LIST_ITEMS) {
                $items[] = [
                    '_truncated' => true,
                    '_remaining_items' => count($value) - self::MAX_LIST_ITEMS,
                ];
            }

            return $items;
        }

        $compacted = [];

        foreach ($value as $key => $item) {
            $compacted[$key] = $this->compactStructuredContent($item);
        }

        return $compacted;
    }

    private function isList(array $value): bool
    {
        if (function_exists('array_is_list')) {
            return array_is_list($value);
        }

        return array_keys($value) === range(0, count($value) - 1);
    }
}
