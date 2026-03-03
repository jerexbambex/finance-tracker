# AI Finance Chat Interface
## Kiro CLI Implementation Plan

Author: Oluwatosin Jeremiah Ogunniyi  
Stack: Laravel + Laravel AI SDK + MCP + Shadcn + Filament  
Auth: Laravel Sanctum

---

# Overview

This document defines the implementation plan for integrating an AI-powered chat interface into a Laravel-based personal finance tracker.

The system will:

- Allow users to interact with their financial data via natural language
- Use Laravel AI SDK for orchestration
- Use MCP tools for structured business logic
- Ensure all data mutations occur strictly via tools
- Provide full audit logging and safety controls
- Support provider switching (OpenAI / Anthropic)
- Allow users to create and manage budgets via chat

---

# Architecture Principle

All financial mutations must flow through tools.

User → Agent → Tool → Service → Database

AI must never write directly to models or the database.

---

# PHASE 0 — Environment Setup

## Install Packages

- composer require laravel/ai
- Install Laravel MCP package (if separate)
- Ensure Sanctum is installed

## Configure Environment

Add:
```
AI_PROVIDER=openai
AI_MODEL=gpt-4.1-mini
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```


## Success Criteria

- AI agent resolves in container
- Provider switching works via config change only

---

# PHASE 1 — Database Layer

## Migrations

### ai_conversations
- id (uuid)
- user_id (uuid)
- title (nullable string)
- timestamps

### ai_messages
- id (uuid)
- conversation_id (uuid)
- role (user | assistant | tool)
- content (json)
- client_message_id (nullable uuid)
- timestamps

### ai_tool_runs
- id (uuid)
- user_id (uuid)
- tool_name (string)
- input_payload (json)
- output_payload (json)
- status (string)
- timestamps

### budgets (NEW)
A budget represents an allocated amount for a period (monthly by default), optionally tied to a category.

- id (uuid)
- user_id (uuid)
- name (string) — e.g., "March Food Budget"
- amount (decimal)
- currency (string, default CAD)
- period (enum: monthly | weekly | yearly)
- start_date (date) — inclusive
- end_date (date) — inclusive
- category_id (uuid, nullable) — if your app has categories table
- notes (text, nullable)
- is_active (boolean, default true)
- timestamps

> If categories are stored as strings in your current app, replace `category_id` with `category` (string, nullable).

## Models

- AiConversation
- AiMessage
- AiToolRun
- Budget (NEW)

Relationships:
- Conversation → belongsTo User
- Conversation → hasMany Messages
- Budget → belongsTo User
- Budget → belongsTo Category (optional)

## Success Criteria

- UUID primary keys used
- Relationships load correctly

---

# PHASE 2 — Service Layer (AI-Agnostic)

Directory:
```angular2html
app/Services/
Transactions/
Budgets/ (NEW)
```


## Required Services

## Transactions

### CreateTransaction
Inputs:
- user
- amount
- type
- currency
- description
- date
- category
- account_id

Behavior:
- Validate ownership
- Normalize date
- Persist transaction
- Return structured array

### ListTransactions

### MonthlySummary

## Budgets (NEW)

### CreateBudget
Inputs:
- user
- name (optional, can be derived)
- amount
- currency
- period (monthly default)
- start_date
- end_date
- category/category_id (optional)
- notes (optional)

Behavior:
- Validate ownership (category/account if applicable)
- Normalize period dates
- Prevent conflicting duplicates (see Idempotency notes)
- Persist budget
- Return structured array

### ListBudgets
Inputs:
- user
- period filter (optional)
- active only (optional)
- category filter (optional)

### BudgetStatus
Inputs:
- user
- budget_id OR (month + category)
  Behavior:
- Compute spent-to-date vs budget
- Return remaining amount and percentage used

## Rules

- No AI references allowed
- Fully unit-testable

---

# PHASE 3 — MCP Tools

Directory:
```
app/Mcp/Tools/
Transactions/
Budgets/ (NEW)
Reports/
```


## Required Tools

## Transactions

### transactions.create
- Validate parameters
- Call CreateTransaction service
- Log tool run
- Return structured JSON

### transactions.list

### reports.monthly_summary

## Budgets (NEW)

### budgets.create
Purpose: Create a budget for the authenticated user.

Parameters:
- name (optional)
- amount (required, > 0)
- currency (default CAD)
- period (monthly | weekly | yearly) default monthly
- start_date (YYYY-MM-DD) required (or infer based on "this month")
- end_date (YYYY-MM-DD) required (or infer)
- category (optional) OR category_id (optional)
- notes (optional)

