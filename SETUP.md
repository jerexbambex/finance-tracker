# Budget Tracker - Setup Guide

## Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- SQLite (development) or MySQL/PostgreSQL (production)
- Git

## Installation

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url> budget-app
cd budget-app

# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 2. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database (SQLite for development)
touch database/database.sqlite
```

### 3. Database Setup
```bash
# Run migrations
php artisan migrate

# Seed default categories (optional)
php artisan db:seed
```

### 4. Build Assets
```bash
# Development build
npm run dev

# Production build
npm run build
```

## Development Workflow

### Start Development Server
```bash
# Option 1: Use the built-in dev script (recommended)
composer run dev

# Option 2: Manual setup
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev

# Terminal 3: Queue worker (if using queues)
php artisan queue:work

# Terminal 4: Log viewer
php artisan pail
```

### Running Tests
```bash
# Run all tests
composer test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

### Code Quality
```bash
# Format code
composer run lint

# Check code style
composer run test:lint
```

## Project Structure

```
budget-app/
├── app/
│   ├── Http/Controllers/     # Request handlers
│   ├── Models/              # Eloquent models
│   ├── Services/            # Business logic
│   └── Actions/             # Single-purpose actions
├── database/
│   ├── migrations/          # Database schema
│   └── seeders/            # Sample data
├── resources/
│   ├── js/                 # React/TypeScript frontend
│   └── css/                # Styles
├── routes/                 # Application routes
├── tests/                  # Test suites
└── docs/                   # Documentation
```

## Configuration

### Database Configuration
Edit `.env` file:
```env
# SQLite (Development)
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database/database.sqlite

# MySQL (Production)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=budget_app
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Mail Configuration
```env
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourapp.com
MAIL_FROM_NAME="Budget Tracker"
```

### Application Settings
```env
APP_NAME="Budget Tracker"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_TIMEZONE=UTC
```

## Available Commands

### Artisan Commands
```bash
# Database
php artisan migrate                 # Run migrations
php artisan migrate:rollback        # Rollback migrations
php artisan db:seed                # Seed database

# Cache
php artisan cache:clear            # Clear application cache
php artisan config:clear           # Clear config cache
php artisan route:clear            # Clear route cache

# Queue
php artisan queue:work             # Start queue worker
php artisan queue:failed           # List failed jobs

# Development
php artisan serve                  # Start development server
php artisan tinker                 # Interactive shell
```

### NPM Scripts
```bash
npm run dev                        # Start Vite dev server
npm run build                      # Production build
npm run build:ssr                  # SSR build
npm run lint                       # Lint JavaScript/TypeScript
npm run type-check                 # TypeScript type checking
```

### Composer Scripts
```bash
composer run setup                 # Initial project setup
composer run dev                   # Start all development services
composer run test                  # Run test suite
composer run lint                  # Format code with Pint
```

## Troubleshooting

### Common Issues

#### Permission Errors
```bash
# Fix storage permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### Database Connection Issues
```bash
# Check database file exists (SQLite)
ls -la database/database.sqlite

# Test database connection
php artisan migrate:status
```

#### Asset Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

#### Cache Issues
```bash
# Clear all caches
php artisan optimize:clear
```

### Performance Optimization

#### Production Setup
```bash
# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --optimize-autoloader --no-dev
```

#### Database Optimization
```bash
# Add database indexes (if needed)
php artisan make:migration add_indexes_to_transactions_table
```

## Deployment

### Production Checklist
- [ ] Set `APP_ENV=production` and `APP_DEBUG=false`
- [ ] Configure production database
- [ ] Set up proper mail configuration
- [ ] Configure queue driver (Redis/Database)
- [ ] Set up SSL certificate
- [ ] Configure web server (Nginx/Apache)
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Run security audit

### Environment Variables
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password

# Queue
QUEUE_CONNECTION=redis
REDIS_HOST=your-redis-host

# Cache
CACHE_DRIVER=redis
SESSION_DRIVER=redis
```

## Support

### Documentation
- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Getting Help
1. Check the documentation in the `docs/` folder
2. Review existing issues and tests
3. Check Laravel and Inertia.js documentation
4. Create an issue with detailed information

### Development Guidelines
- Follow PSR-12 coding standards for PHP
- Use TypeScript for all frontend code
- Write tests for new features
- Follow conventional commit messages
- Keep documentation updated
