# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal finance / budget tracker. Laravel 12 (PHP 8.4) backend + Inertia v2 + React 19 + TypeScript frontend, with a Filament v4 admin panel mounted at `/admin`. Auth via Laravel Fortify. Tailwind v4 (CSS-first, no `tailwind.config.js`). DB defaults to SQLite locally; Sail compose uses MySQL 8.4.

## Common commands

```bash
# Everything-at-once dev (server + queue listener + log tail + vite)
composer dev

# Frontend only
npm run dev            # vite dev server
npm run build          # production build (also fixes Vite manifest errors)
npm run build:ssr      # SSR build
npm run lint           # eslint --fix
npm run types          # tsc --noEmit
npm run format         # prettier --write resources/

# Backend lint/format (Pint)
vendor/bin/pint --dirty        # run before finalizing changes
composer lint                  # same, parallel

# Tests (Pest 4)
php artisan test --compact                                  # all
php artisan test --compact tests/Feature/DashboardTest.php  # one file
php artisan test --compact --filter=testName                # filter
./vendor/bin/pest                                            # alt runner

# Queue worker is required for emails/notifications
php artisan queue:work          # or queue:listen in dev

# Scheduled jobs (run daily): transactions:process-recurring, reminders:send
php artisan schedule:work       # local
```

`composer setup` bootstraps a fresh checkout (install, key:generate, migrate, npm install, npm run build).

## Architecture

### Dual UI surface
- **User app**: Inertia + React. Routes in `routes/web.php` return `Inertia::render('page-name', [...])`. Pages live in `resources/js/pages/`. Layouts in `resources/js/layouts/`. Shared UI primitives in `resources/js/components/ui` (shadcn-style, Radix-based).
- **Admin panel**: Filament v4 at `/admin`. Resources in `app/Filament/Resources/<Model>/` with `Schemas/<Model>Form.php` and `Tables/<Model>Table.php`. Widgets in `app/Filament/Widgets/`. Configured in `app/Providers/Filament/AdminPanelProvider.php`.

Same Eloquent models back both surfaces — keep behavior consistent across them.

### Wayfinder bridges routes to TS
`@laravel/vite-plugin-wayfinder` auto-generates typed callers for controllers in `resources/js/actions/` and named routes in `resources/js/routes/`. Use named imports (`import { show } from '@/actions/.../FooController'`) for tree-shaking. Don't import default controller objects. If the Vite plugin isn't running, run `php artisan wayfinder:generate` after route changes.

### Money is stored as cents — models do the conversion
All monetary columns (`accounts.balance`, `transactions.amount`, `budgets.amount`, `goals.target_amount`/`current_amount`, `recurring_transactions.amount`) are `bigint` cents. Models declare accessors/mutators that divide/multiply by 100. **Do not multiply by 100 in controllers** — the mutator already does. For aggregates, bypass the accessor with `sum(DB::raw('amount'))` then divide by 100 once. See `AMOUNT_HANDLING.md`.

### Multi-currency
`App\Currency` enum is the source of truth for supported currencies (USD, EUR, GBP, CAD, AUD, JPY, CNY, INR, NGN). Accounts carry a currency; transactions inherit/copy. Dashboard aggregates are grouped by currency, not summed across them.

### UUID primary keys
Models like `Account`, `Transaction`, `RecurringTransaction`, etc. use `HasUuids`. Foreign keys are UUID strings — keep migrations/factories consistent (see existing migrations under `database/migrations/`).

### Recurring transactions
`app/Console/Commands/ProcessRecurringTransactions.php` runs daily (scheduled in `routes/console.php`). It finds `RecurringTransaction` rows where `next_due_date <= today && is_active`, creates a `Transaction` (description suffixed `(Auto)`, `is_recurring=true`), then advances `next_due_date` by the row's frequency (daily/weekly/bi-weekly/monthly/quarterly/yearly). `SendBillReminders` runs at 09:00 daily.

### Activity log & media
- `spatie/laravel-activitylog` is wired into most models via `LogsActivity` + `getActivitylogOptions()` (logs only dirty, only the listed columns).
- `spatie/laravel-medialibrary` is used by `Transaction` (`receipts` single-file collection). Media table uses UUID `model_id` (see `2026_01_18_*` migrations).

### Authorization
`spatie/laravel-permission` (roles/permissions) + Laravel policies in `app/Policies/`. Filament uses `stechstudio/filament-impersonate` and `jacobtims/filament-logger`. All user-owned resources scope by `user_id`.

### Laravel 12 file layout
Middleware, exceptions, and routing are registered in `bootstrap/app.php` (no `app/Http/Kernel.php`, no `app/Console/Kernel.php`). Console commands in `app/Console/Commands/` auto-register. Service providers list in `bootstrap/providers.php`.

## Conventions (from `.cursor/rules/laravel-boost.mdc`)

- Follow existing patterns — check sibling files before inventing structure. Don't add new top-level folders or dependencies without approval.
- PHP: explicit return types, constructor property promotion, curly braces on every control structure, PHPDoc over inline comments.
- Eloquent first — avoid `DB::` raw queries except for aggregates (cents handling). Eager-load to avoid N+1. Use Form Request classes for validation, not inline.
- Casts go in a `casts()` method on the model, not the `$casts` property (follow existing models).
- Config: read with `config('app.name')`, never `env()` outside config files.
- Routes/URLs: use named routes via `route()` (PHP) or Wayfinder imports (TS).
- Tailwind v4: `@import "tailwindcss"`, theme via `@theme {}` in CSS. No `tailwind.config.js`. Use `gap-*` for list spacing, not margins. Support `dark:` variants if siblings do.
- Inertia React: navigate with `<Link>` / `router.visit()`; build forms with `<Form>` (combine with Wayfinder's `.form()` spread when convenient).
- Tests: Pest 4. Every change should be covered. Feature tests in `tests/Feature/`, browser tests in `tests/Browser/`. Use factories. Use specific assertions (`assertForbidden`, `assertNotFound`) over `assertStatus(403)`.

Run `vendor/bin/pint --dirty` before finalizing PHP changes; run `npm run lint` and `npm run types` for the frontend.
