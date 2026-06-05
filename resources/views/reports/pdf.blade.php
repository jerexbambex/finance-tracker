@php
    /** Format an amount with its currency symbol. */
    $fmt = function ($amount, $currency) use ($currencies) {
        $symbol = $currencies[$currency]['symbol'] ?? '';
        return $symbol . number_format((float) $amount, 2);
    };

    $rangeLabel = \Illuminate\Support\Carbon::parse($startDate)->format('M j, Y')
        . ' – ' . \Illuminate\Support\Carbon::parse($endDate)->format('M j, Y');

    // Currencies present across income + expense for the summary
    $summaryCurrencies = collect($totalIncomeByCurrency->keys())
        ->merge($totalExpenseByCurrency->keys())
        ->unique()
        ->values();
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Financial Report</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #1c1f25;
            font-size: 12px;
            margin: 0;
            padding: 0;
        }
        .header {
            border-bottom: 3px solid #00b8a6;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header h1 { font-size: 22px; margin: 0 0 4px; color: #0a0c10; }
        .header .range { font-size: 13px; color: #444; margin: 0; }
        .header .generated { font-size: 10px; color: #888; margin: 2px 0 0; }
        .brand { float: right; font-size: 13px; font-weight: bold; color: #00b8a6; }

        h2 {
            font-size: 14px;
            color: #0a0c10;
            margin: 22px 0 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e3e6e4;
        }

        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th {
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #757b83;
            padding: 6px 8px;
            border-bottom: 1px solid #d7dad8;
        }
        td {
            padding: 6px 8px;
            border-bottom: 1px solid #f0f1f0;
        }
        td.num, th.num { text-align: right; font-family: DejaVu Sans Mono, monospace; }
        tr.total td { border-top: 2px solid #d7dad8; font-weight: bold; border-bottom: none; }

        .summary-card {
            display: inline-block;
            width: 100%;
            margin-bottom: 10px;
        }
        .pos { color: #0a8f7f; }
        .neg { color: #d62b4c; }
        .muted { color: #888; }
        .empty { color: #999; font-style: italic; padding: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <span class="brand">Budget App</span>
        <h1>Financial Report</h1>
        <p class="range">{{ $rangeLabel }}</p>
        <p class="generated">Generated {{ $generatedAt->format('M j, Y \a\t g:i A') }}</p>
    </div>

    <h2>Summary</h2>
    @if ($summaryCurrencies->isEmpty())
        <p class="empty">No income or expenses in this period.</p>
    @else
        <table>
            <thead>
                <tr>
                    <th>Currency</th>
                    <th class="num">Income</th>
                    <th class="num">Expenses</th>
                    <th class="num">Net</th>
                    <th class="num">Avg / Day</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($summaryCurrencies as $cur)
                    @php
                        $income = $totalIncomeByCurrency[$cur] ?? 0;
                        $expense = $totalExpenseByCurrency[$cur] ?? 0;
                        $net = $income - $expense;
                        $avg = $avgDailySpendingByCurrency[$cur] ?? 0;
                    @endphp
                    <tr>
                        <td>{{ $currencies[$cur]['label'] ?? $cur }}</td>
                        <td class="num pos">{{ $fmt($income, $cur) }}</td>
                        <td class="num neg">{{ $fmt($expense, $cur) }}</td>
                        <td class="num {{ $net >= 0 ? 'pos' : 'neg' }}">{{ $fmt($net, $cur) }}</td>
                        <td class="num muted">{{ $fmt($avg, $cur) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <h2>Spending by Category</h2>
    @if ($categorySpending->isEmpty())
        <p class="empty">No spending recorded in this period.</p>
    @else
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th class="num">Transactions</th>
                    <th class="num">Amount</th>
                    <th class="num">Share</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($categorySpending as $row)
                    <tr>
                        <td>{{ $row['category'] }} <span class="muted">({{ $row['currency'] }})</span></td>
                        <td class="num">{{ $row['count'] }}</td>
                        <td class="num">{{ $fmt($row['amount'], $row['currency']) }}</td>
                        <td class="num muted">{{ number_format($row['percentage'], 0) }}%</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <h2>Spending by Account</h2>
    @if ($accountSpending->isEmpty())
        <p class="empty">No account activity in this period.</p>
    @else
        <table>
            <thead>
                <tr>
                    <th>Account</th>
                    <th class="num">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($accountSpending as $row)
                    <tr>
                        <td>{{ $row['account'] }}</td>
                        <td class="num">{{ $fmt($row['amount'], $row['currency']) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
</body>
</html>
