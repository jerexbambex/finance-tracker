<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $accounts = auth()->user()->accounts()->with('transactions')->get();

        return Inertia::render('accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function create()
    {
        return Inertia::render('accounts/Create');
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

        auth()->user()->accounts()->create($validated);

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
        ]);
    }

    public function update(Request $request, Account $account)
    {
        $this->authorize('update', $account);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:checking,savings,credit_card,investment,cash',
            'balance' => 'required|numeric|min:0',
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
