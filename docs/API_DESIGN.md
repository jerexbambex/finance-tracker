# API Design Specification

## API Overview
RESTful API design following Laravel conventions with Inertia.js for seamless SPA experience.

## Authentication
- **Method**: Laravel Sanctum for API tokens
- **Session**: Web-based authentication for Inertia.js pages
- **Headers**: `Authorization: Bearer {token}` for API requests

## Base URL Structure
```
Web Routes: /
API Routes: /api/v1/
```

## Response Format
```json
{
  "data": {},
  "message": "Success message",
  "meta": {
    "pagination": {},
    "filters": {}
  }
}
```

## Error Response Format
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Validation error message"]
  },
  "code": 422
}
```

## Endpoints

### Authentication
```
POST   /login                    # User login
POST   /register                 # User registration
POST   /logout                   # User logout
POST   /forgot-password          # Password reset request
POST   /reset-password           # Password reset
GET    /user                     # Get authenticated user
PUT    /user/profile             # Update user profile
POST   /user/two-factor-authentication  # Enable 2FA
DELETE /user/two-factor-authentication  # Disable 2FA
```

### Accounts
```
GET    /accounts                 # List user accounts
POST   /accounts                 # Create new account
GET    /accounts/{id}            # Get account details
PUT    /accounts/{id}            # Update account
DELETE /accounts/{id}            # Delete account
GET    /accounts/{id}/transactions # Get account transactions
```

### Categories
```
GET    /categories               # List user categories
POST   /categories               # Create new category
GET    /categories/{id}          # Get category details
PUT    /categories/{id}          # Update category
DELETE /categories/{id}          # Delete category
GET    /categories/default       # Get default categories
```

### Transactions
```
GET    /transactions             # List transactions with filters
POST   /transactions             # Create new transaction
GET    /transactions/{id}        # Get transaction details
PUT    /transactions/{id}        # Update transaction
DELETE /transactions/{id}        # Delete transaction
POST   /transactions/bulk        # Bulk operations
GET    /transactions/search      # Search transactions
POST   /transactions/transfer    # Create transfer between accounts
```

### Budgets
```
GET    /budgets                  # List budgets
POST   /budgets                  # Create new budget
GET    /budgets/{id}             # Get budget details
PUT    /budgets/{id}             # Update budget
DELETE /budgets/{id}             # Delete budget
GET    /budgets/current          # Get current period budgets
POST   /budgets/copy             # Copy budget to new period
GET    /budgets/{id}/progress    # Get budget progress
```

### Goals
```
GET    /goals                    # List goals
POST   /goals                    # Create new goal
GET    /goals/{id}               # Get goal details
PUT    /goals/{id}               # Update goal
DELETE /goals/{id}               # Delete goal
POST   /goals/{id}/contribute    # Add contribution to goal
GET    /goals/{id}/progress      # Get goal progress
```

### Recurring Transactions
```
GET    /recurring-transactions   # List recurring transactions
POST   /recurring-transactions   # Create recurring transaction
GET    /recurring-transactions/{id} # Get details
PUT    /recurring-transactions/{id} # Update
DELETE /recurring-transactions/{id} # Delete
POST   /recurring-transactions/{id}/execute # Execute now
```

### Reports
```
GET    /reports/dashboard        # Dashboard summary
GET    /reports/spending-trends  # Spending trends over time
GET    /reports/category-breakdown # Category-wise breakdown
GET    /reports/income-expense   # Income vs expense report
GET    /reports/net-worth        # Net worth over time
POST   /reports/export           # Export report data
```

## Request/Response Examples

### Create Transaction
**Request:**
```http
POST /transactions
Content-Type: application/json

{
  "account_id": 1,
  "category_id": 5,
  "type": "expense",
  "amount": 25.50,
  "description": "Coffee shop",
  "transaction_date": "2024-01-15",
  "notes": "Morning coffee"
}
```

**Response:**
```json
{
  "data": {
    "id": 123,
    "account_id": 1,
    "category_id": 5,
    "type": "expense",
    "amount": "25.50",
    "description": "Coffee shop",
    "transaction_date": "2024-01-15",
    "notes": "Morning coffee",
    "account": {
      "id": 1,
      "name": "Checking Account"
    },
    "category": {
      "id": 5,
      "name": "Food & Dining"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Transaction created successfully"
}
```

### List Transactions with Filters
**Request:**
```http
GET /transactions?account_id=1&category_id=5&start_date=2024-01-01&end_date=2024-01-31&page=1&per_page=20
```

**Response:**
```json
{
  "data": [
    {
      "id": 123,
      "account_id": 1,
      "category_id": 5,
      "type": "expense",
      "amount": "25.50",
      "description": "Coffee shop",
      "transaction_date": "2024-01-15",
      "account": {
        "id": 1,
        "name": "Checking Account"
      },
      "category": {
        "id": 5,
        "name": "Food & Dining"
      }
    }
  ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 150,
      "last_page": 8
    },
    "filters": {
      "account_id": 1,
      "category_id": 5,
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    }
  }
}
```

### Dashboard Summary
**Request:**
```http
GET /reports/dashboard
```

**Response:**
```json
{
  "data": {
    "total_balance": "5250.75",
    "monthly_income": "4500.00",
    "monthly_expenses": "3200.50",
    "budget_utilization": 71.2,
    "active_goals": 3,
    "recent_transactions": [
      {
        "id": 123,
        "amount": "25.50",
        "description": "Coffee shop",
        "transaction_date": "2024-01-15",
        "category": {
          "name": "Food & Dining"
        }
      }
    ],
    "budget_alerts": [
      {
        "category": "Entertainment",
        "spent": "180.00",
        "budget": "200.00",
        "percentage": 90
      }
    ],
    "goal_progress": [
      {
        "id": 1,
        "name": "Emergency Fund",
        "current_amount": "2500.00",
        "target_amount": "5000.00",
        "percentage": 50
      }
    ]
  }
}
```

## Validation Rules

### Transaction Validation
```php
[
    'account_id' => 'required|exists:accounts,id',
    'category_id' => 'nullable|exists:categories,id',
    'type' => 'required|in:income,expense,transfer',
    'amount' => 'required|numeric|min:0.01|max:999999.99',
    'description' => 'required|string|max:255',
    'transaction_date' => 'required|date|before_or_equal:today',
    'notes' => 'nullable|string|max:1000'
]
```

### Budget Validation
```php
[
    'category_id' => 'required|exists:categories,id',
    'amount' => 'required|numeric|min:0.01|max:999999.99',
    'period_type' => 'required|in:monthly,yearly',
    'period_year' => 'required|integer|min:2020|max:2030',
    'period_month' => 'required_if:period_type,monthly|integer|min:1|max:12'
]
```

## Rate Limiting
- **Authentication endpoints**: 5 requests per minute
- **General API endpoints**: 60 requests per minute
- **Bulk operations**: 10 requests per minute

## Pagination
- Default page size: 20 items
- Maximum page size: 100 items
- Use `page` and `per_page` query parameters

## Filtering and Sorting
- **Date filters**: `start_date`, `end_date`
- **Amount filters**: `min_amount`, `max_amount`
- **Category filter**: `category_id`
- **Account filter**: `account_id`
- **Sorting**: `sort_by` and `sort_direction` parameters
- **Search**: `search` parameter for text-based searches
