# Phase 1 Database Schema

## Entity Relationship Diagram

```
┌─────────────────────┐
│       users         │
│─────────────────────│
│ id (uuid) PK        │
│ name                │
│ email               │
│ ...                 │
└─────────────────────┘
         │
         │ 1:N
         ├──────────────────────────────────┐
         │                                  │
         │                                  │
         ▼                                  ▼
┌─────────────────────┐          ┌─────────────────────┐
│ ai_conversations    │          │   ai_tool_runs      │
│─────────────────────│          │─────────────────────│
│ id (uuid) PK        │          │ id (uuid) PK        │
│ user_id FK          │          │ user_id FK          │
│ title               │          │ tool_name           │
│ created_at          │          │ input_payload       │
│ updated_at          │          │ output_payload      │
└─────────────────────┘          │ status              │
         │                       │ created_at          │
         │ 1:N                   │ updated_at          │
         │                       └─────────────────────┘
         ▼
┌─────────────────────┐
│    ai_messages      │
│─────────────────────│
│ id (uuid) PK        │
│ conversation_id FK  │
│ role (enum)         │
│ content (json)      │
│ client_message_id   │
│ created_at          │
│ updated_at          │
└─────────────────────┘


┌─────────────────────┐
│       users         │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐          ┌─────────────────────┐
│      budgets        │          │    categories       │
│─────────────────────│          │─────────────────────│
│ id (uuid) PK        │          │ id (uuid) PK        │
│ user_id FK          │◄─────────│ ...                 │
│ category_id FK      │   N:1    └─────────────────────┘
│ name                │
│ amount              │
│ currency            │
│ period_type         │
│ period_year         │
│ period_month        │
│ start_date          │
│ end_date            │
│ notes               │
│ is_active           │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

## Table Details

### ai_conversations
**Purpose:** Store user chat conversations with the AI assistant

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique conversation identifier |
| user_id | uuid | FK → users.id | Conversation owner |
| title | varchar(255) | nullable | Conversation title (auto-generated or user-set) |
| created_at | timestamp | nullable | Creation timestamp |
| updated_at | timestamp | nullable | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) ON DELETE CASCADE

---

### ai_messages
**Purpose:** Store individual messages within conversations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique message identifier |
| conversation_id | uuid | FK → ai_conversations.id | Parent conversation |
| role | enum | 'user', 'assistant', 'tool' | Message sender role |
| content | json | - | Message content (flexible structure) |
| client_message_id | uuid | nullable | Client-side message ID for idempotency |
| created_at | timestamp | nullable | Creation timestamp |
| updated_at | timestamp | nullable | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (conversation_id) ON DELETE CASCADE

**Content JSON Structure Examples:**

```json
// User message
{
  "text": "Show me my spending for March"
}

// Assistant message
{
  "text": "Here's your spending for March...",
  "tool_calls": [...]
}

// Tool message
{
  "tool_name": "transactions.list",
  "result": {...}
}
```

---

### ai_tool_runs
**Purpose:** Audit log for all tool executions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique tool run identifier |
| user_id | uuid | FK → users.id | User who triggered the tool |
| tool_name | varchar(255) | - | Name of the tool executed |
| input_payload | json | - | Tool input parameters |
| output_payload | json | nullable | Tool execution result |
| status | varchar(255) | - | Execution status (success, error, pending) |
| created_at | timestamp | nullable | Execution start timestamp |
| updated_at | timestamp | nullable | Execution completion timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) ON DELETE CASCADE

**Status Values:**
- `pending` - Tool execution started
- `success` - Tool completed successfully
- `error` - Tool execution failed

---

### budgets (updated)
**Purpose:** Store user budget allocations with flexible period tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique budget identifier |
| user_id | uuid | FK → users.id | Budget owner |
| name | varchar(255) | nullable | Budget name (e.g., "March Food Budget") |
| category_id | uuid | FK → categories.id | Budget category |
| amount | bigint unsigned | - | Budget amount in cents |
| currency | varchar(3) | default 'USD' | Currency code (ISO 4217) |
| period_type | varchar(255) | default 'monthly' | Period type (monthly, weekly, yearly) |
| period_year | int | - | Budget year |
| period_month | int | nullable | Budget month (1-12, null for yearly) |
| start_date | date | nullable | **NEW** Period start date |
| end_date | date | nullable | **NEW** Period end date |
| notes | text | nullable | **NEW** Budget notes/context |
| is_active | boolean | default true | Whether budget is active |
| created_at | timestamp | nullable | Creation timestamp |
| updated_at | timestamp | nullable | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (user_id, category_id, period_type, period_year, period_month)
- FOREIGN KEY (user_id) ON DELETE CASCADE
- FOREIGN KEY (category_id) ON DELETE CASCADE

**Notes:**
- Amount is stored in cents to avoid floating-point precision issues
- The Budget model has accessors/mutators to convert between cents and dollars
- start_date and end_date provide flexibility for custom date ranges
- The unique constraint prevents duplicate budgets for the same period

---

## Data Flow Architecture

```
┌─────────────┐
│   User      │
│  (Frontend) │
└──────┬──────┘
       │
       │ POST /api/chat
       │ { message: "Set $500 food budget" }
       ▼
┌─────────────────────────────────────────┐
│         Chat API (Phase 5)              │
│  1. Store user message → ai_messages    │
│  2. Load conversation context           │
│  3. Invoke AI Agent                     │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      AI Agent (Phase 4)                 │
│  Interprets intent, calls tools         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      MCP Tools (Phase 3)                │
│  1. Log to ai_tool_runs (pending)       │
│  2. Call Service Layer                  │
│  3. Update ai_tool_runs (success/error) │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│    Service Layer (Phase 2)              │
│  1. Validate ownership                  │
│  2. Normalize data                      │
│  3. Persist to budgets table            │
│  4. Return structured result            │
└─────────────────────────────────────────┘
```

---

## Security Considerations

1. **Ownership Validation**: All queries must filter by authenticated user_id
2. **Foreign Key Constraints**: Cascade deletes ensure data integrity
3. **UUID Primary Keys**: Prevent enumeration attacks
4. **JSON Validation**: Input payloads should be validated before storage
5. **Audit Trail**: ai_tool_runs provides complete audit log

---

## Performance Considerations

1. **Indexes**: Foreign keys are automatically indexed
2. **JSON Columns**: Consider adding JSON indexes for frequently queried paths
3. **Conversation Pruning**: Implement strategy to limit context to last N messages
4. **Tool Run Archival**: Consider archiving old tool runs to separate table

---

## Future Enhancements (Post-Phase 1)

1. Add index on `ai_messages.client_message_id` for idempotency checks
2. Add index on `ai_tool_runs.tool_name` for analytics
3. Add index on `ai_tool_runs.status` for monitoring
4. Consider partitioning `ai_tool_runs` by date for large datasets
5. Add soft deletes to `ai_conversations` for user privacy

---

**Schema Version:** 1.0  
**Last Updated:** March 2, 2026  
**Status:** Production Ready ✅
