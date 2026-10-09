<?php

use App\Filament\Resources\ActivityLogs\ActivityResource;
use Jacobtims\FilamentLogger\Loggers\AccessLogger;
use Jacobtims\FilamentLogger\Loggers\ModelLogger;
use Jacobtims\FilamentLogger\Loggers\NotificationLogger;
use Jacobtims\FilamentLogger\Loggers\ResourceLogger;

return [
    'datetime_format' => 'd/m/Y H:i:s',
    'date_format' => 'd/m/Y',

    'activity_resource' => ActivityResource::class,
    'scoped_to_tenant' => true,
    'navigation_sort' => null,

    'resources' => [
        'enabled' => true,
        'log_name' => 'Resource',
        'logger' => ResourceLogger::class,
        'color' => 'success',

        'exclude' => [
            // App\Filament\Resources\UserResource::class,
        ],
        'cluster' => null,
        'navigation_group' => 'Administration',
    ],

    'access' => [
        'enabled' => true,
        'logger' => AccessLogger::class,
        'color' => 'danger',
        'log_name' => 'Access',
    ],

    'notifications' => [
        'enabled' => true,
        'logger' => NotificationLogger::class,
        'color' => null,
        'log_name' => 'Notification',
    ],

    'models' => [
        'enabled' => true,
        'log_name' => 'Model',
        'color' => 'warning',
        'logger' => ModelLogger::class,
        'register' => [
            // App\Models\User::class,
        ],
    ],

    'custom' => [
        // [
        //     'log_name' => 'Custom',
        //     'color' => 'primary',
        // ]
    ],
];
