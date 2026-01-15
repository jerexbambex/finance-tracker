# Dashboard Widgets

## Overview

Three custom widgets have been added to the Filament admin dashboard to provide real-time financial insights.

## Widgets

### 1. Stats Overview Widget
**File**: `app/Filament/Widgets/StatsOverview.php`

Displays 5 key financial metrics:

- **Total Balance** - Sum of all active account balances
- **This Month Income** - Total income for current month
- **This Month Expenses** - Total expenses for current month
- **Active Budgets** - Count of currently active budgets
- **Active Goals** - Count of in-progress goals

Each stat is color-coded:
- Success (green) - Balance and Income
- Danger (red) - Expenses
- Info (blue) - Budgets
- Warning (yellow) - Goals

### 2. Budget Overview Chart
**File**: `app/Filament/Widgets/BudgetOverview.php`

Bar chart comparing budgeted amounts vs actual spending for the current month.

**Features**:
- Shows all active monthly budgets
- Compares budget limit (blue) with actual spending (red)
- Automatically filters to current month
- Groups by category

**Data Source**:
- Budget amounts from `budgets` table
- Actual spending from `transactions` table (expense type only)

### 3. Recent Transactions Table
**File**: `app/Filament/Widgets/RecentTransactions.php`

Displays the 10 most recent transactions.

**Columns**:
- Transaction Date
- Account Name
- Type (with color-coded badges)
- Category Name
- Amount (formatted as USD)
- Description (truncated to 50 chars)

**Features**:
- Sorted by transaction date (newest first)
- Full-width display
- Color-coded transaction types:
  - Income: Green
  - Expense: Red
  - Transfer: Blue

## Widget Order

Widgets are displayed in the following order (controlled by `$sort` property):

1. Stats Overview (sort: default)
2. Recent Transactions (sort: 2)
3. Budget Overview Chart (sort: 3)

## Test Data

Sample data has been seeded for the admin user:

**Accounts**:
- Main Checking: $5,000
- Emergency Fund: $10,000

**Transactions** (This Month):
- Income: $5,000 (Salary)
- Expenses: $1,983 (Rent, Groceries, Gas)

**Budgets** (This Month):
- Housing: $1,500
- Food & Dining: $600
- Transportation: $200

**Goals**:
- Emergency Fund: $10,000 / $20,000 (50%)
- Vacation Fund: $1,500 / $5,000 (30%)

## Customization

### Change Widget Order
Edit the `$sort` property in each widget class:

```php
protected static ?int $sort = 1;
```

### Modify Stats
Edit `StatsOverview::getStats()` to add/remove/modify stats:

```php
Stat::make('Label', 'Value')
    ->description('Description')
    ->color('success')
```

### Customize Chart
Edit `BudgetOverview::getData()` to change:
- Chart type (bar, line, pie, etc.)
- Data filtering
- Colors
- Labels

### Adjust Table Columns
Edit `RecentTransactions::table()` to modify columns:

```php
TextColumn::make('field_name')
    ->label('Label')
    ->sortable()
```

## Performance Notes

- All widgets query only the authenticated user's data
- Queries are optimized with proper indexes
- Chart data is calculated on-demand
- Consider caching for high-traffic applications

## Future Enhancements

Potential improvements:
- Add date range filters to widgets
- Create income vs expenses trend chart
- Add goal progress chart
- Implement spending by category pie chart
- Add monthly comparison widget
- Cache widget data for better performance
