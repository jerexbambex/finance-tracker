<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Balances & cash flow by currency</x-slot>
        <x-slot name="description">This month — amounts are kept per currency (no conversion)</x-slot>

        @php($rows = $this->getRows())

        @if (empty($rows))
            <p class="text-sm text-gray-500 dark:text-gray-400">No account or transaction data yet.</p>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            <th class="py-2 pr-4 font-medium">Currency</th>
                            <th class="py-2 px-4 font-medium text-right">Balance</th>
                            <th class="py-2 px-4 font-medium text-right">Income</th>
                            <th class="py-2 px-4 font-medium text-right">Expenses</th>
                            <th class="py-2 pl-4 font-medium text-right">Net</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/10">
                        @foreach ($rows as $row)
                            <tr>
                                <td class="py-2 pr-4">
                                    <x-filament::badge color="gray">{{ $row['currency'] }}</x-filament::badge>
                                </td>
                                <td class="py-2 px-4 text-right font-medium tabular-nums">{{ $row['balance'] }}</td>
                                <td class="py-2 px-4 text-right tabular-nums text-success-600 dark:text-success-400">{{ $row['income'] }}</td>
                                <td class="py-2 px-4 text-right tabular-nums text-danger-600 dark:text-danger-400">{{ $row['expense'] }}</td>
                                <td @class([
                                    'py-2 pl-4 text-right font-semibold tabular-nums',
                                    'text-success-600 dark:text-success-400' => $row['net_positive'],
                                    'text-danger-600 dark:text-danger-400' => ! $row['net_positive'],
                                ])>{{ $row['net'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
