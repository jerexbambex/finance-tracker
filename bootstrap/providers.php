<?php

use App\Providers\AppServiceProvider;
use App\Providers\CustomMailServiceProvider;
use App\Providers\Filament\AdminPanelProvider;
use App\Providers\FortifyServiceProvider;

return [
    AppServiceProvider::class,
    CustomMailServiceProvider::class,
    AdminPanelProvider::class,
    FortifyServiceProvider::class,
];
