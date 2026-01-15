# Recurring Transactions

## Overview

Automate scheduled transactions so you don't have to manually enter them every time. Perfect for salary, rent, subscriptions, and other regular payments.

## Features

- **Automated Processing** - Transactions are automatically created when due
- **Multiple Frequencies** - Daily, weekly, bi-weekly, monthly, quarterly, yearly
- **Smart Scheduling** - Next due date automatically calculated after processing
- **Full Control** - Activate/deactivate recurring transactions anytime
- **Transaction Tracking** - Auto-generated transactions are marked with "(Auto)" suffix

## How It Works

1. **Create Recurring Transaction** - Set up the transaction details and frequency
2. **Automatic Processing** - Command runs daily to check for due transactions
3. **Transaction Created** - When due, a regular transaction is automatically created
4. **Next Date Calculated** - The next due date is automatically updated based on frequency

## Frequency Options

| Frequency | Description | Example |
|-----------|-------------|---------|
| Daily | Every day | Daily coffee subscription |
| Weekly | Every 7 days | Weekly grocery budget |
| Bi-weekly | Every 14 days | Bi-weekly paycheck |
| Monthly | Every month | Rent, utilities, subscriptions |
| Quarterly | Every 3 months | Quarterly insurance payment |
| Yearly | Every year | Annual membership fees |

## Managing Recurring Transactions

### Via Filament Admin Panel

1. Navigate to **http://localhost:8080/admin**
2. Click **Recurring Transactions** in the sidebar
3. Click **New Recurring Transaction**
4. Fill in the details:
   - Account
   - Type (Income/Expense)
   - Category
   - Amount
   - Description
   - Frequency
   - Next Due Date
5. Click **Create**

### Table View

The recurring transactions table shows:
- Account name
- Type (color-coded badge)
- Category
- Amount (formatted as USD)
- Description
- Frequency (badge)
- Next due date
- Active status

## Command Usage

### Manual Processing

Process all due recurring transactions immediately:

```bash
./vendor/bin/sail artisan transactions:process-recurring
```

### Automatic Scheduling

The command is automatically scheduled to run daily at midnight. No manual intervention needed!

Configured in `routes/console.php`:
```php
Schedule::command('transactions:process-recurring')->daily();
```

### Running the Scheduler

In production, add this to your cron:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

For local development with Sail:
```bash
./vendor/bin/sail artisan schedule:work
```

## Database Schema

**Table**: `recurring_transactions`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| account_id | UUID | Foreign key to accounts |
| category_id | UUID | Foreign key to categories (nullable) |
| type | string | income or expense |
| amount | bigint | Amount in cents |
| description | text | Transaction description |
| frequency | string | Frequency type |
| next_due_date | date | Next processing date |
| is_active | boolean | Active status |

## Model Relationships

```php
RecurringTransaction
├── belongsTo(User)
├── belongsTo(Account)
└── belongsTo(Category)

User
└── hasMany(RecurringTransaction)
```

## Example Use Cases

### Monthly Salary
- Type: Income
- Amount: $5,000
- Frequency: Monthly
- Next Due Date: 1st of each month

### Rent Payment
- Type: Expense
- Amount: $1,500
- Frequency: Monthly
- Next Due Date: 1st of each month

### Netflix Subscription
- Type: Expense
- Amount: $15.99
- Frequency: Monthly
- Next Due Date: Billing date

### Bi-weekly Paycheck
- Type: Income
- Amount: $2,500
- Frequency: Bi-weekly
- Next Due Date: Every other Friday

## Processing Logic

When a recurring transaction is processed:

1. **Check Due Date** - Find all active recurring transactions where `next_due_date <= today`
2. **Create Transaction** - Create a new transaction with:
   - Same user, account, category, type, amount
   - Description appended with " (Auto)"
   - Transaction date set to today
   - `is_recurring` flag set to true
3. **Update Next Due Date** - Calculate and update based on frequency:
   - Daily: +1 day
   - Weekly: +7 days
   - Bi-weekly: +14 days
   - Monthly: +1 month
   - Quarterly: +3 months
   - Yearly: +1 year

## Command Implementation

**File**: `app/Console/Commands/ProcessRecurringTransactions.php`

Key methods:
- `handle()` - Main processing logic
- `calculateNextDueDate()` - Calculates next due date based on frequency

## Testing

### Create Test Recurring Transaction

```bash
./vendor/bin/sail artisan tinker
```

```php
$user = User::where('email', 'admin@example.com')->first();
$account = Account::where('user_id', $user->id)->first();
$category = Category::where('name', 'Salary')->first();

RecurringTransaction::create([
    'user_id' => $user->id,
    'account_id' => $account->id,
    'category_id' => $category->id,
    'type' => 'income',
    'amount' => 500000, // $5,000
    'description' => 'Monthly Salary',
    'frequency' => 'monthly',
    'next_due_date' => now()->subDay(), // Due yesterday
    'is_active' => true,
]);
```

### Process Immediately

```bash
./vendor/bin/sail artisan transactions:process-recurring
```

### Verify Transaction Created

```bash
./vendor/bin/sail artisan tinker
```

```php
Transaction::latest()->first();
```

## Deactivating Recurring Transactions

To stop a recurring transaction without deleting it:

1. Go to Recurring Transactions in admin panel
2. Click Edit on the transaction
3. Toggle "Active" to OFF
4. Click Save

The transaction will remain in the database but won't be processed.

## Future Enhancements

Potential improvements:
- Email notifications when transactions are processed
- End date support (stop after specific date)
- Skip weekends/holidays option
- Custom frequency (every X days/months)
- Transaction preview before processing
- Bulk activate/deactivate
- Processing history log

## Notes

- All amounts are stored in cents to avoid floating-point precision issues
- Transactions created from recurring transactions are marked with "(Auto)" suffix
- The `is_recurring` flag on transactions helps identify auto-generated entries
- Next due date uses Carbon for accurate date calculations
- Inactive recurring transactions are skipped during processing
