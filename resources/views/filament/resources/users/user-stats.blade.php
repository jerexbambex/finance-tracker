<div class="flex gap-4 text-sm">
    <div class="flex items-center gap-2">
        <x-filament::badge color="success">{{ $accounts }}</x-filament::badge>
        <span class="text-gray-600 dark:text-gray-400">Accounts</span>
    </div>
    <div class="flex items-center gap-2">
        <x-filament::badge color="primary">{{ $transactions }}</x-filament::badge>
        <span class="text-gray-600 dark:text-gray-400">Transactions</span>
    </div>
    <div class="flex items-center gap-2">
        <x-filament::badge color="warning">{{ $budgets }}</x-filament::badge>
        <span class="text-gray-600 dark:text-gray-400">Budgets</span>
    </div>
    <div class="flex items-center gap-2">
        <x-filament::badge color="info">{{ $goals }}</x-filament::badge>
        <span class="text-gray-600 dark:text-gray-400">Goals</span>
    </div>
</div>