Return:
```json
{
"budget_id": "uuid",
"name": "Food Budget - March 2026",
"amount": 500.00,
"currency": "CAD",
"period": "monthly",
"start_date": "2026-03-01",
"end_date": "2026-03-31",
"category": "Food"
}
```


### budgets.list
Returns budgets for the user.

### budgets.status
Returns budget vs spending status:
```json
{
"budget_id": "uuid",
"period": "2026-03",
"budget_amount": 500.00,
"spent": 240.00,
"remaining": 260.00,
"percent_used": 48
}
```


## Security

- Must use authenticated user
- Must enforce ownership validation
- Tools are the only mutation path

---

# PHASE 4 — AI Agent

File:
```app/Ai/Agents/FinanceAssistant.php```


## Responsibilities

- Interpret natural language
- Call tools for data mutation (transactions + budgets)
- Ask clarifying questions if data missing
- Confirm saved data before final response
- For budgets: confirm period, category, and amount before saving if ambiguous

## Tools Registered

- transactions.create
- transactions.list
- reports.monthly_summary
- budgets.create (NEW)
- budgets.list (NEW)
- budgets.status (NEW)

## System Prompt Rules

- If user requests adding/updating anything → use a tool
- If time period ambiguous:
    - Ask: "Is that for this month or a custom range?"
- Never guess totals; use summary/status tools
- Always confirm saved values

## Execution Settings

- maxSteps >= 6 (budgets + reports may require more steps)
- No direct DB access

---

# PHASE 5 — Chat API (Streaming)

## Route

POST /api/chat

## Request Payload
```json
{
"conversation_id": "uuid",
"message": "Set a $500 food budget for this month",
"client_message_id": "uuid"
}
```


## Behavior

1. Store user message
2. Load last 20 messages
3. Run FinanceAssistant
4. Stream assistant tokens via SSE
5. Store assistant message

## Streaming Requirements

- Content-Type: text/event-stream
- Response starts < 1.5s
- Progressive token delivery
- Optional tool events:
    - `event: tool_call`
    - `event: tool_result`

---

# PHASE 6 — Frontend (Shadcn)

## Required Components

- ChatWindow
- ChatMessage
- ChatInput
- ToolIndicator
- LoadingDots

## Behavior

- Generate client_message_id per message
- POST to /api/chat
- Read streaming response
- Append assistant text progressively
- Display tool execution indicator
- Support "budget creation" prompts:
    - Example quick actions chips:
        - "Set a monthly budget"
        - "Show my budget status"
        - "List budgets"

---

# PHASE 7 — Filament Admin

Create new section: AI Management

## Resources

- AiConversationResource
- AiToolRunResource
- ProviderSettingsPage

## Finance Admin Resources (Optional but Recommended)

- BudgetResource (NEW)
    - View/create/edit budgets
    - Activate/deactivate
    - User association

## Features

- View tool logs
- View conversations
- Toggle provider
- Set rate limits

---

# PHASE 8 — Safety & Idempotency

## Idempotency

- Require client_message_id
- Prevent duplicate tool execution if ID reused

For budgets:
- Add unique constraint to avoid accidental duplicates:
    - (user_id, period, start_date, end_date, category/category_id)
- Tool should return existing budget if matching budget exists and request is equivalent

## Rate Limiting

- Throttle /api/chat per user
- Configurable via admin

---

# PHASE 9 — Testing

## Unit Tests

Transactions:
- CreateTransaction
- ListTransactions
- MonthlySummary

Budgets:
- CreateBudget
- ListBudgets
- BudgetStatus (budget vs spent)

## Feature Tests

- Tool invocation
- Auth enforcement
- Idempotency behavior
- Budget creation via tool

## Integration Tests

- Agent → Tool → DB flow (transactions + budgets)

---

# PHASE 10 — Production Hardening

- Limit conversation context to last 20 messages
- Add tool execution timeout
- Add structured logging
- Add graceful failure handling
- Add safe defaults for period inference:
    - "this month" resolves to current month dates

---

# Acceptance Criteria

- User can add transaction via natural language
- User can create a budget via natural language
- AI asks for clarification when needed
- Transactions and budgets saved correctly
- Tool calls logged
- Streaming works
- Provider switch works
- No direct DB writes from AI

---

# Final Execution Order

1. Database Layer
2. Service Layer
3. MCP Tools
4. AI Agent
5. Chat API + Streaming
6. Frontend
7. Admin Panel
8. Safety & Idempotency
9. Testing
10. Production Hardening

---

# Critical Design Rule

AI must NEVER:

- Access models directly
- Execute raw queries
- Mutate data outside tools

All mutations must flow through MCP tools.

---

End of Document
