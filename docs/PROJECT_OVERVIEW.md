# Budget Tracker - Project Overview

## Project Description
A comprehensive personal finance and budget tracking application built with Laravel and React. The application helps users manage their finances by tracking income, expenses, budgets, and financial goals with real-time insights and reporting.

## Tech Stack
- **Backend**: Laravel 12.x with PHP 8.2+
- **Frontend**: React 18 with TypeScript
- **UI Framework**: Inertia.js for SPA experience
- **Authentication**: Laravel Fortify
- **Database**: SQLite (development), MySQL/PostgreSQL (production)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Testing**: Pest PHP
- **Code Quality**: Laravel Pint, ESLint

## Core Features

### 1. User Management
- User registration and authentication
- Profile management
- Two-factor authentication
- Password reset functionality

### 2. Account Management
- Multiple account types (Checking, Savings, Credit Card, Investment)
- Account balance tracking
- Account categorization and organization

### 3. Transaction Management
- Income and expense tracking
- Transaction categorization
- Recurring transactions
- Transaction search and filtering
- Bulk transaction operations

### 4. Budget Management
- Monthly/yearly budget creation
- Category-based budgeting
- Budget vs actual spending analysis
- Budget alerts and notifications

### 5. Financial Goals
- Savings goals tracking
- Debt payoff planning
- Goal progress visualization
- Milestone notifications

### 6. Reporting & Analytics
- Spending patterns analysis
- Income vs expense reports
- Category-wise spending breakdown
- Monthly/yearly financial summaries
- Export capabilities (PDF, CSV)

### 7. Dashboard
- Financial overview
- Recent transactions
- Budget status
- Goal progress
- Quick actions

## Project Structure

```
budget-app/
├── app/
│   ├── Http/Controllers/     # API and web controllers
│   ├── Models/              # Eloquent models
│   ├── Services/            # Business logic services
│   └── Actions/             # Single-purpose action classes
├── database/
│   ├── migrations/          # Database schema
│   └── seeders/            # Sample data
├── resources/
│   ├── js/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Inertia.js pages
│   │   ├── layouts/        # Page layouts
│   │   └── types/          # TypeScript definitions
│   └── css/                # Styles
├── routes/                 # Application routes
└── tests/                  # Test suites
```

## Development Workflow
1. Feature planning and requirements gathering
2. Database schema design and migrations
3. Backend API development with tests
4. Frontend component development
5. Integration testing
6. Code review and deployment

## Getting Started
See [SETUP.md](./SETUP.md) for detailed installation and setup instructions.
