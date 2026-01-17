<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransportFactory;

class CustomMailServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->app['mail.manager']->extend('smtp', function ($config) {
            $factory = new EsmtpTransportFactory();
            
            // Use smtps for SSL (port 465), smtp+tls for STARTTLS (port 587)
            $scheme = isset($config['encryption']) && $config['encryption'] === 'ssl' ? 'smtps' : 'smtp';
            if ($scheme === 'smtp' && isset($config['encryption']) && $config['encryption'] === 'tls') {
                $scheme = 'smtp';
            }

            $dsn = new Dsn(
                $scheme,
                $config['host'],
                $config['username'] ?? null,
                $config['password'] ?? null,
                $config['port'] ?? 25,
                [
                    'verify_peer' => '0',
                    'allow_self_signed' => '1',
                ]
            );

            return $factory->create($dsn);
        });
    }
}
