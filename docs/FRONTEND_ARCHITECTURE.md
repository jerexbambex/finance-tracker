# Frontend Architecture

## Technology Stack
- **Framework**: React 18 with TypeScript
- **Routing**: Inertia.js (SPA experience with Laravel backend)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React hooks + Inertia.js shared data
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite

## Project Structure
```
resources/js/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── forms/          # Form components
│   ├── charts/         # Chart components
│   └── common/         # Common components
├── layouts/            # Page layouts
├── pages/              # Inertia.js pages
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── actions/            # Server actions
```

## Component Architecture

### Base Components (shadcn/ui)
```
components/ui/
├── button.tsx
├── input.tsx
├── card.tsx
├── dialog.tsx
├── form.tsx
├── table.tsx
├── select.tsx
├── badge.tsx
├── alert.tsx
└── ...
```

### Feature Components
```
components/
├── transactions/
│   ├── TransactionList.tsx
│   ├── TransactionForm.tsx
│   ├── TransactionFilters.tsx
│   └── TransactionCard.tsx
├── accounts/
│   ├── AccountList.tsx
│   ├── AccountForm.tsx
│   └── AccountCard.tsx
├── budgets/
│   ├── BudgetList.tsx
│   ├── BudgetForm.tsx
│   ├── BudgetProgress.tsx
│   └── BudgetChart.tsx
├── goals/
│   ├── GoalList.tsx
│   ├── GoalForm.tsx
│   └── GoalProgress.tsx
└── dashboard/
    ├── DashboardStats.tsx
    ├── RecentTransactions.tsx
    ├── BudgetOverview.tsx
    └── GoalOverview.tsx
```

## Page Structure

### Main Pages
```
pages/
├── dashboard.tsx       # Main dashboard
├── transactions/
│   ├── index.tsx      # Transaction list
│   ├── create.tsx     # Add transaction
│   └── [id]/edit.tsx  # Edit transaction
├── accounts/
│   ├── index.tsx      # Account list
│   ├── create.tsx     # Add account
│   └── [id]/
│       ├── show.tsx   # Account details
│       └── edit.tsx   # Edit account
├── budgets/
│   ├── index.tsx      # Budget list
│   ├── create.tsx     # Create budget
│   └── [id]/edit.tsx  # Edit budget
├── goals/
│   ├── index.tsx      # Goals list
│   ├── create.tsx     # Create goal
│   └── [id]/edit.tsx  # Edit goal
├── reports/
│   ├── index.tsx      # Reports dashboard
│   ├── spending.tsx   # Spending analysis
│   └── trends.tsx     # Trend analysis
└── settings/
    ├── profile.tsx    # User profile
    ├── categories.tsx # Manage categories
    └── preferences.tsx # App preferences
```

## TypeScript Definitions

### Core Types
```typescript
// types/index.ts
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  two_factor_confirmed_at?: string;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash';
  balance: string;
  currency: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  parent_id?: number;
  is_active: boolean;
  children?: Category[];
}

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id?: number;
  type: 'income' | 'expense' | 'transfer';
  amount: string;
  description: string;
  transaction_date: string;
  notes?: string;
  is_recurring: boolean;
  account: Account;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  period_type: 'monthly' | 'yearly';
  period_year: number;
  period_month?: number;
  is_active: boolean;
  category: Category;
  spent_amount?: string;
  remaining_amount?: string;
  percentage_used?: number;
}

export interface Goal {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  target_amount: string;
  current_amount: string;
  target_date?: string;
  category?: string;
  is_completed: boolean;
  is_active: boolean;
  percentage_complete?: number;
}
```

### Form Types
```typescript
// types/forms.ts
export interface TransactionFormData {
  account_id: number;
  category_id?: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  transaction_date: string;
  notes?: string;
}

export interface AccountFormData {
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash';
  balance: number;
  currency: string;
  description?: string;
}

export interface BudgetFormData {
  category_id: number;
  amount: number;
  period_type: 'monthly' | 'yearly';
  period_year: number;
  period_month?: number;
}
```

## Custom Hooks

### Data Fetching Hooks
```typescript
// hooks/useTransactions.ts
export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Implementation
}

// hooks/useAccounts.ts
export function useAccounts() {
  // Implementation
}

// hooks/useBudgets.ts
export function useBudgets(period?: { year: number; month?: number }) {
  // Implementation
}
```

### Utility Hooks
```typescript
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Implementation
}

// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number) {
  // Implementation
}

// hooks/useCurrency.ts
export function useCurrency() {
  const formatCurrency = (amount: string | number) => {
    // Implementation
  };
  
  return { formatCurrency };
}
```

## State Management Strategy

### Inertia.js Shared Data
```typescript
// app.tsx
interface SharedProps {
  auth: {
    user: User;
  };
  flash: {
    success?: string;
    error?: string;
  };
  accounts: Account[];
  categories: Category[];
}
```

### Local Component State
- Form state with React Hook Form
- UI state (modals, filters, pagination)
- Temporary data (search queries, selections)

### URL State
- Filters and search parameters
- Pagination state
- Active tabs and views

## Form Handling

### Form Validation with Zod
```typescript
// lib/validations.ts
import { z } from 'zod';

export const transactionSchema = z.object({
  account_id: z.number().min(1, 'Account is required'),
  category_id: z.number().optional(),
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  transaction_date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
```

### Form Component Example
```typescript
// components/forms/TransactionForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';

export function TransactionForm({ transaction }: { transaction?: Transaction }) {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction || {
      type: 'expense',
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    if (transaction) {
      router.put(`/transactions/${transaction.id}`, data);
    } else {
      router.post('/transactions', data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

## Styling Guidelines

### Tailwind CSS Classes
- Use consistent spacing scale (4, 8, 12, 16, 24, 32)
- Consistent color palette from design system
- Responsive design with mobile-first approach
- Dark mode support with CSS variables

### Component Styling
```typescript
// Example component with consistent styling
export function TransactionCard({ transaction }: { transaction: Transaction }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          )}>
            {/* Icon */}
          </div>
          <div>
            <p className="font-medium text-gray-900">{transaction.description}</p>
            <p className="text-sm text-gray-500">{transaction.category?.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            "font-semibold",
            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
          )}>
            {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
          </p>
          <p className="text-sm text-gray-500">{transaction.transaction_date}</p>
        </div>
      </div>
    </Card>
  );
}
```

## Performance Optimization

### Code Splitting
- Lazy load pages with React.lazy()
- Dynamic imports for heavy components
- Route-based code splitting with Inertia.js

### Memoization
- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for event handlers

### Data Loading
- Inertia.js partial reloads
- Optimistic updates for better UX
- Proper loading states and error handling
