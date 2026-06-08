<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Balances & cash flow by currency</x-slot>
        <x-slot name="description">This month — amounts are kept per currency (no conversion)</x-slot>

        @php($rows = $this->getRows())

        @if (empty($rows))
            <p style="font-size:.875rem;color:#6b7280;">No account or transaction data yet.</p>
        @else
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;">
                    <thead>
                        <tr style="text-align:right;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;">
                            <th style="text-align:left;padding:.5rem 1rem .5rem 0;font-weight:600;">Currency</th>
                            <th style="padding:.5rem 1.5rem;font-weight:600;">Balance</th>
                            <th style="padding:.5rem 1.5rem;font-weight:600;">Income</th>
                            <th style="padding:.5rem 1.5rem;font-weight:600;">Expenses</th>
                            <th style="padding:.5rem 0 .5rem 1.5rem;font-weight:600;">Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($rows as $row)
                            <tr style="border-top:1px solid rgba(128,128,128,.18);">
                                <td style="padding:.7rem 1rem .7rem 0;">
                                    <x-filament::badge color="gray">{{ $row['currency'] }}</x-filament::badge>
                                </td>
                                <td style="text-align:right;padding:.7rem 1.5rem;font-weight:600;white-space:nowrap;">{{ $row['balance'] }}</td>
                                <td style="text-align:right;padding:.7rem 1.5rem;white-space:nowrap;color:#16a34a;">{{ $row['income'] }}</td>
                                <td style="text-align:right;padding:.7rem 1.5rem;white-space:nowrap;color:#dc2626;">{{ $row['expense'] }}</td>
                                <td style="text-align:right;padding:.7rem 0 .7rem 1.5rem;white-space:nowrap;font-weight:700;color:{{ $row['net_positive'] ? '#16a34a' : '#dc2626' }};">{{ $row['net'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
