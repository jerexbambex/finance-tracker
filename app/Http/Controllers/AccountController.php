<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AccountController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $accounts = auth()->user()->accounts()->withCount('transactions')->get();

        return Inertia::render('accounts/Index', [
            'accounts' => $accounts,
            'currencies' => collect(\App\Currency::cases())->map(fn ($currency) => [
                'value' => $currency->value,
                'label' => $currency->label(),
                'symbol' => $currency->symbol(),
            ]),
        ]);
    }

    public function create()
    {
        return Inertia::render('accounts/Create', [
            'currencies' => collect(\App\Currency::cases())->map(fn ($currency) => [
                'value' => $currency->value,
                'label' => $currency->label(),
                'symbol' => $currency->symbol(),
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:checking,savings,credit_card,investment,cash',
            'balance' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'description' => 'nullable|string',
        ]);

        $openingBalance = (float) $validated['balance'];
        // Start at zero; the opening-balance transaction (below) populates it via the
        // observer, so the ledger reconstructs from transactions for account #1 onward.
        $validated['balance'] = 0;

        DB::transaction(function () use ($validated, $openingBalance) {
            $account = auth()->user()->accounts()->create($validated);

            if ($openingBalance > 0) {
                $account->transactions()->create([
                    'user_id' => auth()->id(),
                    'type' => 'opening',
                    'amount' => $openingBalance,
                    'currency' => $account->currency,
                    'description' => 'Opening balance',
                    'transaction_date' => now(),
                ]);
            }
        });

        return redirect()->route('accounts.index');
    }

    public function show(Account $account)
    {
        $this->authorize('view', $account);

        $account->load(['transactions' => function ($query) {
            $query->with('category')->latest('transaction_date');
        }]);

        return Inertia::render('accounts/Show', [
            'account' => $account,
        ]);
    }

    public function edit(Account $account)
    {
        $this->authorize('update', $account);

        return Inertia::render('accounts/Edit', [
            'account' => $account,
            'currencies' => collect(\App\Currency::cases())->map(fn ($currency) => [
                'value' => $currency->value,
                'label' => $currency->label(),
                'symbol' => $currency->symbol(),
            ]),
        ]);
    }

    public function update(Request $request, Account $account)
    {
        $this->authorize('update', $account);

        // balance is intentionally NOT editable — it is derived from the transaction
        // ledger by TransactionObserver. To correct it, add/adjust transactions.
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:checking,savings,credit_card,investment,cash',
            'currency' => 'string|size:3',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $account->update($validated);

        return redirect()->route('accounts.index');
    }

    public function destroy(Account $account)
    {
        $this->authorize('delete', $account);

        $account->delete();

        return redirect()->route('accounts.index');
    }
}
