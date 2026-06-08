<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Balances & cash flow by currency</x-slot>
        <x-slot name="description">This month — amounts are kept per currency (no conversion)</x-slot>

        @php($rows = $this->getRows())

        @if (empty($rows))
            <p class="text-sm text-gray-500 dark:text-gray-400">No account or transaction data yet.</p>
        @else
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                @foreach ($rows as $row)
                    <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                        <div class="mb-3 flex items-center justify-between">
                            <x-filament::badge color="gray">{{ $row['currency'] }}</x-filament::badge>
                            <span class="text-xs text-gray-400">Balance</span>
                        </div>

                        <p class="mb-3 text-2xl font-bold tabular-nums text-gray-950 dark:text-white">
                            {{ $row['balance'] }}
                        </p>

                        <dl class="space-y-1.5 text-sm">
                            <div class="flex items-center justify-between">
                                <dt class="text-gray-500 dark:text-gray-400">Income</dt>
                                <dd class="tabular-nums font-medium text-success-600 dark:text-success-400">{{ $row['income'] }}</dd>
                            </div>
                            <div class="flex items-center justify-between">
                                <dt class="text-gray-500 dark:text-gray-400">Expenses</dt>
                                <dd class="tabular-nums font-medium text-danger-600 dark:text-danger-400">{{ $row['expense'] }}</dd>
                            </div>
                            <div class="flex items-center justify-between border-t border-gray-100 pt-1.5 dark:border-white/10">
                                <dt class="font-medium text-gray-700 dark:text-gray-200">Net</dt>
                                <dd @class([
                                    'tabular-nums font-semibold',
                                    'text-success-600 dark:text-success-400' => $row['net_positive'],
                                    'text-danger-600 dark:text-danger-400' => ! $row['net_positive'],
                                ])>{{ $row['net'] }}</dd>
                            </div>
                        </dl>
                    </div>
                @endforeach
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
