# Budget App

A modern personal finance management application built with Laravel and React.

## Features

- Account management with multi-currency support
- Transaction tracking and categorization
- Budget planning and monitoring
- Financial goals tracking
- Recurring transactions
- Reports and insights
- Email notifications

## Development Setup

### Prerequisites

- PHP 8.4+
- MySQL 8.0+
- Node.js 22+
- Composer

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   composer install
   npm install
   ```

3. Copy `.env.example` to `.env` and configure your database

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Run migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```

6. Build frontend assets:
   ```bash
   npm run build
   ```

### Running the Application

Start the development server:
```bash
php artisan serve
```

**Important:** To process queued jobs (like welcome emails), run the queue worker in a separate terminal:
```bash
php artisan queue:work
```

For development, you can also use:
```bash
php artisan queue:listen
```

### Creating an Admin User

Run the admin seeder:
```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
php artisan db:seed --class=AdminUserSeeder
```

Or set these environment variables before seeding:
```
ADMIN_NAME="Your Name"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

## Testing

Run the test suite:
```bash
./vendor/bin/pest
```

Run linting:
```bash
npm run lint
```

## License

This project is open-sourced software.
