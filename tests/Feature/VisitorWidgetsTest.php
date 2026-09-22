<?php

use App\Filament\Widgets\TopPages;
use App\Filament\Widgets\VisitorStats;
use App\Filament\Widgets\VisitsTrend;
use App\Models\PageVisit;
use App\Models\User;
use Filament\Facades\Filament;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('admin', 'web');
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);
    Filament::setCurrentPanel(Filament::getPanel('admin'));
});

it('renders the visitor stats widget', function () {
    PageVisit::insert([
        ['path' => '/dashboard', 'route_name' => 'dashboard', 'visitor_hash' => str_repeat('a', 64), 'is_authenticated' => true, 'visited_at' => now()],
        ['path' => '/', 'route_name' => 'home', 'visitor_hash' => str_repeat('b', 64), 'is_authenticated' => false, 'visited_at' => now()],
    ]);

    Livewire::test(VisitorStats::class)->assertOk();
});

it('renders the visits trend widget', function () {
    PageVisit::create(['path' => '/dashboard', 'route_name' => 'dashboard', 'visitor_hash' => str_repeat('a', 64), 'is_authenticated' => true, 'visited_at' => now()]);

    Livewire::test(VisitsTrend::class)->assertOk();
});

it('renders the top pages widget and aggregates visits per path', function () {
    PageVisit::insert([
        ['path' => '/dashboard', 'route_name' => 'dashboard', 'visitor_hash' => str_repeat('a', 64), 'is_authenticated' => true, 'visited_at' => now()],
        ['path' => '/dashboard', 'route_name' => 'dashboard', 'visitor_hash' => str_repeat('b', 64), 'is_authenticated' => true, 'visited_at' => now()],
    ]);

    $record = PageVisit::query()
        ->selectRaw('MIN(id) as id, path, route_name, COUNT(*) as visits, COUNT(DISTINCT visitor_hash) as visitors')
        ->groupBy('path', 'route_name')
        ->first();

    Livewire::test(TopPages::class)
        ->assertOk()
        ->assertTableColumnStateSet('visits', 2, record: $record)
        ->assertTableColumnStateSet('visitors', 2, record: $record);
});
