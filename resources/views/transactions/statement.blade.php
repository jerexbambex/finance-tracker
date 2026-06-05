@php
    $fmt = function ($amount, $currency) use ($currencies) {
        $symbol = $currencies[$currency]['symbol'] ?? '';
        return $symbol . number_format((float) $amount, 2);
    };

    if ($dateFrom || $dateTo) {
        $from = $dateFrom ? \Illuminate\Support\Carbon::parse($dateFrom)->format('M j, Y') : 'Beginning';
        $to = $dateTo ? \Illuminate\Support\Carbon::parse($dateTo)->format('M j, Y') : 'Today';
        $rangeLabel = $from . ' – ' . $to;
    } else {
        $rangeLabel = 'All transactions';
    }
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Transaction Statement</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; color: #1c1f25; font-size: 11px; margin: 0; }
        .header { border-bottom: 3px solid #00b8a6; padding-bottom: 12px; margin-bottom: 16px; }
        .header h1 { font-size: 20px; margin: 0 0 4px; color: #0a0c10; }
        .header .meta { font-size: 12px; color: #444; margin: 0; }
        .header .generated { font-size: 10px; color: #888; margin: 2px 0 0; }
        .brand { float: right; font-size: 13px; font-weight: bold; color: #00b8a6; }

        table { width: 100%; border-collapse: collapse; }
        thead { display: table-header-group; }
        th {
            text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em;
            color: #757b83; padding: 6px 8px; border-bottom: 1px solid #d7dad8;
        }
        td { padding: 5px 8px; border-bottom: 1px solid #f0f1f0; }
        td.num, th.num { text-align: right; font-family: DejaVu Sans Mono, monospace; }
        tr { page-break-inside: avoid; }

        .type { font-size: 9px; text-transform: uppercase; letter-spacing: 0.03em; color: #757b83; }
        .pos { color: #0a8f7f; }
        .neg { color: #d62b4c; }
        .muted { color: #999; }

        h2 { font-size: 13px; color: #0a0c10; margin: 20px 0 8px; }
        .totals { width: 60%; }
        .totals td { padding: 5px 8px; }
        .totals tr.net td { border-top: 2px solid #d7dad8; font-weight: bold; }
        .empty { color: #999; font-style: italic; padding: 12px 0; }
    </style>
</head>
<body>
    <div class="header">
        <span class="brand">Budget App</span>
        <h1>Transaction Statement</h1>
        <p class="meta">
            {{ $rangeLabel }}
            @if ($accountName) &nbsp;·&nbsp; Account: {{ $accountName }} @endif
            @if ($typeFilter) &nbsp;·&nbsp; {{ ucfirst($typeFilter) }} only @endif
        </p>
        <p class="generated">Generated {{ $generatedAt->format('M j, Y \a\t g:i A') }} · {{ number_format($rowCount) }} transaction(s)</p>
    </div>

    @if ($transactions->isEmpty())
        <p class="empty">No transactions match the selected filters.</p>
    @else
        @if ($truncated)
            <p class="empty">Showing the first {{ number_format($rowLimit) }} of {{ number_format($rowCount) }} transactions. Narrow the date range to see the rest. Totals below cover all {{ number_format($rowCount) }}.</p>
        @endif
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Account</th>
                    <th class="num">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($transactions as $t)
                    @php
                        $currency = $t->account->currency ?? 'USD';
                        $sign = $t->type === 'expense' ? '-' : ($t->type === 'income' ? '+' : '');
                        $amtClass = $t->type === 'expense' ? 'neg' : ($t->type === 'income' ? 'pos' : 'muted');
                    @endphp
                    <tr>
                        <td>{{ $t->transaction_date->format('M j, Y') }}</td>
                        <td>
                            {{ $t->description ?: '—' }}
                            <span class="type">· {{ $t->type }}</span>
                        </td>
                        <td>{{ $t->category?->name ?? 'Uncategorized' }}</td>
                        <td>{{ $t->account?->name ?? '—' }}</td>
                        <td class="num {{ $amtClass }}">{{ $sign }}{{ $fmt($t->amount, $currency) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <h2>Totals</h2>
        @foreach ($totals as $currency => $sums)
            @php $net = $sums['income'] - $sums['expense']; @endphp
            <table class="totals">
                <tr>
                    <td>{{ $currencies[$currency]['label'] ?? $currency }} — Income</td>
                    <td class="num pos">{{ $fmt($sums['income'], $currency) }}</td>
                </tr>
                <tr>
                    <td>Expenses</td>
                    <td class="num neg">{{ $fmt($sums['expense'], $currency) }}</td>
                </tr>
                <tr class="net">
                    <td>Net</td>
                    <td class="num {{ $net >= 0 ? 'pos' : 'neg' }}">{{ $fmt($net, $currency) }}</td>
                </tr>
            </table>
        @endforeach
    @endif
</body>
</html>
