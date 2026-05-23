<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Lab404\Impersonate\Models\Impersonate;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, HasUuids, Impersonate, LogsActivity, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'password',
        'email_verified_at',
        'goal',
        'biometric_enabled',
        'biometric_token_hash',
        'subscription_tier',
        'premium_since',
        'subscription_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
        'biometric_token_hash',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'premium_since' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'biometric_enabled' => 'boolean',
        ];
    }

    public function refreshTokens(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RefreshToken::class);
    }

    public function settings(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UserSettings::class);
    }

    /**
     * The account API-created transactions are attached to.
     *
     * Web users create accounts explicitly; mobile users don't model
     * accounts at all (see Flutter Transaction model). This returns the
     * user's first active account, creating a default "Personal" cash
     * account on first use so account_id remains NOT NULL.
     */
    public function defaultAccount(): Account
    {
        $existing = $this->accounts()->where('is_active', true)->orderBy('created_at')->first();

        if ($existing !== null) {
            return $existing;
        }

        return $this->accounts()->create([
            'name' => 'Personal',
            'type' => 'cash',
            'balance' => 0,
            'currency' => 'USD',
            'is_active' => true,
        ]);
    }

    public function isPremium(): bool
    {
        if ($this->subscription_tier !== 'premium') {
            return false;
        }

        return $this->subscription_expires_at === null
            || $this->subscription_expires_at->isFuture();
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function testimonials()
    {
        return $this->hasMany(Testimonial::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }

    public function recurringTransactions()
    {
        return $this->hasMany(RecurringTransaction::class);
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }

    public function savedFilters()
    {
        return $this->hasMany(SavedFilter::class);
    }

    public function canAccessPanel(Panel $panel): bool
    {
        // Allow if user has admin role OR if someone is impersonating (the impersonator has admin access)
        if ($this->isImpersonated()) {
            return true;
        }

        return $this->hasRole('admin') || $this->hasRole('super_admin');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'email_verified_at'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
