# Database Schema Design

## Entity Relationship Overview

### Core Entities
1. **Users** - Application users
2. **Accounts** - Financial accounts (bank, credit card, etc.)
3. **Categories** - Transaction categories
4. **Transactions** - Financial transactions
5. **Budgets** - Monthly budget allocations
6. **Goals** - Financial goals and targets
7. **Recurring Transactions** - Templates for recurring transactions

## Database Tables

### users
```sql
id                  bigint unsigned primary key
name                varchar(255) not null
email               varchar(255) unique not null
email_verified_at   timestamp null
password            varchar(255) not null
two_factor_secret   text null
two_factor_recovery_codes text null
two_factor_confirmed_at timestamp null
remember_token      varchar(100) null
current_team_id     bigint unsigned null
profile_photo_path  varchar(2048) null
created_at          timestamp null
updated_at          timestamp null
```

### accounts
```sql
id          bigint unsigned primary key
user_id     bigint unsigned not null
name        varchar(255) not null
type        enum('checking', 'savings', 'credit_card', 'investment', 'cash') not null
balance     decimal(15,2) default 0.00
currency    varchar(3) default 'USD'
is_active   boolean default true
description text null
created_at  timestamp null
updated_at  timestamp null

foreign key (user_id) references users(id) on delete cascade
index idx_accounts_user_id (user_id)
```

### categories
```sql
id          bigint unsigned primary key
user_id     bigint unsigned not null
name        varchar(255) not null
type        enum('income', 'expense') not null
color       varchar(7) null -- hex color code
icon        varchar(50) null
parent_id   bigint unsigned null -- for subcategories
is_active   boolean default true
created_at  timestamp null
updated_at  timestamp null

foreign key (user_id) references users(id) on delete cascade
foreign key (parent_id) references categories(id) on delete set null
index idx_categories_user_id (user_id)
index idx_categories_parent_id (parent_id)
```

### transactions
```sql
id              bigint unsigned primary key
user_id         bigint unsigned not null
account_id      bigint unsigned not null
category_id     bigint unsigned null
type            enum('income', 'expense', 'transfer') not null
amount          decimal(15,2) not null
description     text null
transaction_date date not null
notes           text null
is_recurring    boolean default false
recurring_transaction_id bigint unsigned null
created_at      timestamp null
updated_at      timestamp null

foreign key (user_id) references users(id) on delete cascade
foreign key (account_id) references accounts(id) on delete cascade
foreign key (category_id) references categories(id) on delete set null
foreign key (recurring_transaction_id) references recurring_transactions(id) on delete set null
index idx_transactions_user_id (user_id)
index idx_transactions_account_id (account_id)
index idx_transactions_category_id (category_id)
index idx_transactions_date (transaction_date)
```

### transfers
```sql
id                  bigint unsigned primary key
user_id             bigint unsigned not null
from_account_id     bigint unsigned not null
to_account_id       bigint unsigned not null
from_transaction_id bigint unsigned not null
to_transaction_id   bigint unsigned not null
amount              decimal(15,2) not null
description         text null
transfer_date       date not null
created_at          timestamp null
updated_at          timestamp null

foreign key (user_id) references users(id) on delete cascade
foreign key (from_account_id) references accounts(id) on delete cascade
foreign key (to_account_id) references accounts(id) on delete cascade
foreign key (from_transaction_id) references transactions(id) on delete cascade
foreign key (to_transaction_id) references transactions(id) on delete cascade
index idx_transfers_user_id (user_id)
```

### budgets
```sql
id          bigint unsigned primary key
user_id     bigint unsigned not null
category_id bigint unsigned not null
amount      decimal(15,2) not null
period_type enum('monthly', 'yearly') default 'monthly'
period_year int not null
period_month int null -- null for yearly budgets
is_active   boolean default true
created_at  timestamp null
updated_at  timestamp null

foreign key (user_id) references users(id) on delete cascade
foreign key (category_id) references categories(id) on delete cascade
unique key unique_budget_period (user_id, category_id, period_type, period_year, period_month)
index idx_budgets_user_id (user_id)
index idx_budgets_period (period_year, period_month)
```

### goals
```sql
id              bigint unsigned primary key
user_id         bigint unsigned not null
name            varchar(255) not null
description     text null
target_amount   decimal(15,2) not null
current_amount  decimal(15,2) default 0.00
target_date     date null
category        varchar(100) null -- Emergency Fund, Vacation, etc.
is_completed    boolean default false
is_active       boolean default true
created_at      timestamp null
updated_at      timestamp null

foreign key (user_id) references users(id) on delete cascade
index idx_goals_user_id (user_id)
index idx_goals_target_date (target_date)
```

### recurring_transactions
```sql
id              bigint unsigned primary key
user_id         bigint unsigned not null
account_id      bigint unsigned not null
category_id     bigint unsigned null
type            enum('income', 'expense') not null
amount          decimal(15,2) not null
description     text null
frequency       enum('daily', 'weekly', 'monthly', 'yearly') not null
frequency_value int default 1 -- every X days/weeks/months/years
start_date      date not null
end_date        date null
next_due_date   date not null
is_active       boolean default true
created_at      timestamp null
updated_at      timestamp null

foreign key (user_id) references users(id) on delete cascade
foreign key (account_id) references accounts(id) on delete cascade
foreign key (category_id) references categories(id) on delete set null
index idx_recurring_user_id (user_id)
index idx_recurring_next_due (next_due_date)
```

### budget_alerts
```sql
id          bigint unsigned primary key
user_id     bigint unsigned not null
budget_id   bigint unsigned not null
threshold   decimal(5,2) not null -- percentage (e.g., 80.00 for 80%)
is_enabled  boolean default true
created_at  timestamp null
updated_at  timestamp null

foreign key (user_id) references users(id) on delete cascade
foreign key (budget_id) references budgets(id) on delete cascade
index idx_budget_alerts_user_id (user_id)
```

## Default Categories

### Income Categories
- Salary
- Freelance
- Investment Returns
- Business Income
- Other Income

### Expense Categories
- Housing (Rent/Mortgage, Utilities, Maintenance)
- Transportation (Gas, Public Transit, Car Payment)
- Food (Groceries, Dining Out)
- Healthcare (Insurance, Medical Bills)
- Entertainment (Movies, Subscriptions, Hobbies)
- Shopping (Clothing, Electronics)
- Personal Care
- Education
- Insurance
- Taxes
- Savings & Investments
- Debt Payments
- Miscellaneous

## Indexes and Performance

### Key Indexes
- User-based queries: All tables have user_id indexes
- Date-based queries: transaction_date, target_date, next_due_date
- Category lookups: category_id indexes
- Account lookups: account_id indexes

### Query Optimization
- Use composite indexes for common query patterns
- Partition large tables by date if needed
- Consider read replicas for reporting queries
- Implement proper caching strategies

## Data Integrity Rules

1. **Cascading Deletes**: User deletion removes all related data
2. **Soft Deletes**: Categories and accounts use is_active flags
3. **Balance Consistency**: Account balances updated via transactions
4. **Budget Periods**: Unique constraints prevent duplicate budgets
5. **Transfer Integrity**: Transfers create paired transactions
