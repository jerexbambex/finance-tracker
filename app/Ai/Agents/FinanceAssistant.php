<?php

namespace App\Ai\Agents;

use App\Ai\Tools\McpToolAdapter;
use App\Mcp\Tools\AccountsListTool;
use App\Mcp\Tools\BudgetsCreateTool;
use App\Mcp\Tools\BudgetsListTool;
use App\Mcp\Tools\BudgetsStatusTool;
use App\Mcp\Tools\MonthlySummaryTool;
use App\Mcp\Tools\TransactionsCreateTool;
use App\Mcp\Tools\TransactionsListTool;
use App\Support\AiSettings;
use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;

#[MaxSteps(10)]
class FinanceAssistant implements Agent, HasTools
{
    use Promptable;

    public function provider(): string
    {
        return app(AiSettings::class)->provider();
    }

    public function model(): string
    {
        return app(AiSettings::class)->model();
    }

    public function timeout(): int
    {
        return 30;
    }

    public function instructions(): string
    {
        return <<<'PROMPT'
You are a personal finance assistant.

Rules:
- Use tools for all financial data operations. Never guess.
- Ask concise follow-up questions when required details are missing or ambiguous.
- Confirm before calling a write tool if the user did not clearly provide the value to save.
- Use exact dates from prompt context for phrases like "this month".
- Amounts must be positive numbers.
- Never claim a transaction or budget was saved unless a tool result confirms it.
- Never invent account IDs, category IDs, totals, balances, or budget figures.

Available tools:
- accounts_list
- transactions_create
- transactions_list
- reports_monthly_summary
- budgets_create
- budgets_list
- budgets_status

Tool usage guidance:
- Creating a transaction requires amount, type, account_id (UUID), and date. If date is missing, today is acceptable.
- If you do not have the account_id, call accounts_list first to find it by name.
- Creating a budget requires amount, start date, end date, and period. Category and name are optional.
- Explain tool errors simply and suggest the next step.

Response style:
- Be clear and concise.
- Format money with currency symbols when possible.
- Prefer short summaries over long prose.
PROMPT;
    }

    public function tools(): iterable
    {
        return [
            McpToolAdapter::make(AccountsListTool::class, 'accounts_list'),
            McpToolAdapter::make(TransactionsCreateTool::class, 'transactions_create'),
            McpToolAdapter::make(TransactionsListTool::class, 'transactions_list'),
            McpToolAdapter::make(MonthlySummaryTool::class, 'reports_monthly_summary'),
            McpToolAdapter::make(BudgetsCreateTool::class, 'budgets_create'),
            McpToolAdapter::make(BudgetsListTool::class, 'budgets_list'),
            McpToolAdapter::make(BudgetsStatusTool::class, 'budgets_status'),
        ];
    }
}
